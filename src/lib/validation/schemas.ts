import { z } from "zod";
import { passwordPolicyError } from "@/lib/security/password-policy";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const registerSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(1).max(128),
  })
  .superRefine((value, ctx) => {
    const message = passwordPolicyError(value.password, value.email);
    if (!message) return;
    ctx.addIssue({ code: "custom", path: ["password"], message });
  });

export const createWeddingSchema = z.object({
  name: z.string().min(2).max(120),
});

export const updateWeddingSettingsSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  uploadEnabled: z.boolean().optional(),
  maxPhotoSizeBytes: z.number().int().positive().max(100 * 1024 * 1024).optional(),
  maxVideoSizeBytes: z.number().int().positive().max(5 * 1024 * 1024 * 1024).optional(),
  eventDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .optional(),
});

export const addAdminSchema = z.object({
  email: z.string().email(),
});

export const uploadSessionSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(150),
  size: z.number().int().positive(),
});

export const uploadCompleteSchema = z.object({
  mediaId: z.string().min(1),
  driveFileId: z.string().min(1),
});

export const bulkDeleteMediaSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});
