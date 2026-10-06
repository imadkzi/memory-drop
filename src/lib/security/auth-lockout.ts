/**
 * In-memory email lockout after repeated failed sign-ins.
 * Single-instance MVP — replace with Redis/DB when scaling horizontally.
 */

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

export function formatLockoutMessage(retryAfterSec: number) {
  const minutes = Math.ceil(retryAfterSec / 60);
  if (minutes <= 1) {
    return "Too many failed sign-in attempts. Try again in about a minute.";
  }
  return `Too many failed sign-in attempts. Try again in about ${minutes} minutes.`;
}
