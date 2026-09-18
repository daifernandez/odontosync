/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/initial-configuration/actions", () => ({
  saveProfileSettingsAction: vi.fn(),
}));

import { saveProfileSettingsAction } from "@/modules/initial-configuration/actions";

import { ProfileSettingsForm } from "./profile-settings-form";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("ProfileSettingsForm", () => {
  it("enables saving after an edit and warns before following a link", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <>
        <ProfileSettingsForm
          initialProfile={{
            fullName: "Dra. Valentina Rossi",
            licenseNumber: null,
            licenseJurisdiction: null,
          }}
        />
        <a href="/app/configuracion">Volver al resumen</a>
      </>,
    );

    const saveButton = screen.getByRole("button", { name: "Guardar perfil" }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Dra. Valentina R. Rossi" },
    });

    expect(saveButton.disabled).toBe(false);
    expect(screen.getByText("Tenés cambios sin guardar")).toBeTruthy();
    expect(fireEvent.click(screen.getByRole("link", { name: "Volver al resumen" }))).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
  });

  it("keeps an invalid edit available for retry after a save error", async () => {
    vi.mocked(saveProfileSettingsAction).mockResolvedValue({
      status: "error",
      message: "No pudimos guardar los cambios.",
      fieldErrors: {},
    });

    render(
      <ProfileSettingsForm
        initialProfile={{
          fullName: "Dra. Valentina Rossi",
          licenseNumber: null,
          licenseJurisdiction: null,
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Dra. Valentina R. Rossi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));

    await waitFor(() => {
      expect(screen.getByText("No pudimos guardar los cambios.")).toBeTruthy();
    });
    expect(
      (screen.getByRole("button", {
        name: "Guardar perfil",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});

it("locks edits while saving and keeps the submitted name after success", async () => {
  let finish!: (value: {status: "success"; message: string; fieldErrors: Record<string, string>}) => void;
  vi.mocked(saveProfileSettingsAction).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  render(<ProfileSettingsForm initialProfile={{fullName: "Ana Pérez", licenseNumber: null, licenseJurisdiction: null}} />);
  const name = screen.getByLabelText("Nombre completo") as HTMLInputElement;
  fireEvent.change(name, {target: {value: "Ana García"}});
  fireEvent.click(screen.getByRole("button", {name: "Guardar perfil"}));
  await waitFor(() => expect(name.matches(":disabled")).toBe(true));
  await act(async () => finish({status: "success", message: "Perfil guardado.", fieldErrors: {}}));
  expect(name.matches(":disabled")).toBe(false);
  expect(name.value).toBe("Ana García");
});
