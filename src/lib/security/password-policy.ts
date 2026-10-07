export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_HINT =
  "At least 12 characters. Don’t use your email or a common password.";

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "password1234",
  "password12345",
  "123456789012",
  "123456789123",
  "qwertyuiop12",
  "qwerty123456",
  "letmein1234",
  "welcome1234",
  "changeme123",
  "iloveyou123",
  "memorydrop1",
  "wedding1234",
]);

/** Returns a user-facing error, or null when the password is acceptable. */
export function passwordPolicyError(password: string, email?: string | null): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Password must be at least 12 characters.";
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return "Password must be at most 128 characters.";
  }
  if (/^(.)\1+$/.test(password)) {
    return "That password is too easy to guess. Choose a different one.";
  }

  const normalized = password.toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) {
    return "That password is too common. Choose a different one.";
  }

  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  const localPart = normalizedEmail.split("@")[0] ?? "";
  if (
    (normalizedEmail && normalized === normalizedEmail) ||
    (localPart.length >= 4 && normalized === localPart)
  ) {
    return "Password can’t be your email address.";
  }

  return null;
}
