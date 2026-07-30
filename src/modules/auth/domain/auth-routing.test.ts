import { describe, expect, it } from "vitest";

import { getAuthRedirect, getSafeNextPath } from "./auth-routing";

describe("getAuthRedirect", () => {
  it("redirects unauthenticated users away from private routes", () => {
    expect(getAuthRedirect("/app", false)).toBe("/ingresar");
    expect(getAuthRedirect("/app/agenda", false)).toBe("/ingresar");
  });

  it("redirects authenticated users away from auth forms", () => {
    expect(getAuthRedirect("/ingresar", true)).toBe("/app");
    expect(getAuthRedirect("/registro", true)).toBe("/app");
  });

  it("does not redirect allowed requests", () => {
    expect(getAuthRedirect("/", false)).toBeNull();
    expect(getAuthRedirect("/app", true)).toBeNull();
  });
});

describe("getSafeNextPath", () => {
  it.each(["https://evil.example", "//evil.example", "javascript:alert(1)", ""])(
    "rejects an external or invalid redirect: %s",
    (value) => {
      expect(getSafeNextPath(value)).toBe("/app");
    },
  );

  it("accepts an internal path", () => {
    expect(getSafeNextPath("/app/agenda")).toBe("/app/agenda");
  });
});
