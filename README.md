# Vue Express Template

#### Project setup
```
npm install
```

#### Run these two commands simultaneously for development
```
npm run vue_local
npm run api_local
```

#### Deploying to development
```
npm run build_dev
npm run api_dev
```

#### Deploying to production
```
npm run build_prod
npm run api_prod
```

#### Useful browser libraries
```
jQuery v3.4.1
https://code.jquery.com/
https://code.jquery.com/jquery-3.4.1.min.js

Shadow animation jQuery plugin v1.11.0
https://github.com/edwinm/Shadow-animation-jQuery-plugin
https://github.com/edwinm/Shadow-animation-jQuery-plugin/blob/master/jquery.animate-shadow-min.js

https://jqueryui.com/download/
Create your own custom .js file

JS Cookie v2.2.0
https://github.com/js-cookie/js-cookie
https://github.com/js-cookie/js-cookie/blob/latest/src/js.cookie.js

Moment v2.24.0
https://momentjs.com/
https://momentjs.com/downloads/moment.js

Moment Timezone v0.5.25
https://momentjs.com/timezone/
https://momentjs.com/downloads/moment-timezone-with-data.js

Axios v0.19.0
https://github.com/axios/axios
https://github.com/axios/axios/blob/master/dist/axios.min.js
```

1. Route 53
2. Certificate Manager
3. Create an S3 bucket: example.com
   Permissions -> Bucket Policy
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::example.com/*"
        }
    ]
}
```

4. Create a CloudFront distribution (Web)
   Origin Domain Name: example.com.s3-website-us-west-2.amazonaws.com
   Origin ID: example.com
   Alternate Domain Names (CNAMEs): example.com
   SSL Certificate: Custom SSL Certificate -> example.com
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Compress Objects Automatically: Yes
   Create Custom Error Response:
     -> HTTP Error Code: 404
     -> Customize Error Response: Yes
     -> Response Page Path: /index.html
     -> HTTP Response Code: 200

Route 53 => List => ListHostedZonesByName
Route 53 => Write => ChangeResourceRecordSets
Certificate Manager => List => ListCertificates
Certificate Manager => Read => DescribeCertificate
Certificate Manager => Write => RequestCertificate
S3 => List => ListAllMyBuckets
S3 => Read => GetBucketWebsite
S3 => Read => GetObject
S3 => Write => CreateBucket
S3 => Write => PutBucketWebsite
S3 => Write => PutObject
S3 => Write => DeleteObject
S3 => Permissions management => PutBucketPolicy
CloudFront => Write => CreateDistribution
