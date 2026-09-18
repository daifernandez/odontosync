import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/profile-avatar/actions", () => ({
  profileAvatarFormState: { status: "idle", message: "" },
  removeProfileAvatarAction: vi.fn(),
  uploadProfileAvatarAction: vi.fn(),
}));

import { ProfileAvatarForm } from "./profile-avatar-form";

describe("ProfileAvatarForm", () => {
  it("offers an optional constrained upload and removal for an existing photo", () => {
    const markup = renderToStaticMarkup(
      <ProfileAvatarForm
        avatarUrl="https://example.test/avatar.png"
        fullName="Dra. Valentina Rossi"
      />,
    );

    expect(markup).toContain('name="avatar"');
    expect(markup).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(markup).toContain("JPEG, PNG o WebP, hasta 2 MB");
    expect(markup).toContain("Guardar foto");
    expect(markup).toContain("Quitar foto y usar iniciales");
  });

  it("does not offer removal when the user has no photo", () => {
    const markup = renderToStaticMarkup(
      <ProfileAvatarForm avatarUrl={null} fullName="Ana Pérez" />,
    );

    expect(markup).not.toContain("Quitar foto y usar iniciales");
    expect(markup).toContain("AP");
  });
});
