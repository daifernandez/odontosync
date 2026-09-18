/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/initial-configuration/actions", () => ({
  saveAgendaPreferencesAction: vi.fn(),
}));

import { AgendaPreferencesForm } from "./agenda-preferences-form";

afterEach(cleanup);

describe("AgendaPreferencesForm", () => {
  it("updates the live example from the quick duration choices", () => {
    render(
      <AgendaPreferencesForm
        initialPreferences={{
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
        }}
      />,
    );

    expect(screen.getByText("09:35")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "45 minutos" }));

    expect(
      (screen.getByLabelText("Duración personalizada") as HTMLInputElement)
        .value,
    ).toBe("45");
    expect(screen.getByText("09:50")).toBeTruthy();
    expect(
      (screen.getByRole("button", {
        name: "Guardar preferencias",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("offers a clear option to remove the time between appointments", () => {
    render(
      <AgendaPreferencesForm
        initialPreferences={{
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Sin tiempo posterior" }),
    );

    expect(
      (screen.getByLabelText("Tiempo posterior personalizado") as HTMLInputElement)
        .value,
    ).toBe("0");
    expect(screen.getByText("09:30")).toBeTruthy();
  });
});
