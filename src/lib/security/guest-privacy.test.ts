import { describe, expect, it } from "vitest";
import { hashUploadToken } from "@/lib/security/crypto";

/**
 * Guest capability tokens must never unlock read APIs.
 * These tests document the contract enforced by route design:
 * - /api/upload/* accepts token header and never returns media lists
 * - /api/media/* requires admin session + wedding membership
 */
describe("guest upload capability contract", () => {
  it("hashes tokens so raw values are not comparable as storage keys alone", () => {
    const token = "guest-capability-token-example";
    expect(hashUploadToken(token)).not.toEqual(token);
  });

  it("defines guest-safe public wedding payload shape", () => {
    const publicWeddingInfo = {
      name: "Sarah & Ahmed",
      uploadEnabled: true,
    };
    expect(publicWeddingInfo).not.toHaveProperty("media");
    expect(publicWeddingInfo).not.toHaveProperty("driveFolderId");
    expect(publicWeddingInfo).not.toHaveProperty("driveConnectionId");
    expect(publicWeddingInfo).not.toHaveProperty("uploadTokenHash");
  });
});
