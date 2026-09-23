import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`redirect:${path}`); },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: {
    signUp: mocks.signUp,
    signInWithPassword: mocks.signInWithPassword,
    getUser: mocks.getUser,
    updateUser: mocks.updateUser,
  } }),
}));

import { acceptAcademicUseAction, loginAction, registerAction } from "./actions";

describe("email authentication while SMTP is pending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.EMAIL_AUTH_ENABLED;
  });

  afterEach(() => {
    delete process.env.EMAIL_AUTH_ENABLED;
  });

  it("does not create an email account", async () => {
    const result = await registerAction({ status: "idle", message: "", fieldErrors: {} }, new FormData());

    expect(result).toEqual({
      status: "error",
      message: "Por ahora, continuá con Google.",
      fieldErrors: {},
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("does not offer password login", async () => {
    const result = await loginAction({ status: "idle", message: "", fieldErrors: {} }, new FormData());

    expect(result).toEqual({
      status: "error",
      message: "Por ahora, continuá con Google.",
      fieldErrors: {},
    });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("keeps email registration available after SMTP is enabled", async () => {
    process.env.EMAIL_AUTH_ENABLED = "true";
    mocks.signUp.mockResolvedValue({ error: null });
    const data = new FormData();
    data.set("fullName", "Cuenta Prueba");
    data.set("email", "qa@example.com");
    data.set("password", "Segura123456!");
    data.set("academicUse", "on");

    const result = await registerAction({ status: "idle", fieldErrors: {} }, data);

    expect(result.status).toBe("success");
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "qa@example.com",
      password: "Segura123456!",
    }));
  });

  it("keeps password login available after SMTP is enabled", async () => {
    process.env.EMAIL_AUTH_ENABLED = "true";
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const data = new FormData();
    data.set("email", "qa@example.com");
    data.set("password", "Segura123456!");

    await expect(loginAction({ status: "idle", fieldErrors: {} }, data)).rejects.toThrow("redirect:/app");
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "qa@example.com",
      password: "Segura123456!",
    });
  });
});

describe("acceptAcademicUseAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: {
      app_metadata: { provider: "google" },
      user_metadata: {},
    } } });
    mocks.updateUser.mockResolvedValue({ error: null });
  });

  it("requires an explicit acknowledgement", async () => {
    await expect(acceptAcademicUseAction(new FormData())).rejects.toThrow(
      "redirect:/uso-academico?error=aceptacion",
    );
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("records acknowledgement for the signed-in Google user", async () => {
    const data = new FormData();
    data.set("academicUse", "on");

    await expect(acceptAcademicUseAction(data)).rejects.toThrow("redirect:/app");
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: {
      academic_use_accepted_at: expect.any(String),
    } });
  });

  it("rejects an unauthenticated request", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    await expect(acceptAcademicUseAction(new FormData())).rejects.toThrow(
      "redirect:/ingresar",
    );
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("keeps the user at acknowledgement when saving fails", async () => {
    mocks.updateUser.mockResolvedValue({ error: new Error("provider unavailable") });
    const data = new FormData();
    data.set("academicUse", "on");

    await expect(acceptAcademicUseAction(data)).rejects.toThrow(
      "redirect:/uso-academico?error=guardado",
    );
  });
});
