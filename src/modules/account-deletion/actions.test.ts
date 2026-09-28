import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureServerEntryExports } from "next/dist/build/webpack/loaders/next-flight-loader/action-validate";
import * as actionExports from "./actions";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  removeAvatars: vi.fn(),
  deleteUser: vi.fn(),
  signOut: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser, signOut: mocks.signOut } })),
}));
vi.mock("./repository", () => ({
  removeAccountAvatars: mocks.removeAvatars,
  deleteAuthUser: mocks.deleteUser,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { deleteAccountAction } from "./actions";

const user = { id: "00000000-0000-4000-8000-000000000002", email: "ana@example.com" };
const validForm = () => {
  const form = new FormData();
  form.set("email", user.email);
  form.set("accepted", "on");
  return form;
};

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });
    mocks.removeAvatars.mockResolvedValue(undefined);
    mocks.deleteUser.mockResolvedValue(undefined);
  });

  it("loads through the Next.js server action runtime", () => {
    expect(() => ensureServerEntryExports(Object.values(actionExports))).not.toThrow();
  });

  it("rejects an expired session before touching data", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
    await expect(deleteAccountAction({ status: "idle", message: "" }, validForm()))
      .resolves.toMatchObject({ status: "error", message: expect.stringContaining("sesión") });
    expect(mocks.removeAvatars).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("requires the account email and explicit acceptance", async () => {
    const form = validForm();
    form.set("email", "other@example.com");
    await expect(deleteAccountAction({ status: "idle", message: "" }, form))
      .resolves.toMatchObject({ status: "error" });
    form.set("email", user.email);
    form.delete("accepted");
    await expect(deleteAccountAction({ status: "idle", message: "" }, form))
      .resolves.toMatchObject({ status: "error" });
    expect(mocks.removeAvatars).not.toHaveBeenCalled();
  });

  it("protects the evaluation account before touching data", async () => {
    const evaluationUser = { ...user, email: "Evaluacion@OdontoSync.Test" };
    mocks.getUser.mockResolvedValue({ data: { user: evaluationUser }, error: null });
    const form = validForm();
    form.set("email", evaluationUser.email);

    await expect(deleteAccountAction({ status: "idle", message: "" }, form))
      .resolves.toMatchObject({ status: "error", message: expect.stringContaining("evaluación") });
    expect(mocks.removeAvatars).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("uses only the verified session identity even if a different id is submitted", async () => {
    const form = validForm();
    form.set("userId", "00000000-0000-4000-8000-000000000003");
    await deleteAccountAction({ status: "idle", message: "" }, form);
    expect(mocks.removeAvatars).toHaveBeenCalledWith(user.id);
    expect(mocks.deleteUser).toHaveBeenCalledWith(user.id);
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mocks.redirect).toHaveBeenCalledWith("/ingresar?cuenta=eliminada");
  });

  it("keeps Auth intact if avatar deletion fails", async () => {
    mocks.removeAvatars.mockRejectedValue(new Error("storage unavailable"));
    await expect(deleteAccountAction({ status: "idle", message: "" }, validForm()))
      .resolves.toMatchObject({ status: "error", message: expect.stringContaining("Intentá") });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("keeps the session for retry if Auth deletion fails", async () => {
    mocks.deleteUser.mockRejectedValue(new Error("foreign key"));
    await expect(deleteAccountAction({ status: "idle", message: "" }, validForm()))
      .resolves.toMatchObject({ status: "error" });
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
