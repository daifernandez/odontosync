// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/profile-avatar/actions", () => ({
  profileAvatarFormState: { status: "idle", message: "" },
  removeProfileAvatarAction: vi.fn(),
  uploadProfileAvatarAction: vi.fn(),
}));

import { ProfileAvatarForm } from "./profile-avatar-form";

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:avatar-preview"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileAvatarForm interactions", () => {
  it("previews the selected image before saving it", () => {
    const { container } = render(
      <ProfileAvatarForm avatarUrl={null} fullName="Dra. Valentina Rossi" />,
    );
    const input = screen.getByLabelText("Elegir imagen");
    const file = new File(["preview"], "avatar.png", {
      type: "image/png",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "blob:avatar-preview",
    );
    expect(screen.getByText("Vista previa de la imagen seleccionada.")).toBeTruthy();
  });

  it("cancels an unsaved selection and restores the initials", () => {
    const { container } = render(
      <ProfileAvatarForm avatarUrl={null} fullName="Dra. Valentina Rossi" />,
    );
    const input = screen.getByLabelText<HTMLInputElement>("Elegir imagen");

    fireEvent.change(input, {
      target: {
        files: [new File(["preview"], "avatar.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar selección" }));

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Dra. Valentina Rossi" }).textContent).toBe(
      "VR",
    );
    expect(input.value).toBe("");
  });
});
