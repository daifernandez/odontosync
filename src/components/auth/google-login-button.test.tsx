// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithOAuth: mocks.signInWithOAuth } }),
}));

import { GoogleLoginButton } from "./google-login-button";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("starts Google OAuth with the canonical callback", async () => {
  mocks.signInWithOAuth.mockResolvedValue({ error: null });
  render(<GoogleLoginButton redirectTo="https://odontosync.example/auth/callback" />);

  fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));

  await waitFor(() => expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
    provider: "google",
    options: { redirectTo: "https://odontosync.example/auth/callback" },
  }));
});

it("shows a recoverable message when Google cannot start", async () => {
  mocks.signInWithOAuth.mockResolvedValue({ error: new Error("provider disabled") });
  render(<GoogleLoginButton redirectTo="https://odontosync.example/auth/callback" />);

  fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));

  expect((await screen.findByRole("alert")).textContent).toContain("No pudimos iniciar el acceso con Google");
  expect((screen.getByRole("button", { name: "Continuar con Google" }) as HTMLButtonElement).disabled).toBe(false);
});
