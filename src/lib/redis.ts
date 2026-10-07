import Redis from "ioredis";
import { logger } from "@/lib/logging/logger";

const globalForRedis = globalThis as unknown as {
  redis?: Redis | null;
};

function createRedis(): Redis | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2_000,
    // Fail the command instead of running it later. A queued INCR would
    // count a request we already handled in memory.
    enableOfflineQueue: false,
    retryStrategy(times) {
      return Math.min(times * 200, 2_000);
    },
  });
  client.on("error", (error) => {
    const message = error instanceof Error ? error.message || error.name : String(error);
    const code =
      error && typeof error === "object" && "code" in error ? String(error.code) : undefined;
    logger.warn("redis_error", { error: message, code });
  });
  return client;
}

function waitUntilReady(client: Redis, timeoutMs: number) {
  if (client.status === "ready") return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("redis timeout"));
    }, timeoutMs);
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onEnd = () => {
      cleanup();
      reject(new Error("redis closed"));
    };
    function cleanup() {
      clearTimeout(timer);
      client.off("ready", onReady);
      client.off("end", onEnd);
    }
    client.on("ready", onReady);
    client.on("end", onEnd);
    if (client.status === "ready") onReady();
  });
}

/** Shared client. Null when REDIS_URL is unset (unit tests and local fallback). */
export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;
  globalForRedis.redis = createRedis();
  return globalForRedis.redis;
}

/**
 * Ready client for a command that should fail fast once Redis is down.
 * The first connect is allowed to wait; later outages throw immediately.
 */
export async function assertRedisReady(timeoutMs = 1_000): Promise<Redis> {
  const redis = getRedis();
  if (!redis) throw new Error("redis unset");
  if (redis.status === "ready") return redis;
  if (redis.status !== "wait" && redis.status !== "connecting") {
    throw new Error("redis unavailable");
  }
  await waitUntilReady(redis, timeoutMs);
  return redis;
}

export async function pingRedis(): Promise<"ok" | "error" | "skipped"> {
  const redis = getRedis();
  if (!redis) return "skipped";
  try {
    if (redis.status !== "ready") await waitUntilReady(redis, 1_500);
    const reply = await redis.ping();
    return reply === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  }
}
