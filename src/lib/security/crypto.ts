import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getEnv } from "@/lib/validation/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function keyFromEnv(): Buffer {
  return Buffer.from(getEnv().ENCRYPTION_KEY, "hex");
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyFromEnv(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = createDecipheriv(ALGORITHM, keyFromEnv(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function generateUploadToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashUploadToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = randomBytes(3).toString("hex");
  return `${base || "wedding"}-${suffix}`;
}
