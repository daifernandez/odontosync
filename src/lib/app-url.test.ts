import { describe, expect, it } from "vitest";

import { getAppOrigin, getAuthCallbackUrl } from "./app-url";

describe("getAppOrigin", () => {
  it("normalizes the configured URL to its origin", () => {
    expect(getAppOrigin("https://odontosync.example/configuracion")).toBe(
      "https://odontosync.example",
    );
  });

  it("uses localhost only outside production", () => {
    expect(getAppOrigin(undefined, "development")).toBe(
      "http://localhost:3000",
    );
    expect(() => getAppOrigin(undefined, "production")).toThrow(
      "Falta APP_URL",
    );
  });

  it.each(["javascript:alert(1)", "https://user:secret@example.com"])(
    "rejects an unsafe URL: %s",
    (value) => {
      expect(() => getAppOrigin(value)).toThrow();
    },
  );
});

describe("getAuthCallbackUrl", () => {
  it("builds the callback from the canonical origin", () => {
    expect(getAuthCallbackUrl("https://odontosync.example/otra-ruta")).toBe(
      "https://odontosync.example/auth/callback",
    );
  });
});
