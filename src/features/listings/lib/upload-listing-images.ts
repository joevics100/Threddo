import { getListingImageUploadUrls } from "@/features/listings/actions/upload.actions";

/**
 * Uploads each file directly to Cloudflare R2 using short-lived presigned
 * URLs issued by the server (credentials never touch the browser), and
 * returns the public URLs in the same order as the input files.
 */
export async function uploadListingImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const { slots, error } = await getListingImageUploadUrls(
    files.map((file) => ({ name: file.name, type: file.type, size: file.size }))
  );

  if (error || !slots) {
    throw new Error(error ?? "Couldn't prepare your photos for upload.");
  }

  await Promise.all(
    files.map(async (file, index) => {
      const slot = slots[index];
      const response = await fetch(slot.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      if (!response.ok) {
        throw new Error(`Couldn't upload ${file.name}. Please try again.`);
      }
    })
  );

  return slots.map((slot) => slot.publicUrl);
}
