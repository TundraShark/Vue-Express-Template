const fs = require("fs");
const aws = require("aws-sdk");
const path = require("path");
const util = require("util");
const mime = require("mime");
const data = require("js-yaml").safeLoad(fs.readFileSync("config.yml", "utf-8"));
const sleep = util.promisify(setTimeout);
const readdir = util.promisify(fs.readdir);
const exec = util.promisify(require("child_process").exec);

const region          = data["aws"]["region"];
const accessKeyId     = data["aws"]["accessKeyId"];
const secretAccessKey = data["aws"]["secretAccessKey"];
const domainName      = data["aws"]["domainName"];
const bucketName      = data["aws"]["bucketName"];

aws.config = new aws.Config({
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

// AWS SDK libraries
let acm        = new aws.ACM({region: "us-east-1"});
let route53    = new aws.Route53();
let s3         = new aws.S3();
let cloudfront = new aws.CloudFront();

// Misc
let hostedZoneId = null;
let currentRecordAlias = null;
let cloudFrontDomainName = null;
let cloudFrontDistributionId = null;
let certificate = {arn: null, status: null, type: null, name: null, value: null};

async function GetRoute53HostedZoneIdFromDomainName() {
  let result;

  try {
    result = await route53.listHostedZonesByName({DNSName: domainName}).promise();
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

  hostedZoneId = hostedZone["Id"].split("/hostedzone/")[1];

  try {
    result = await route53.listResourceRecordSets({HostedZoneId: hostedZoneId, StartRecordName: domainName, StartRecordType: "A"}).promise();
  } catch(error) {
    console.log("ERROR: Getting Route53 information");
    console.log(error);
    process.exit();
  }

  let resourceRecordSet = result["ResourceRecordSets"][0];

  if(resourceRecordSet["Name"] == `${domainName}.` && resourceRecordSet["Type"] == "A") { // AWS puts an extra period (.) at the end of every domain name
    let aliasTarget = resourceRecordSet["AliasTarget"];

    if(aliasTarget == undefined) {
      currentRecordAlias = "BAD_ALIAS";
    } else {
      currentRecordAlias = aliasTarget["DNSName"];
    }
  }
}

async function CheckCertificate() {
  let result;
  let certificateArn;

  try {
    result = await acm.listCertificates({MaxItems: 1000}).promise();
  } catch(error) {
    console.log("ERROR: Checking SSL certificates");
    console.log(error);
    process.exit();
  }

  for(let obj of result["CertificateSummaryList"]) {
    if(obj["DomainName"] == domainName) {
      certificate["arn"] = obj["CertificateArn"];
      break;
    }
  }

  // Create the certificate if it wasn't found
  if(certificate["arn"] == null) {
    process.stdout.write("Creating a new certificate... ");

    try {
      result = await acm.requestCertificate({"DomainName": domainName, "ValidationMethod": "DNS"}).promise();
    } catch(error) {
      console.log("ERROR: Requesting a new SSL certificate");
      console.log(error);
      process.exit();
    }

    certificate["arn"] = result["CertificateArn"];
    console.log("done");
    process.stdout.write("Waiting for the resource records... ");

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

      if("ResourceRecord" in result["Certificate"]["DomainValidationOptions"][0]) {
        let validationOptions = result["Certificate"]["DomainValidationOptions"][0];
        certificate["status"] = validationOptions["ValidationStatus"]; // PENDING_VALIDATION, SUCCESS, FAILED
        certificate["type"]   = validationOptions["ResourceRecord"]["Type"];
        certificate["name"]   = validationOptions["ResourceRecord"]["Name"];
        certificate["value"]  = validationOptions["ResourceRecord"]["Value"];
        break;
      } else {
        await sleep(1000); // Wait one second
      }
    }

    console.log("done");
  } else {
    try {
      result = await acm.describeCertificate({CertificateArn: certificate["arn"]}).promise();
    } catch(error) {
      console.log("ERROR: Getting SSL certificate information");
      console.log(error);
      process.exit();
    }

    // No need to check for "ResourceRecord" because the certificate was't just created
    let validationOptions = result["Certificate"]["DomainValidationOptions"][0];
    certificate["status"] = validationOptions["ValidationStatus"]; // PENDING_VALIDATION, SUCCESS, FAILED
    certificate["type"]   = validationOptions["ResourceRecord"]["Type"];
    certificate["name"]   = validationOptions["ResourceRecord"]["Name"];
    certificate["value"]  = validationOptions["ResourceRecord"]["Value"];
  }
}

async function ValidateCertificate() {
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

  if(certificate["status"] == "SUCCESS") {
    return;
  }

  if(certificate["status"] == "FAILED") {
    console.log("ERROR: The SSL certificate is in a FAILED state");
    process.exit();
  }

  if(certificate["status"] == "PENDING_VALIDATION") {
    process.stdout.write("Creating Route 53 record for SSL validation... ");
    await UpdateRoute53Record("CREATE");
    console.log("done");
    process.stdout.write("Waiting for the SSL certificate to be validated... ");

    try {
      await acm.waitFor("certificateValidated", {CertificateArn: certificate["arn"]}).promise();
    } catch(error) {
      console.log("ERROR: Waiting for the SSL certificate to be validated");
      console.log(error);
      process.exit();
    }

    console.log("done");
    process.stdout.write("Deleting Route 53 record for SSL validation... ");
    UpdateRoute53Record("DELETE");
    console.log("done");
  }
}

async function CreateS3Bucket() {
  let result;

  try {
    result = await s3.listBuckets({}).promise();
  } catch(error) {
    console.log("ERROR: Getting S3 buckets");
    console.log(error);
    process.exit();
  }

  for(let bucket of result["Buckets"]) {
    if(bucketName == bucket["Name"]) {
      return; // Bucket already exists
    }
  }

  process.stdout.write("Creating a new bucket... ");

  try {
    result = await s3.createBucket({Bucket: bucketName}).promise();
  } catch(error) {
    console.log("ERROR: Creating an S3 bucket");
    console.log(error);
    process.exit();
  }

  console.log("done");
  process.stdout.write("Setting the bucket's website configuration... ");

  try {
    result = await s3.putBucketWebsite({Bucket: bucketName, WebsiteConfiguration: {IndexDocument: {Suffix: "index.html"}}}).promise();
  } catch(error) {
    console.log("ERROR: Setting an S3 bucket's website configuration");
    console.log(error);
    process.exit();
  }

  console.log("done");
  process.stdout.write("Setting the bucket's policy to be public... ");

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

  console.log("done");
}

async function CreateCloudFrontDistribution() {
  let result;

  try {
    result = await cloudfront.listDistributions().promise();
  } catch(error) {
    console.log("ERROR: Creating CloudFront distribution");
    console.log(error);
    process.exit();
  }

  for(let distribution of result["DistributionList"]["Items"]) {
    for(let aliasICPRecordal of distribution["AliasICPRecordals"]) {
      if(aliasICPRecordal["CNAME"] == domainName) {
        cloudFrontDomainName = distribution["DomainName"];
        cloudFrontDistributionId = distribution["Id"];
        return;
      }
    }
  }

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
            OriginProtocolPolicy: "http-only"
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

  process.stdout.write("Creating CloudFront distribution... ");

  try {
    result = await cloudfront.createDistribution(params).promise();
  } catch(error) {
    console.log("ERROR: Creating CloudFront distribution");
    console.log(error);
    process.exit();
  }

  console.log("done");
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

  if(currentRecordAlias == `${cloudFrontDomainName}.`) {
    return;
  }

  if(currentRecordAlias) {
    process.stdout.write("Deleting current Route 53 record... ");
    console.log("done");
  }

  process.stdout.write("Creating new Route 53 record... ");

  try {
    await route53.changeResourceRecordSets(params).promise();
  } catch(error) {
    console.log("ERROR: Creating a Route 53 record for CloudFront");
    console.log(error);
    process.exit();
  }

  console.log("done");
}

async function New() {
  await GetRoute53HostedZoneIdFromDomainName();
  await CheckCertificate();
  await ValidateCertificate();
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
      Bucket: bucketName,
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

async function Upload() {
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

  let fileCollection = [];
  await ReadDirectory("dist");

  for(let file of fileCollection) {
    let contentType = mime.getType(file);
    let fileName = file.split("\\");

    fileName.shift();
    fileName = fileName.join("/");

    let isDirectory = fs.lstatSync(file).isDirectory();

    if(isDirectory) {
      continue;
    }

    let fileData = fs.readFileSync(file);
    // let fileData = fs.readFileSync(file, "utf-8");
    // let fileData = fs.readFileSync(filePath, "utf-8");

    try {
      await s3.putObject({Bucket: bucketName, Key: fileName, Body: fileData, ContentType: contentType}).promise();
      console.log("Uploaded:", fileName);
    } catch(error) {
      console.log("ERROR: Uploading an object to S3");
      console.log(error);
      process.exit();
    }
  }
}

async function CreateInvalidation() {
  let params = {
    DistributionId: cloudFrontDistributionId,
    InvalidationBatch: {
      CallerReference: (new Date).getTime().toString(),
      Paths: {
        Quantity: 1,
        Items: ["/*"]
      }
    }
  };

  try {
    await cloudfront.createInvalidation(params).promise();
  } catch(error) {
    console.log("ERROR: Creating CloudFront invalidation");
    console.log(error);
    process.exit();
  }
}

async function Main() {
  await New();
  await Update();
  await CreateInvalidation();
}

Main();

// vue-cli-service build --mode production
