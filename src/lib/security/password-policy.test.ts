import { describe, expect, it } from "vitest";
import { passwordPolicyError } from "@/lib/security/password-policy";

describe("passwordPolicyError", () => {
  it("accepts a long uncommon password", () => {
    expect(passwordPolicyError("river-lantern-42", "dev@example.com")).toBeNull();
  });

  it("rejects short, repeated, common, and email passwords", () => {
    expect(passwordPolicyError("shortpass1")).toMatch(/12 characters/);
    expect(passwordPolicyError("aaaaaaaaaaaa")).toMatch(/easy to guess/);
    expect(passwordPolicyError("password1234")).toMatch(/too common/);
    expect(passwordPolicyError("dev@example.com", "dev@example.com")).toMatch(/email/);
    expect(passwordPolicyError("devexample", "devexample@example.com")).toMatch(/12 characters/);
    expect(passwordPolicyError("devexample99", "devexample99@example.com")).toMatch(/email/);
  });

  it("does not treat a short email name as the whole password", () => {
    expect(passwordPolicyError("amy-lantern-42", "amy@example.com")).toBeNull();
  });
});
