import { describe, expect, it } from "vitest";

import { needsAcademicUseAcceptance } from "./academic-use";

describe("needsAcademicUseAcceptance", () => {
  it("requires a first-time Google account to accept academic use", () => {
    expect(needsAcademicUseAcceptance({
      app_metadata: { provider: "google" },
      user_metadata: { full_name: "QA" },
    })).toBe(true);
  });

  it("allows a returning Google account that accepted academic use", () => {
    expect(needsAcademicUseAcceptance({
      app_metadata: { provider: "google" },
      user_metadata: { academic_use_accepted_at: "2026-09-23T12:00:00.000Z" },
    })).toBe(false);
  });

  it("keeps existing email and password accounts unchanged", () => {
    expect(needsAcademicUseAcceptance({
      app_metadata: { provider: "email" },
      user_metadata: {},
    })).toBe(false);
  });
});
