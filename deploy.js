const aws = require("aws-sdk");
const accessKeyId     = "x";
const secretAccessKey = "x";

aws.config                 = new aws.Config();
aws.config.accessKeyId     = accessKeyId;
aws.config.secretAccessKey = secretAccessKey;
// aws.config.region = "us-east-1";

// console.log(aws.config);

// console.log(aws.aws_access_key_id);
// console.log(aws.aws_secret_access_key);
// aws.config.credentials.accessKeyId     = accessKeyId;
// aws.config.credentials.secretAccessKey = secretAccessKey;
// console.log(aws.config.credentials.accessKeyId);
// console.log(aws.config.credentials.secretAccessKey);

let cloudfront = new aws.CloudFront();
let s3 = new aws.S3();

const fs = require("fs");
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const exec = util.promisify(require("child_process").exec);
const bucketName = "mudki.ps";

async function Main() {
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

Main();

// vue-cli-service build --mode production


// let params = {
//   CloudFrontOriginAccessIdentityConfig: {
//     CallerReference: (new Date).getTime().toString(), // Get milliseconds since the epoch
//     Comment: "Just some random comments I need to make"
//   }
// };

// cloudfront.createCloudFrontOriginAccessIdentity(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });
