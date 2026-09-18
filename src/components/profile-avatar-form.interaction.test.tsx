// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/profile-avatar/actions", () => ({
  profileAvatarFormState: { status: "idle", message: "" },
  removeProfileAvatarAction: vi.fn(),
  uploadProfileAvatarAction: vi.fn(),
}));

import { uploadProfileAvatarAction, removeProfileAvatarAction } from "@/modules/profile-avatar/actions";

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
    const input = screen.getByLabelText("Elegir foto");
    const file = new File(["preview"], "avatar.png", {
      type: "image/png",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "blob:avatar-preview",
    );
    expect(
      screen.getByText("Así se verá tu foto. Guardala para aplicar el cambio."),
    ).toBeTruthy();
    expect(screen.getByText("Elegir otra")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Guardar cambio" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
  });

  it("cancels an unsaved selection and restores the initials", () => {
    const { container } = render(
      <ProfileAvatarForm avatarUrl={null} fullName="Dra. Valentina Rossi" />,
    );
    const input = screen.getByLabelText<HTMLInputElement>("Elegir foto");

    fireEvent.change(input, {
      target: {
        files: [new File(["preview"], "avatar.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Dra. Valentina Rossi" }).textContent).toBe(
      "VR",
    );
    expect(input.value).toBe("");
  });
});

it("explains oversized and unsupported images before submitting", () => {
  render(<ProfileAvatarForm avatarUrl={null} fullName="Ana Pérez" />);
  const input = document.querySelector('input[type=file]')!;
  fireEvent.change(input, { target: { files: [new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.png", {type:"image/png"})] } });
  expect(screen.getByRole("alert").textContent).toContain("2 MB");
  fireEvent.change(input, { target: { files: [new File(["text"], "note.txt", {type:"text/plain"})] } });
  expect(screen.getByRole("alert").textContent).toContain("JPEG, PNG o WebP");
});
it("clears the saved selection and shows feedback from the latest operation", async () => {
  vi.mocked(uploadProfileAvatarAction).mockResolvedValue({status:"success",message:"Foto de perfil actualizada."});
  vi.mocked(removeProfileAvatarAction).mockResolvedValue({status:"success",message:"Foto de perfil eliminada."});
  const view = render(<ProfileAvatarForm avatarUrl={null} fullName="Ana Pérez" />);
  const choose = () => fireEvent.change(document.querySelector('input[type=file]')!, {target:{files:[new File(["png"],"avatar.png",{type:"image/png"})]}});
  choose();
  fireEvent.click(screen.getByRole("button", {name:"Guardar cambio"}));
  await waitFor(() => expect(screen.queryByRole("button", {name:"Guardar cambio"})).toBeNull());
  view.rerender(<ProfileAvatarForm avatarUrl="https://example.test/photo.png" fullName="Ana Pérez" />);
  expect(screen.getByText("Foto de perfil actualizada.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", {name:"Quitar foto"}));
  await waitFor(() => expect(screen.getByText("Foto de perfil eliminada.")).toBeTruthy());
  view.rerender(<ProfileAvatarForm avatarUrl={null} fullName="Ana Pérez" />);
  expect(screen.getByText("AP")).toBeTruthy();
  choose();
  vi.mocked(uploadProfileAvatarAction).mockResolvedValue({status:"error",message:"No pudimos guardar la foto."});
  fireEvent.click(screen.getByRole("button", {name:"Guardar cambio"}));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("No pudimos guardar la foto."));
});
