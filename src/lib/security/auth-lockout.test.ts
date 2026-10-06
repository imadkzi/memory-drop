import { describe, expect, it, beforeEach } from "vitest";
import {
  AUTH_LOCKOUT,
  clearLoginFailures,
  formatLockoutMessage,
  getLockoutStatus,
  recordFailedLogin,
  resetAuthLockouts,
} from "@/lib/security/auth-lockout";

describe("auth lockout", () => {
  beforeEach(() => resetAuthLockouts());

  it("allows attempts until the failure threshold", () => {
    const email = "Owner@Example.com";
    for (let i = 0; i < AUTH_LOCKOUT.maxFailures - 1; i++) {
      const status = recordFailedLogin(email);
      expect(status.locked).toBe(false);
      expect(status.failures).toBe(i + 1);
    }
    expect(getLockoutStatus(email).locked).toBe(false);
  });

  it("locks after max failures and normalizes email casing", () => {
    const email = "bride@example.com";
    for (let i = 0; i < AUTH_LOCKOUT.maxFailures - 1; i++) {
      recordFailedLogin(email);
    }
    const locked = recordFailedLogin("Bride@Example.com");
    expect(locked.locked).toBe(true);
    expect(locked.retryAfterSec).toBeGreaterThan(0);
    expect(getLockoutStatus("BRIDE@example.com").locked).toBe(true);
  });

  it("clears failures after a successful sign-in", () => {
    recordFailedLogin("user@example.com");
    recordFailedLogin("user@example.com");
    clearLoginFailures("user@example.com");
    expect(getLockoutStatus("user@example.com")).toEqual({
      locked: false,
      failures: 0,
    });
  });

  it("formats a human lockout message", () => {
    expect(formatLockoutMessage(30)).toContain("minute");
    expect(formatLockoutMessage(600)).toContain("10 minutes");
  });

  it("expires lockout after the lock window", () => {
    const email = "temp@example.com";
    const start = Date.now();
    for (let i = 0; i < AUTH_LOCKOUT.maxFailures; i++) {
      recordFailedLogin(email, start);
    }
    expect(getLockoutStatus(email, start).locked).toBe(true);
    expect(
      getLockoutStatus(email, start + AUTH_LOCKOUT.lockoutMs + 1).locked,
    ).toBe(false);
  });
});
