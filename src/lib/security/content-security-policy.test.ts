import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "./content-security-policy";

describe("buildContentSecurityPolicy", () => {
  it("allows only the configured Supabase project for network connections", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "nonce-de-prueba",
      supabaseUrl: "https://project-ref.supabase.co",
      isDevelopment: false,
    });

    expect(policy).toContain(
      "connect-src 'self' https://project-ref.supabase.co wss://project-ref.supabase.co",
    );
    expect(policy).toContain(
      "script-src 'self' 'nonce-nonce-de-prueba' 'strict-dynamic'",
    );
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("permits only the development runtime exception outside production", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "nonce-de-prueba",
      supabaseUrl: "https://project-ref.supabase.co",
      isDevelopment: true,
    });

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("ws://localhost:*");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});
