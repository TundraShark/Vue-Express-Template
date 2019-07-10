const aws = require("aws-sdk");
const accessKeyId     = "xxxxxxxxxxxxxxxxxxxx";
const secretAccessKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// aws.config                 = new aws.Config();
// aws.config.accessKeyId     = accessKeyId;
// aws.config.secretAccessKey = secretAccessKey;
// aws.config.region = "us-east-1";

// console.log(aws.config.credentials);
// console.log(aws.aws_access_key_id);
// console.log(aws.aws_secret_access_key);
console.log(aws.config.credentials.accessKeyId);
console.log(aws.config.credentials.secretAccessKey);
aws.config.credentials.accessKeyId     = accessKeyId;
aws.config.credentials.secretAccessKey = secretAccessKey;
console.log(aws.config.credentials.accessKeyId);
console.log(aws.config.credentials.secretAccessKey);

let cloudfront = new aws.CloudFront();

let params = {
  CloudFrontOriginAccessIdentityConfig: {
    CallerReference: (new Date).getTime().toString(), // Get milliseconds since the epoch
    Comment: "Just some random comments I need to make"
  }
};

cloudfront.createCloudFrontOriginAccessIdentity(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
