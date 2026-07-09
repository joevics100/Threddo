import { createClient } from "@/lib/supabase/client";

/**
 * Uploads each file to the `listings` storage bucket under the current user's
 * folder (`${userId}/...`), matching the storage RLS policy, and returns the
 * public URLs in the same order as the input files.
 */
export async function uploadListingImages(files: File[], userId: string): Promise<string[]> {
  const supabase = createClient();

  const urls = await Promise.all(
    files.map(async (file, index) => {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}-${index}.${extension}`;

      const { error } = await supabase.storage.from("listings").upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (error) {
        throw new Error(`Couldn't upload ${file.name}: ${error.message}`);
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from("listings").getPublicUrl(path);

      return publicUrl;
    })
  );

  return urls;
}
