import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";

/**
 * R2 is S3-API-compatible, so the AWS SDK works against it directly — just
 * point the endpoint at the account's R2 URL and use "auto" as the region.
 * Server-only: these credentials must never reach the browser.
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});
