import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteProfileAvatar: vi.fn(),
  getClaims: vi.fn(),
  replaceProfileAvatar: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));
vi.mock("./repository", () => ({
  deleteProfileAvatar: mocks.deleteProfileAvatar,
  replaceProfileAvatar: mocks.replaceProfileAvatar,
}));

import {
  profileAvatarFormState,
  removeProfileAvatarAction,
  uploadProfileAvatarAction,
} from "./actions";

function validPng() {
  return new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
    "avatar.png",
    { type: "image/png" },
  );
}

describe("profile avatar actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.replaceProfileAvatar.mockResolvedValue(undefined);
    mocks.deleteProfileAvatar.mockResolvedValue(undefined);
  });

  it("uploads a validated image for the authenticated user", async () => {
    const formData = new FormData();
    const file = validPng();
    formData.set("avatar", file);

    await expect(
      uploadProfileAvatarAction(profileAvatarFormState, formData),
    ).resolves.toMatchObject({
      status: "success",
      message: "Foto de perfil actualizada.",
    });
    expect(mocks.replaceProfileAvatar).toHaveBeenCalledWith({
      extension: "png",
      file,
      userId: "00000000-0000-4000-8000-000000000002",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app", "layout");
  });

  it("rejects invalid content before persistence", async () => {
    const formData = new FormData();
    formData.set(
      "avatar",
      new File(["not an image"], "avatar.png", { type: "image/png" }),
    );

    await expect(
      uploadProfileAvatarAction(profileAvatarFormState, formData),
    ).resolves.toMatchObject({ status: "error" });
    expect(mocks.replaceProfileAvatar).not.toHaveBeenCalled();
  });

  it("does not upload or remove without an authenticated user", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("avatar", validPng());

    await expect(
      uploadProfileAvatarAction(profileAvatarFormState, formData),
    ).resolves.toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    });
    await expect(
      removeProfileAvatarAction(profileAvatarFormState, new FormData()),
    ).resolves.toMatchObject({ status: "error" });
    expect(mocks.replaceProfileAvatar).not.toHaveBeenCalled();
    expect(mocks.deleteProfileAvatar).not.toHaveBeenCalled();
  });

  it("removes the authenticated user's avatar", async () => {
    await expect(
      removeProfileAvatarAction(profileAvatarFormState, new FormData()),
    ).resolves.toMatchObject({
      status: "success",
      message: "Foto de perfil eliminada.",
    });
    expect(mocks.deleteProfileAvatar).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000002",
    );
  });
});
