import imageCompression from "browser-image-compression";

// Compression targets a comfortable middle of the 50-200KB range rather than
// the ceiling — busy/detailed photos can still land a bit higher, this just
// keeps typical phone photos from sitting right at the edge.
const TARGET_SIZE_MB = 0.18;
const MAX_DIMENSION_PX = 1600;

/**
 * Compresses a single image client-side before upload — phone cameras
 * routinely produce 3-8MB photos, well past what a listing photo needs.
 * Resizes to a max of 1600px on the longest side and re-encodes at a
 * quality that targets ~180KB. Falls back to the original file if
 * compression fails for any reason (corrupt image, unsupported format,
 * etc.) rather than blocking the upload entirely.
 */
export async function compressListingImage(file: File): Promise<File> {
  // Nothing to do for already-small files — skip the (not free) compression
  // pass entirely.
  if (file.size <= TARGET_SIZE_MB * 1024 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: TARGET_SIZE_MB,
      maxWidthOrHeight: MAX_DIMENSION_PX,
      useWebWorker: true,
      preserveExif: false, // we don't need camera metadata, and stripping it saves a little more
      // By default the library's web worker fetches its own script from
      // jsdelivr's CDN (a fresh network request, every time, for every
      // photo) before it can start compressing — on a slow or congested
      // mobile connection that easily dwarfs the actual compression work.
      // Point it at our own self-hosted copy instead (public/vendor/) so
      // the worker starts immediately from cache with no external request.
      libURL: `${window.location.origin}/vendor/browser-image-compression.js`
    });

    // browser-image-compression returns a Blob, not always a File — rewrap
    // with the original name so downstream code (extension parsing, etc.)
    // keeps working the same way.
    return new File([compressed], file.name, { type: compressed.type });
  } catch {
    // Compression genuinely failing (vs. just landing above target) is rare
    // — better to upload the original than block the listing entirely.
    return file;
  }
}
