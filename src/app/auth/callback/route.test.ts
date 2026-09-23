import { NextRequest } from "next/server";
import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));

vi.mock("@/lib/app-url", () => ({ getAppOrigin: () => "http://localhost:3000" }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession: mocks.exchangeCodeForSession } }),
}));

import { GET } from "./route";

it("returns a usable sign-in error when Google is cancelled", async () => {
  const response = await GET(new NextRequest(
    "http://localhost:3000/auth/callback?error=access_denied",
  ));

  expect(response.headers.get("location")).toBe(
    "http://localhost:3000/ingresar?error=acceso",
  );
  expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
});

it("exchanges a valid code without following an external next URL", async () => {
  mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

  const response = await GET(new NextRequest(
    "http://localhost:3000/auth/callback?code=valid&next=%2F%2Fevil.example",
  ));

  expect(response.headers.get("location")).toBe("http://localhost:3000/app");
});
