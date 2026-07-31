"use server";

import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";

import { r2Client } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES
} from "@/features/listings/constants/listing-options";

export interface ImageUploadRequest {
  /** Original filename — only used to preserve the extension. */
  name: string;
  type: string;
  size: number;
}

export interface ImageUploadSlot {
  /** Presigned URL the browser PUTs the file bytes to directly. */
  uploadUrl: string;
  /** Final public URL to store on the listing once the upload succeeds. */
  publicUrl: string;
}

export interface GetUploadUrlsResult {
  slots?: ImageUploadSlot[];
  error?: string;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Issues one short-lived presigned PUT URL per requested file so the browser
 * can upload straight to R2 — credentials never leave the server.
 */
export async function getListingImageUploadUrls(
  files: ImageUploadRequest[]
): Promise<GetUploadUrlsResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  if (files.length === 0 || files.length > MAX_LISTING_IMAGES) {
    return { error: `You can upload between 1 and ${MAX_LISTING_IMAGES} photos.` };
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: `${file.name} isn't a supported image type.` };
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return { error: `${file.name} is over 5MB. Choose a smaller photo.` };
    }
  }

  const slots = await Promise.all(
    files.map(async (file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const key = `listings/${user.id}/${randomUUID()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: file.type
      });

      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
      const publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

      return { uploadUrl, publicUrl };
    })
  );

  return { slots };
}
