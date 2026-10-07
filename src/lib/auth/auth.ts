import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/validation/env";
import { logger } from "@/lib/logging/logger";
import {
  clearLoginFailures,
  formatLockoutMessage,
  getLockoutStatus,
  normalizeAuthEmail,
  recordFailedLogin,
} from "@/lib/security/auth-lockout";
import { passwordPolicyError } from "@/lib/security/password-policy";

function emailFromBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const email = (body as { email?: unknown }).email;
  return typeof email === "string" ? normalizeAuthEmail(email) : null;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  secret: getEnv().BETTER_AUTH_SECRET,
  baseURL: getEnv().BETTER_AUTH_URL,
  /**
   * Built-in IP rate limits (memory). Special defaults also cap
   * /sign-in and /sign-up at 3 requests / 10s; customRules add longer windows.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "memory",
    customRules: {
      "/sign-in/email": {
        window: 15 * 60,
        max: 30,
      },
      "/sign-up/email": {
        window: 60 * 60,
        max: 10,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body =
          ctx.body && typeof ctx.body === "object"
            ? (ctx.body as { password?: unknown; email?: unknown })
            : null;
        const password = typeof body?.password === "string" ? body.password : "";
        const email = typeof body?.email === "string" ? body.email : null;
        const policyError = passwordPolicyError(password, email);
        if (policyError) {
          throw new APIError("BAD_REQUEST", { message: policyError });
        }
        return;
      }

      if (ctx.path !== "/sign-in/email") return;
      const email = emailFromBody(ctx.body);
      if (!email) return;

      const status = getLockoutStatus(email);
      if (status.locked && status.retryAfterSec) {
        logger.warn("auth_login_locked", {
          email,
          retryAfterSec: status.retryAfterSec,
        });
        throw new APIError("TOO_MANY_REQUESTS", {
          message: formatLockoutMessage(status.retryAfterSec),
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = emailFromBody(ctx.body);
      if (!email) return;

      if (ctx.context.newSession) {
        clearLoginFailures(email);
        return;
      }

      const status = recordFailedLogin(email);
      if (status.locked && status.retryAfterSec) {
        logger.warn("auth_login_lockout_triggered", {
          email,
          failures: status.failures,
          retryAfterSec: status.retryAfterSec,
        });
        throw new APIError("TOO_MANY_REQUESTS", {
          message: formatLockoutMessage(status.retryAfterSec),
        });
      }

      logger.info("auth_login_failed", {
        email,
        failures: status.failures,
      });
    }),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
