import { logger } from "@/lib/logging/logger";
import { assertRedisReady, getRedis } from "@/lib/redis";

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { allowed: true, remaining: Math.max(0, limit - bucket.timestamps.length) };
}

/**
 * Shared fixed window when REDIS_URL is set. Falls back to the in-memory
 * sliding window so a Redis outage does not stop guest uploads.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!getRedis()) return checkRateLimit(key, limit, windowMs);

  const redisKey = `rl:${key}`;
  const window = Math.max(1, windowMs);
  try {
    const redis = await assertRedisReady();
    const count = await redis.incr(redisKey);
    if (count === 1 || (await redis.pttl(redisKey)) < 0) {
      await redis.pexpire(redisKey, window);
    }
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  } catch (error) {
    logger.warn("redis_rate_limit_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return checkRateLimit(key, limit, windowMs);
  }
}

/** Test helper */
export function resetRateLimits() {
  buckets.clear();
}
