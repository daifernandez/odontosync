import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/auth/login-form", () => ({
  LoginForm: () => <div>Ingreso con correo</div>,
}));
vi.mock("@/components/auth/google-only-panel", () => ({
  GoogleOnlyPanel: () => <div>Solo Google</div>,
}));
vi.mock("@/lib/app-url", () => ({ getAuthCallbackUrl: () => "http://localhost:3000/auth/callback" }));

import LoginPage from "./page";

afterEach(() => vi.unstubAllEnvs());

it("shows password login when email registration is disabled", async () => {
  vi.stubEnv("EMAIL_AUTH_ENABLED", "false");
  const html = renderToStaticMarkup(await LoginPage({ searchParams: Promise.resolve({}) }));
  expect(html).toContain("Ingreso con correo");
  expect(html).not.toContain("Solo Google");
});
