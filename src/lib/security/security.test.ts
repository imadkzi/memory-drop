import { describe, expect, it, beforeEach } from "vitest";
import { generateUploadToken, hashUploadToken, encryptSecret, decryptSecret } from "@/lib/security/crypto";
import { checkRateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import { validateUploadFile } from "@/lib/validation/upload";

describe("upload tokens", () => {
  it("generates unique tokens and hashes stably", () => {
    const a = generateUploadToken();
    const b = generateUploadToken();
    expect(a).not.toEqual(b);
    expect(hashUploadToken(a)).toEqual(hashUploadToken(a));
    expect(hashUploadToken(a)).not.toEqual(hashUploadToken(b));
  });

  it("does not store reversible hash", () => {
    const token = generateUploadToken();
    const hash = hashUploadToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
  });
});

describe("secret encryption", () => {
  it("round-trips secrets", () => {
    process.env.ENCRYPTION_KEY =
      process.env.ENCRYPTION_KEY ||
      "2db6a4eda8a35f8417477f214bf1de139f6715046ad878f6903fbe419604ec3e";
    const encrypted = encryptSecret("refresh-token-value");
    expect(encrypted).not.toContain("refresh-token-value");
    expect(decryptSecret(encrypted)).toEqual("refresh-token-value");
  });
});

describe("upload validation", () => {
  it("accepts supported photo types by extension", () => {
    const result = validateUploadFile({
      filename: "photo.HEIC",
      mimeType: "application/octet-stream",
      size: 1_000_000,
      maxPhotoSizeBytes: 25_000_000,
      maxVideoSizeBytes: 1_000_000_000,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mediaType).toBe("PHOTO");
      expect(result.value.mimeType).toBe("image/heic");
    }
  });

  it("rejects oversized videos with human message", () => {
    const result = validateUploadFile({
      filename: "clip.mov",
      mimeType: "video/quicktime",
      size: 2_000_000_000,
      maxPhotoSizeBytes: 25_000_000,
      maxVideoSizeBytes: 1_000_000_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("too large");
    }
  });

  it("rejects unsupported types", () => {
    const result = validateUploadFile({
      filename: "notes.pdf",
      mimeType: "application/pdf",
      size: 1000,
      maxPhotoSizeBytes: 25_000_000,
      maxVideoSizeBytes: 1_000_000_000,
    });
    expect(result.ok).toBe(false);
  });
});

describe("rate limiting", () => {
  beforeEach(() => resetRateLimits());

  it("allows until limit then blocks", () => {
    expect(checkRateLimit("k", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("k", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("k", 2, 60_000).allowed).toBe(false);
  });
});
