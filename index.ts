import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as asset from "@pulumi/pulumi/asset";

// ---------------------------------------------------------
// 1. S3 Bucket
// ---------------------------------------------------------
const siteBucket = new aws.s3.Bucket("ravi-static-bucket-101002870", {
    bucket: "ravi-static-bucket-101002870",
});

// ---------------------------------------------------------
// 2. Upload index.html
// ---------------------------------------------------------
const siteContent = new aws.s3.BucketObject("index.html", {
    bucket: siteBucket.bucket,
    source: new asset.FileAsset("index.html"),
    contentType: "text/html",
});

// ---------------------------------------------------------
// 3. CloudFront Distribution (COMPATIBLE WITH YOUR AWS VERSION)
// ---------------------------------------------------------
const cdn = new aws.cloudfront.Distribution("ravi-static-distribution", {
    enabled: true,

    comment: "Static website distribution",   // << REQUIRED FIELD

    origins: [
        {
            originId: "s3-origin",
            domainName: siteBucket.bucketRegionalDomainName,
            s3OriginConfig: {
                originAccessIdentity: "",
            },
        },
    ],

    defaultCacheBehavior: {
        targetOriginId: "s3-origin",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],

        forwardedValues: {
            cookies: { forward: "none" },
            queryString: false,
        },
    },

    // REQUIRED BY YOUR PROVIDER VERSION
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },

    priceClass: "PriceClass_100",

    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

// ---------------------------------------------------------
// 4. Outputs
// ---------------------------------------------------------
export const bucketName = siteBucket.bucket;
export const cloudfrontUrl = cdn.domainName;
