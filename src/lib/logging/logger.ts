type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "uploadToken",
  "accessToken",
  "refreshToken",
  "encryptedAccessToken",
  "encryptedRefreshToken",
  "clientSecret",
  "authorization",
  "cookie",
  "ENCRYPTION_KEY",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_SECRET",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key) || /secret|token|password/i.test(key)) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redact(nested);
      }
    }
    return out;
  }
  return value;
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(fields ? (redact(fields) as LogFields) : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    if (process.env.SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        const error = fields?.error;
        if (error instanceof Error) {
          Sentry.captureException(error, { extra: fields });
          return;
        }
        Sentry.captureMessage(message, { level: "error", extra: fields });
      });
    }
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
