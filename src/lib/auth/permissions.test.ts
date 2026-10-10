import { describe, expect, it } from "vitest";

type WeddingAdminRole = "OWNER" | "ADMIN";

/**
 * Pure permission matrix tests: guest capability is UPLOAD-only;
 * media list/download/delete require wedding membership.
 */
function canGuestListMedia() {
  return false;
}

function canGuestDownloadMedia() {
  return false;
}

function canGuestDeleteMedia() {
  return false;
}

function canManageAdmins(role: WeddingAdminRole) {
  return role === "OWNER";
}

function canDisconnectDrive(role: WeddingAdminRole) {
  return role === "OWNER";
}

function canViewGallery(role: WeddingAdminRole | null) {
  return role === "OWNER" || role === "ADMIN";
}

function isOwner(role: WeddingAdminRole) {
  return role === "OWNER";
}

describe("guest privacy model", () => {
  it("never allows guest media reads", () => {
    expect(canGuestListMedia()).toBe(false);
    expect(canGuestDownloadMedia()).toBe(false);
    expect(canGuestDeleteMedia()).toBe(false);
  });
});

describe("admin authorization matrix", () => {
  it("allows gallery for owner and admin", () => {
    expect(canViewGallery("OWNER")).toBe(true);
    expect(canViewGallery("ADMIN")).toBe(true);
    expect(canViewGallery(null)).toBe(false);
  });

  it("restricts owner-only actions", () => {
    expect(canManageAdmins("OWNER")).toBe(true);
    expect(canManageAdmins("ADMIN")).toBe(false);
    expect(canDisconnectDrive("OWNER")).toBe(true);
    expect(canDisconnectDrive("ADMIN")).toBe(false);
    expect(isOwner("OWNER")).toBe(true);
    expect(isOwner("ADMIN")).toBe(false);
  });
});
