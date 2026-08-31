import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "./proxy";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/app-url", () => ({
  getAppOrigin: () => "http://localhost:3000",
}));

vi.mock("@/lib/security/content-security-policy", () => ({
  buildContentSecurityPolicy: () => "default-src 'self'",
}));

vi.mock("./config", () => ({
  getSupabaseConfig: () => ({
    publishableKey: "publishable-test-key",
    url: "https://project.supabase.co",
  }),
}));

type CookieAdapter = {
  setAll: (
    cookies: Array<{
      name: string;
      value: string;
      options: { httpOnly: boolean; path: string };
    }>,
    headers: Record<string, string>,
  ) => void;
};

describe("updateSession", () => {
  beforeEach(() => {
    mocks.createServerClient.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a refreshed session to Server Components and the browser", async () => {
    mocks.createServerClient.mockImplementation(
      (...args: unknown[]) => {
        const options = args[2] as { cookies: CookieAdapter };

        return {
          auth: {
            getClaims: vi.fn(async () => {
              options.cookies.setAll(
                [
                  {
                    name: "sb-project-auth-token",
                    value: "refreshed-session",
                    options: { httpOnly: true, path: "/" },
                  },
                ],
                {
                  "Cache-Control":
                    "private, no-cache, no-store, must-revalidate, max-age=0",
                  Expires: "0",
                  Pragma: "no-cache",
                },
              );

              return { data: { claims: { sub: "owner-id" } } };
            }),
          },
        };
      },
    );

    const request = new NextRequest("http://localhost:3000/app/agenda", {
      headers: { cookie: "sb-project-auth-token=stale-session" },
    });
    const nextResponseSpy = vi.spyOn(NextResponse, "next");
    const response = await updateSession(request);

    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "sb-project-auth-token=refreshed-session",
    );
    expect(
      nextResponseSpy.mock.calls.some(
        ([init]) => init && "request" in init && init.request === request,
      ),
    ).toBe(true);
    expect(response.cookies.get("sb-project-auth-token")?.value).toBe(
      "refreshed-session",
    );
    expect(response.headers.get("cache-control")).toBe(
      "private, no-cache, no-store, must-revalidate, max-age=0",
    );
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("redirects an invalid private session without exposing private data", async () => {
    mocks.createServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn(async () => ({ data: { claims: null } })),
      },
    });

    const response = await updateSession(
      new NextRequest("http://localhost:3000/app/agenda"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/ingresar",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
