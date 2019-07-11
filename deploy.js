// Configurable settings
const accessKeyId     = "x";
const secretAccessKey = "x";
const bucketName      = "mudksssi.ps";
const domainName      = "mudki.ps";
const region          = "us-west-2";

const aws = require("aws-sdk");

aws.config = new aws.Config();
aws.config.region = region;
if(aws.config.credentials) {
  aws.config.credentials.accessKeyId     = accessKeyId;
  aws.config.credentials.secretAccessKey = secretAccessKey;
}
aws.config.accessKeyId     = accessKeyId;
aws.config.secretAccessKey = secretAccessKey;

const fs = require("fs");
const path = require("path");
const util = require("util");
const sleep = util.promisify(setTimeout);
const readdir = util.promisify(fs.readdir);
const exec = util.promisify(require("child_process").exec);

// AWS SDK libraries
let acm        = new aws.ACM({region: "us-east-1"});
let route53    = new aws.Route53();
let s3         = new aws.S3();
let cloudfront = new aws.CloudFront();

// Misc
let cloudFrontDomainName = null;
let hostedZoneId = null;
let certificate = {
  arn   : null,
  status: null,
  type  : null,
  name  : null,
  value : null
};

async function GetRoute53HostedZoneIdFromDomainName() {
  let result;
  let params = {DNSName: domainName};

  try {
    result = await route53.listHostedZonesByName(params).promise();
  } catch(error) {
    console.log("ERROR: Getting Route53 information");
    console.log(error);
    process.exit();
  }

  // First check to see if any hosted zones were even returned
  if(result["HostedZones"].length == 0) {
    console.log("ERROR: Getting Route53 information");
    console.log("No hosted zone was found for the domain name", domainName);
    process.exit();
  }

  let hostedZone = result["HostedZones"][0];

  // It's possible to return a hosted zone that isn't actually the domain name we want
  if(hostedZone["Name"] != `${domainName}.`) { // AWS puts an extra period (.) at the end of every domain name
    console.log("ERROR: Getting Route53 information");
    console.log("No hosted zone was found for the domain name", domainName);
    process.exit();
  }

  // AWS returns a string such as /hostedzone/ABCDEFGHI12345 which has garbage in it that needs to be removed
  hostedZoneId = hostedZone["Id"].split("/hostedzone/")[1];
}

async function RequestCertificate() {
  let result;

  try {
    result = await acm.requestCertificate({"DomainName": domainName, "ValidationMethod": "DNS"}).promise();
  } catch(error) {
    console.log("ERROR: Requesting a new SSL certificate");
    console.log(error);
    process.exit();
  }

  certificate["arn"] = result["CertificateArn"];
}

async function GetCertificateDetails() {
  let result, validationOptions;

  // Since the certificate was just created, it might take a couple seconds for "ResourceRecord"
  // to be populated by AWS, so just keep trying until we get the data that's needed
  while(true) {
    try {
      result = await acm.describeCertificate({CertificateArn: certificate["arn"]}).promise();
    } catch(error) {
      console.log("ERROR: Getting SSL certificate information");
      console.log(error);
      process.exit();
    }

    validationOptions = result["Certificate"]["DomainValidationOptions"][0];

    if(!(ResourceRecord in validationOptions)) {
      await sleep(1000);
      continue;
    }

    certificate["status"] = validationOptions["ValidationStatus"];
    certificate["type"]   = validationOptions["ResourceRecord"]["Type"];
    certificate["name"]   = validationOptions["ResourceRecord"]["Name"];
    certificate["value"]  = validationOptions["ResourceRecord"]["Value"];
    break;
  }
}

async function WaitForCertificateToBeValidated() {
  async function UpdateRoute53Record(action) {
    // action must be either "CREATE" or "DELETE"
    let params = {
      HostedZoneId: hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: action,
          ResourceRecordSet: {
            TTL: 10,
            Type: certificate["type"],
            Name: certificate["name"],
            ResourceRecords: [{
              Value: certificate["value"]
            }]
          }
        }]
      }
    };

    try {
      await route53.changeResourceRecordSets(params).promise();
    } catch(error) {
      console.log("ERROR: Updating a Route 53 record");
      console.log(error);
      process.exit();
    }
  }

  if(certificate["status"] == "PENDING_VALIDATION") {
    console.log("Creating Route 53 record for SSL validation");
    await UpdateRoute53Record("CREATE");
    console.log("Waiting for the SSL certificate to be validated...");

    try {
      await acm.waitFor("certificateValidated", {CertificateArn: certificate["arn"]}).promise();
    } catch(error) {
      console.log("ERROR: Waiting for the SSL certificate to be validated");
      console.log(error);
      process.exit();
    }

    console.log("...validated!");
    console.log("Deleting Route 53 record for SSL validation");
    UpdateRoute53Record("DELETE");
  } else {
    console.log("The SSL certificate is already validated");
  }
}

