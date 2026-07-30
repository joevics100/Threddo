// One-time setup: run this once after creating the R2 bucket (and again if
// you ever change domains) to allow the browser to PUT directly to presigned
// upload URLs. R2 buckets have no CORS rules by default, which silently
// blocks browser uploads even though server-generated presigned URLs are valid.
//
// Usage:
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET_NAME=... \
//   node scripts/configure-r2-cors.mjs https://threddo.com.ng

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const [siteUrl] = process.argv.slice(2);

if (!siteUrl) {
  console.error("Usage: node scripts/configure-r2-cors.mjs <your-site-url>");
  process.exit(1);
}

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [siteUrl, "http://localhost:3000"],
          AllowedMethods: ["PUT", "GET", "HEAD"],
          AllowedHeaders: ["*"],
          MaxAgeSeconds: 3600
        }
      ]
    }
  })
);

console.log(`R2 bucket CORS configured for ${siteUrl} and http://localhost:3000`);
