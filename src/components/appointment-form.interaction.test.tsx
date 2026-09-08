// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createAction } = vi.hoisted(() => ({ createAction: vi.fn() }));
vi.mock("@/modules/appointments/actions", () => ({
  createAppointmentAction: createAction,
}));

import { AppointmentForm } from "./appointment-form";

const props = {
  appointmentOccupancy: [],
  availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }],
  currentTime: "2026-09-13T12:00:00Z",
  exceptionalBlocks: [],
  defaultDurationMinutes: 30,
  defaultCleanupMinutes: 5,
  gridIntervalMinutes: 15,
  initialDate: "2026-09-14",
  initialTime: "10:00",
  initialPatientId: "patient-1",
  minimumDate: "2026-09-13",
  patients: [{ id: "patient-1", firstName: "Ana", lastName: "Prueba" }],
};

afterEach(cleanup);
beforeEach(() => {
  createAction.mockReset();
});

describe("appointment time selection", () => {
  it("preserves a valid time when duration or cleanup changes", () => {
    render(<AppointmentForm {...props} />);
    expect(new FormData(document.querySelector("form")!).get("patientId")).toBe(
      "patient-1",
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /Duración estimada/ }),
      { target: { value: "45" } },
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /Acondicionamiento/ }),
      { target: { value: "10" } },
    );
    expect(new FormData(document.querySelector("form")!).get("startsAt")).toBe(
      "2026-09-14T10:00",
    );
    expect(screen.getByText(/14\/09\/2026 a las 10:00/)).toBeTruthy();
  });

  it("explains invalidation and prevents submitting a now-occupied time", () => {
    render(
      <AppointmentForm
        {...props}
        appointmentOccupancy={[
          {
            startsAt: "2026-09-14T13:45:00Z",
            durationMinutes: 30,
            cleanupMinutes: 5,
          },
        ]}
      />,
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /Duración estimada/ }),
      { target: { value: "45" } },
    );
    expect(
      new FormData(document.querySelector("form")!).get("startsAt"),
    ).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(
      /10:00.*ya no.*disponible/,
    );
    expect(
      screen.getByRole("radio", { name: "09:00", hidden: true }),
    ).toBeTruthy();
  });

  it("keeps corrected values after a server error and allows a retry", async () => {
    createAction.mockResolvedValue({
      status: "error",
      message: "No pudimos guardar. Intentá nuevamente.",
      fieldErrors: {},
      values: {
        patientId: "patient-1",
        startsAt: "2026-09-14T10:00",
        durationMinutes: "45",
        cleanupMinutes: "5",
        specialty: "control",
      },
    });
    render(<AppointmentForm {...props} />);
    expect(new FormData(document.querySelector("form")!).get("patientId")).toBe(
      "patient-1",
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /Duración estimada/ }),
      { target: { value: "45" } },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Área odontológica" }),
      { target: { value: "control" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar turno pendiente" }),
    );
    await screen.findByRole("alert");
    expect(
      (
        screen.getByRole("spinbutton", {
          name: /Duración estimada/,
        }) as HTMLInputElement
      ).value,
    ).toBe("45");
    expect(new FormData(document.querySelector("form")!).get("startsAt")).toBe(
      "2026-09-14T10:00",
    );
    expect(new FormData(document.querySelector("form")!).get("patientId")).toBe(
      "patient-1",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar turno pendiente" }),
    );
    await waitFor(() => expect(createAction).toHaveBeenCalledTimes(2));
  });

  it("does not replace a missing patient with the first patient after validation", async () => {
    createAction.mockResolvedValue({
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: { patientId: "Elegí un paciente activo." },
    });
    render(<AppointmentForm {...props} initialPatientId="" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar turno pendiente" }),
    );
    await screen.findByRole("alert");
    expect(
      (
        screen.getByRole("combobox", {
          name: /Paciente ficticio/,
        }) as HTMLSelectElement
      ).value,
    ).toBe("");
  });

  it("disables saving while the request is pending", async () => {
    let resolve!: (value: unknown) => void;
    createAction.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(<AppointmentForm {...props} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar turno pendiente" }),
    );
    expect(
      (
        (await screen.findByRole("button", {
          name: "Guardando…",
        })) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await act(async () =>
      resolve({ status: "error", message: "Reintentá", fieldErrors: {} }),
    );
  });
});
