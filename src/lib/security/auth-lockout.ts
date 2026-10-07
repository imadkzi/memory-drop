/**
 * Email lockout after repeated failed sign-ins.
 * Redis is used when REDIS_URL is set; otherwise this process keeps the counts.
 */
import { logger } from "@/lib/logging/logger";
import { assertRedisReady, getRedis } from "@/lib/redis";

export const AUTH_LOCKOUT = {
  maxFailures: 5,
  /** Rolling window that counts failures toward the threshold */
  failureWindowMs: 15 * 60 * 1000,
  /** How long the account stays locked once the threshold is hit */
  lockoutMs: 15 * 60 * 1000,
} as const;

type LockState = {
  failures: number[];
  lockedUntil: number | null;
};

const locks = new Map<string, LockState>();

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export type LockoutStatus = {
  locked: boolean;
  failures: number;
  retryAfterSec?: number;
};

function getState(email: string): LockState {
  return locks.get(email) ?? { failures: [], lockedUntil: null };
}

function pruneFailures(state: LockState, now: number) {
  const cutoff = now - AUTH_LOCKOUT.failureWindowMs;
  state.failures = state.failures.filter((ts) => ts > cutoff);
}

export function getLockoutStatus(
  email: string,
  now = Date.now(),
): LockoutStatus {
  const key = normalizeAuthEmail(email);
  if (!key) return { locked: false, failures: 0 };

  const state = getState(key);
  if (state.lockedUntil && state.lockedUntil > now) {
    return {
      locked: true,
      failures: state.failures.length,
      retryAfterSec: Math.max(1, Math.ceil((state.lockedUntil - now) / 1000)),
    };
  }

  if (state.lockedUntil && state.lockedUntil <= now) {
    state.lockedUntil = null;
    state.failures = [];
    locks.set(key, state);
  }

  pruneFailures(state, now);
  locks.set(key, state);
  return { locked: false, failures: state.failures.length };
}

export function recordFailedLogin(
  email: string,
  now = Date.now(),
): LockoutStatus {
  const key = normalizeAuthEmail(email);
  if (!key) return { locked: false, failures: 0 };

  const state = getState(key);
  if (state.lockedUntil && state.lockedUntil > now) {
    return {
      locked: true,
      failures: state.failures.length,
      retryAfterSec: Math.max(1, Math.ceil((state.lockedUntil - now) / 1000)),
    };
  }

  pruneFailures(state, now);
  state.failures.push(now);

  if (state.failures.length >= AUTH_LOCKOUT.maxFailures) {
    state.lockedUntil = now + AUTH_LOCKOUT.lockoutMs;
    locks.set(key, state);
    return {
      locked: true,
      failures: state.failures.length,
      retryAfterSec: Math.ceil(AUTH_LOCKOUT.lockoutMs / 1000),
    };
  }

  locks.set(key, state);
  return { locked: false, failures: state.failures.length };
}

export function clearLoginFailures(email: string) {
  const key = normalizeAuthEmail(email);
  if (!key) return;
  locks.delete(key);
}

/** Test helper */
export function resetAuthLockouts() {
  locks.clear();
}

const failKey = (email: string) => `auth:fail:${email}`;
const lockKey = (email: string) => `auth:lock:${email}`;

export async function readLockout(email: string): Promise<LockoutStatus> {
  const key = normalizeAuthEmail(email);
  if (!getRedis() || !key) return getLockoutStatus(email);

  try {
    const redis = await assertRedisReady();
    const [ttl, rawFailures] = await Promise.all([
      redis.pttl(lockKey(key)),
      redis.get(failKey(key)),
    ]);
    const failures = Number(rawFailures ?? 0);
    if (ttl > 0) {
      return {
        locked: true,
        failures,
        retryAfterSec: Math.max(1, Math.ceil(ttl / 1000)),
      };
    }
    return { locked: false, failures };
  } catch (error) {
    logger.warn("redis_lockout_read_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return getLockoutStatus(email);
  }
}

export async function writeFailedLogin(email: string): Promise<LockoutStatus> {
  const key = normalizeAuthEmail(email);
  if (!getRedis() || !key) return recordFailedLogin(email);

  try {
    const redis = await assertRedisReady();
    const existingTtl = await redis.pttl(lockKey(key));
    if (existingTtl > 0) {
      const failures = Number((await redis.get(failKey(key))) ?? 0);
      return {
        locked: true,
        failures,
        retryAfterSec: Math.max(1, Math.ceil(existingTtl / 1000)),
      };
    }

    const failures = await redis.incr(failKey(key));
    if (failures === 1 || (await redis.pttl(failKey(key))) < 0) {
      await redis.pexpire(failKey(key), AUTH_LOCKOUT.failureWindowMs);
    }

    if (failures >= AUTH_LOCKOUT.maxFailures) {
      await redis.set(lockKey(key), "1", "PX", AUTH_LOCKOUT.lockoutMs);
      return {
        locked: true,
        failures,
        retryAfterSec: Math.ceil(AUTH_LOCKOUT.lockoutMs / 1000),
      };
    }

    return { locked: false, failures };
  } catch (error) {
    logger.warn("redis_lockout_write_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return recordFailedLogin(email);
  }
}

export async function clearLockout(email: string) {
  const key = normalizeAuthEmail(email);
  clearLoginFailures(email);
  if (!getRedis() || !key) return;
  try {
    const redis = await assertRedisReady();
    await redis.del(failKey(key), lockKey(key));
  } catch (error) {
    logger.warn("redis_lockout_clear_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export function formatLockoutMessage(retryAfterSec: number) {
  const minutes = Math.ceil(retryAfterSec / 60);
  if (minutes <= 1) {
    return "Too many failed sign-in attempts. Try again in about a minute.";
  }
  return `Too many failed sign-in attempts. Try again in about ${minutes} minutes.`;
}
