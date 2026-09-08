// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reschedule: vi.fn(),
  replace: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/modules/appointments/actions", () => ({
  rescheduleAppointmentAction: mocks.reschedule,
  cancelAppointmentAction: mocks.cancel,
  closeAppointmentAction: vi.fn(),
  confirmAppointmentAction: vi.fn(),
  updateAppointmentAction: vi.fn(),
}));

import { AppointmentManagementPanel } from "./appointment-management-panel";

const props = {
  appointment: {
    id: "appointment-1",
    patientId: "patient-1",
    patientFirstName: "Ana",
    patientLastName: "Prueba",
    startsAt: "2026-09-14T12:00:00Z",
    occupiedUntil: "2026-09-14T12:35:00Z",
    durationMinutes: 30,
    cleanupMinutes: 5,
    specialty: "control" as const,
    status: "confirmed" as const,
  },
  appointmentOccupancy: [
    {
      startsAt: "2026-09-14T13:00:00Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
    },
  ],
  availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }],
  currentTime: "2026-09-13T12:00:00Z",
  exceptionalBlocks: [],
  gridIntervalMinutes: 15,
  minimumDate: "2026-09-13",
  selectedDate: "2026-09-14",
  weekStartDate: "2026-09-14",
  view: "day" as const,
};

beforeEach(() => {
  mocks.reschedule.mockReset();
  mocks.replace.mockReset();
  mocks.cancel.mockReset();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(cleanup);

describe("rescheduling from the daily agenda", () => {
  it("keeps occupied times behind disclosure and requires a second explicit confirmation", async () => {
    mocks.reschedule.mockImplementation(async (_state, data: FormData) => ({
      status: "overlap",
      message: "Ese horario se superpone con otro turno.",
      fieldErrors: {},
      values: { startsAt: data.get("startsAt") },
    }));
    render(<AppointmentManagementPanel {...props} />);
    const disclosure = screen
      .getByText("Ver horarios ocupados")
      .closest("details")!;
    expect(disclosure.open).toBe(false);
    expect(
      within(disclosure).getByRole("radio", {
        name: "10:00 Ocupado",
        hidden: true,
      }),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Ver horarios ocupados"));
    fireEvent.click(screen.getByRole("radio", { name: "10:00 Ocupado" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Reprogramar y dejar pendiente" }),
    );
    await screen.findByRole("alert");
    expect(
      mocks.reschedule.mock.calls[0][1].get("overlapConfirmed"),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmar superposición y reprogramar",
      }),
    );
    await waitFor(() => expect(mocks.reschedule).toHaveBeenCalledTimes(2));
    expect(mocks.reschedule.mock.calls[1][1].get("startsAt")).toBe(
      "2026-09-14T10:00",
    );
    expect(mocks.reschedule.mock.calls[1][1].get("overlapConfirmed")).toBe(
      "true",
    );
    fireEvent.click(screen.getByRole("radio", { name: "11:00" }));
    expect(
      screen.queryByRole("button", {
        name: "Confirmar superposición y reprogramar",
      }),
    ).toBeNull();
  });

  it("updates the destination while preserving the original, and can close without saving", () => {
    render(<AppointmentManagementPanel {...props} />);
    fireEvent.click(screen.getByRole("radio", { name: "11:00" }));
    expect(screen.getByText("14/09/2026 · 09:00")).toBeTruthy();
    expect(screen.getByText("14/09/2026 · 11:00")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Conservar turno original" }),
    );
    expect(mocks.reschedule).not.toHaveBeenCalled();
    expect(mocks.cancel).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith(
      "/app/agenda?semana=2026-09-14&vista=dia&fecha=2026-09-14",
      { scroll: false },
    );
  });
});
