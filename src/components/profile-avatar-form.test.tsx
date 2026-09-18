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
    expect(markup).toContain("Cambiar foto");
    expect(markup).toContain("Podés reemplazarla o volver a tus iniciales.");
    expect(markup).toContain("Volver a mis iniciales");
    expect(markup).not.toContain("Guardar cambio");
  });

  it("does not offer removal when the user has no photo", () => {
    const markup = renderToStaticMarkup(
      <ProfileAvatarForm avatarUrl={null} fullName="Ana Pérez" />,
    );

    expect(markup).toContain("Elegir foto");
    expect(markup).toContain("JPG, PNG o WebP · Máximo 2 MB.");
    expect(markup).not.toContain("Volver a mis iniciales");
    expect(markup).not.toContain("Guardar cambio");
    expect(markup).toContain("AP");
  });
});
