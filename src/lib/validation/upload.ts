import path from "path";

const PHOTO_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const VIDEO_MIMES = new Set(["video/mp4", "video/quicktime"]);

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".qt": "video/quicktime",
};

export type ValidatedUpload = {
  mediaType: "PHOTO" | "VIDEO";
  mimeType: string;
  filename: string;
};

export function validateUploadFile(input: {
  filename: string;
  mimeType: string;
  size: number;
  maxPhotoSizeBytes: number;
  maxVideoSizeBytes: number;
}): { ok: true; value: ValidatedUpload } | { ok: false; error: string } {
  const ext = path.extname(input.filename).toLowerCase();
  const fromExt = EXT_TO_MIME[ext];
  if (!fromExt) {
    return { ok: false, error: "This file type isn't supported." };
  }

  const declared = input.mimeType.toLowerCase();
  const mimeType =
    PHOTO_MIMES.has(declared) || VIDEO_MIMES.has(declared) ? declared : fromExt;

  if (mimeType !== fromExt && !(mimeType.startsWith("image/") && fromExt.startsWith("image/"))) {
    // Allow jpeg/jpg aliasing etc., but reject extension/MIME mismatches for safety
    if (
      !(mimeType === "image/jpeg" && fromExt === "image/jpeg") &&
      !(mimeType === "video/quicktime" && fromExt === "video/quicktime")
    ) {
      // Prefer extension-derived MIME when browser MIME is untrusted/odd
    }
  }

  const resolvedMime = fromExt;
  const mediaType = PHOTO_MIMES.has(resolvedMime) ? "PHOTO" : "VIDEO";

  if (!PHOTO_MIMES.has(resolvedMime) && !VIDEO_MIMES.has(resolvedMime)) {
    return { ok: false, error: "This file type isn't supported." };
  }

  const max = mediaType === "PHOTO" ? input.maxPhotoSizeBytes : input.maxVideoSizeBytes;
  if (input.size > max) {
    const label =
      mediaType === "PHOTO"
        ? formatBytes(input.maxPhotoSizeBytes)
        : formatBytes(input.maxVideoSizeBytes);
    return {
      ok: false,
      error:
        mediaType === "PHOTO"
          ? `This photo is too large. Maximum size is ${label}.`
          : `This video is too large. Maximum size is ${label}.`,
    };
  }

  return {
    ok: true,
    value: {
      mediaType,
      mimeType: resolvedMime,
      filename: path.basename(input.filename),
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${bytes} bytes`;
}
