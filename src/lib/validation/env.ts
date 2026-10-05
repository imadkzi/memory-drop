import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex characters"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().optional().default(""),
  MAX_PHOTO_SIZE_BYTES: z.coerce.number().int().positive().default(25 * 1024 * 1024),
  MAX_VIDEO_SIZE_BYTES: z.coerce.number().int().positive().default(1024 * 1024 * 1024),
  RATE_LIMIT_UPLOAD_PER_IP: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_UPLOAD_PER_TOKEN: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(10 * 60 * 1000),
  NODE_ENV: z.enum(["development", "test", "production"]).optional().default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  cached = parsed.data;
  return cached;
}

export function tryGetEnv(): Env | null {
  try {
    return getEnv();
  } catch {
    return null;
  }
}