async function CreateS3Bucket() {
  let result;

  try {
    result = await s3.createBucket({Bucket: bucketName}).promise();
  } catch(error) {
    console.log("ERROR: Creating an S3 bucket");
    // console.log(error);
    // process.exit();
  }

  // Now that the S3 bucket has been created, its website configuration needs to be set

  try {
    result = await s3.putBucketWebsite({Bucket: bucketName, WebsiteConfiguration: {IndexDocument: {Suffix: "index.html"}}}).promise();
  } catch(error) {
    console.log("ERROR: Setting an S3 bucket's website configuration");
    console.log(error);
    process.exit();
  }

  // Set the bucket policy to be publicly accessible

  try {
    let policy = `{
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::${bucketName}/*"
      }]
    }`;
    result = await s3.putBucketPolicy({Bucket: bucketName, Policy: policy}).promise();
  } catch(error) {
    console.log("ERROR: Setting the S3 bucket to be publicly accessible");
    console.log(error);
    process.exit();
  }

  console.log(result);
}

async function CreateCloudFrontDistribution() {
  let result;

  try {
    let params = {
      DistributionConfig: {
        CallerReference: (new Date).getTime().toString(),
        Enabled: true,
        Comment: "",
        ViewerCertificate: {
          ACMCertificateArn: certificate["arn"],
          SSLSupportMethod: "sni-only"
        },
        Aliases: {
          Quantity: 1,
          Items: [domainName]
        },
        Origins: {
          Quantity: 1,
          Items: [{
            DomainName: `${bucketName}.s3-website-${region}.amazonaws.com`,
            Id: domainName,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: "https-only"
            }
          }]
        },
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: "redirect-to-https",
          TargetOriginId: domainName,
          Compress: true,
          MinTTL: 0,
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: "none"
            }
          },
          TrustedSigners: {
            Enabled: false,
            Quantity: 0
          },
        },
        CustomErrorResponses: {
          Quantity: 1,
          Items: [{
            ErrorCode: 404,
            ResponseCode: "200",
            ResponsePagePath: "/index.html"
          }]
        }
      }
    };
    result = await cloudfront.createDistribution(params).promise();
  } catch(error) {
    console.log("ERROR: Creating CloudFront distribution");
    console.log(error);
    process.exit();
  }

  cloudFrontDomainName = result["Distribution"]["DomainName"];
}

async function CreateRoute53RecordForCloudFront() {
  var params = {
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      // Comment: "",
      Changes: [{
        Action: "CREATE",
        ResourceRecordSet: {
          Type: "A",
          Name: domainName,
          AliasTarget: {
            DNSName: cloudFrontDomainName,
            EvaluateTargetHealth: false,
            HostedZoneId: "Z2FDTNDATAQYW2" // CloudFront distributions always use this constant hosted zone ID: Z2FDTNDATAQYW2
          }
        }
      }]
    }
  };

  try {
    await route53.changeResourceRecordSets(params).promise();
  } catch(error) {
    console.log("ERROR: Creating a Route 53 record for CloudFront");
    console.log(error);
    process.exit();
  }
}

async function New() {
  /* 1. Create an SSL certificate
   * 2. Todo
   * 3. Todo
   * 4. Todo
   * 5. Todo
   */
  await GetRoute53HostedZoneIdFromDomainName();
  await RequestCertificate();
  await GetCertificateDetails();
  await WaitForCertificateToBeValidated();
  await CreateS3Bucket();
  await CreateCloudFrontDistribution();
  await CreateRoute53RecordForCloudFront();
}

async function Update() {
  // let {stdout, stderr} = await exec("npm run build_prod");
  // console.log("====================================================================================================");
  // console.log(stdout);
  // console.log("====================================================================================================");

  let data;
  let objects = [];
  let params = {Bucket: bucketName};

  try {
    data = await s3.listObjectsV2(params).promise();
  } catch(error) {
    console.log("ERROR: Reading objects from S3");
    console.log(error);
    process.exit();
  }

  for(let object of data["Contents"]) {
    objects.push({"Key": object["Key"]});
  }

  if(objects.length) {
    params = {
      Bucket: "mudki.ps",
      Delete: {Objects: objects}
    };

    try {
      data = await s3.deleteObjects(params).promise();

      for(let object of data["Deleted"]) {
        console.log("Deleted:", object["Key"]);
      }
    } catch(error) {
      console.log("ERROR: Deleting objects in S3");
      console.log(error);
      process.exit();
    }
  } else {
    console.log(`The bucket ${bucketName} is already empty`);
  }

  await Upload();
}

let fileCollection = [];

async function ReadDirectory(passedInPath) {
  let names = await readdir(passedInPath);

  for(let fileName of names) {
    let filePath = path.join(passedInPath, fileName);
    let isDirectory = fs.lstatSync(filePath).isDirectory();

    if(isDirectory) {
      await ReadDirectory(filePath);
    }

    fileCollection.push(filePath);
  }
}

async function Upload() {
  await ReadDirectory("dist");

  for(let file of fileCollection) {
    // let fileName = path.basename(file);
    let fileName = file.split("\\");
    fileName.shift();
    fileName = fileName.join("/");

    let isDirectory = fs.lstatSync(file).isDirectory();

    if(isDirectory) {
      continue;
    }

    let fileData = fs.readFileSync(file);
    // let fileData = fs.readFileSync(filePath, "utf-8");

    let qwe;
    try {
      await s3.putObject({Bucket: bucketName, Key: fileName, Body: fileData}).promise();
      console.log("Uploaded:", fileName);
    } catch(error) {
      console.log("ERROR: Uploading an object to S3");
      console.log(error);
      process.exit();
    }
  }
}

async function Main() {
  await New();
  // await Update();
}

Main();

// vue-cli-service build --mode production
