import imageCompression from "browser-image-compression";

// Compression targets a comfortable middle of the 50-200KB range rather than
// the ceiling — busy/detailed photos can still land a bit higher, this just
// keeps typical phone photos from sitting right at the edge.
const TARGET_SIZE_MB = 0.18;
const MAX_DIMENSION_PX = 1600;

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence"
]);

/**
 * iPhones (and some Android camera apps) save photos as HEIC/HEIF by
 * default. No mainstream browser can decode that into a <canvas> the way it
 * can JPEG/PNG/WebP, so it needs a dedicated decode step before anything
 * else can touch it — including our own compression pass below. The MIME
 * type iOS Safari reports for these is inconsistent (sometimes empty,
 * sometimes "image/heic"), so we also fall back to the file extension.
 */
function isHeic(file: File): boolean {
  if (HEIC_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

/**
 * Converts a HEIC/HEIF file to JPEG in the browser. Dynamically imported —
 * heic2any bundles a full WASM HEIC decoder (~1.3MB), and the large majority
 * of uploads are already JPEG/PNG straight off an Android phone or a
 * downloaded image, so there's no reason to ship that to everyone.
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  // heic2any's types allow returning an array (only relevant when the input
  // is a multi-image HEIC sequence, e.g. Live Photos) — we only ever pass one
  // still image in, so it's always a single Blob in practice.
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], newName, { type: "image/jpeg" });
}

/**
 * Compresses a single image client-side before upload — phone cameras
 * routinely produce 3-8MB photos, well past what a listing photo needs.
 * Resizes to a max of 1600px on the longest side and re-encodes at a
 * quality that targets ~180KB. Falls back to the original file if
 * compression fails for any reason (corrupt image, unsupported format,
 * etc.) rather than blocking the upload entirely.
 */
export async function compressListingImage(file: File): Promise<File> {
  let workingFile = file;

  if (isHeic(workingFile)) {
    try {
      workingFile = await convertHeicToJpeg(workingFile);
    } catch {
      // If decoding genuinely fails (corrupt file, an HEIC variant the
      // decoder doesn't support) there's nothing more we can do client-side
      // — let it fall through to the server, which will reject it with a
      // clear "not a supported image type" message rather than a silent
      // failure here.
      return workingFile;
    }
  }

  // Nothing to do for already-small files — skip the (not free) compression
  // pass entirely.
  if (workingFile.size <= TARGET_SIZE_MB * 1024 * 1024) {
    return workingFile;
  }

  try {
    const compressed = await imageCompression(workingFile, {
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
    return new File([compressed], workingFile.name, { type: compressed.type });
  } catch {
    // Compression genuinely failing (vs. just landing above target) is rare
    // — better to upload the (already HEIC-converted, if applicable)
    // original than block the listing entirely.
    return workingFile;
  }
}
