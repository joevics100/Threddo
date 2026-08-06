"use server";

import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";

import { r2Client } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export interface GetBlogCoverUploadUrlResult {
  uploadUrl?: string;
  publicUrl?: string;
  error?: string;
}

export async function getBlogCoverUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<GetBlogCoverUploadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "You don't have permission to do that." };
  }

  if (!ALLOWED_TYPES.has(fileType)) {
    return { error: "That file type isn't supported." };
  }
  if (fileSize > MAX_SIZE_BYTES) {
    return { error: "That image is too large." };
  }

  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const key = `blog/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  const publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  return { uploadUrl, publicUrl };
}
