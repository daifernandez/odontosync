import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cancelAppointment: vi.fn(),
  closeAppointment: vi.fn(),
  confirmAppointment: vi.fn(),
  createAppointment: vi.fn(),
  getClaims: vi.fn(),
  getInitialConfiguration: vi.fn(),
  listExceptionalBlocks: vi.fn(),
  getConfirmedAppointmentById: vi.fn(),
  getPendingAppointmentById: vi.fn(),
  rescheduleAppointment: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  updateAppointment: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));

vi.mock("@/modules/initial-configuration/repository", () => ({
  getInitialConfiguration: mocks.getInitialConfiguration,
}));

vi.mock("@/modules/exceptional-blocks/repository", () => ({
  listExceptionalBlocks: mocks.listExceptionalBlocks,
}));

vi.mock("./repository", () => ({
  cancelAppointment: mocks.cancelAppointment,
  closeAppointment: mocks.closeAppointment,
  confirmAppointment: mocks.confirmAppointment,
  createAppointment: mocks.createAppointment,
  getConfirmedAppointmentById: mocks.getConfirmedAppointmentById,
  getPendingAppointmentById: mocks.getPendingAppointmentById,
  rescheduleAppointment: mocks.rescheduleAppointment,
  updateAppointment: mocks.updateAppointment,
}));

import {
  cancelAppointmentAction,
  closeAppointmentAction,
  confirmAppointmentAction,
  createAppointmentAction,
  rescheduleAppointmentAction,
  updateAppointmentAction,
} from "./actions";
import {
  appointmentFormState,
  appointmentRescheduleState,
} from "./domain/appointment";

describe("createAppointmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.getInitialConfiguration.mockResolvedValue({
      fullName: "Profesional de prueba",
      licenseNumber: null,
      licenseJurisdiction: null,
      gridIntervalMinutes: 15,
      defaultAppointmentDurationMinutes: 30,
      defaultCleanupMinutes: 5,
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" },
      ],
    });
    mocks.listExceptionalBlocks.mockResolvedValue([]);
  });

  it("returns submitted values when validation fails", async () => {
    const formData = new FormData();
    formData.set("patientId", "00000000-0000-4000-8000-000000000001");
    formData.set("startsAt", "");
    formData.set("durationMinutes", "45");
    formData.set("cleanupMinutes", "10");
    formData.set("specialty", "orthodontics");

    const result = await createAppointmentAction(
      appointmentFormState,
      formData,
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors).toEqual({
      startsAt: "Elegí una fecha y hora futuras válidas.",
    });
    expect(result.values).toEqual({
      patientId: "00000000-0000-4000-8000-000000000001",
      startsAt: "",
      durationMinutes: "45",
      cleanupMinutes: "10",
      specialty: "orthodontics",
    });
  });

  it("rejects a valid-looking time outside configured availability", async () => {
    const formData = new FormData();
    formData.set("patientId", "00000000-0000-4000-8000-000000000001");
    formData.set("startsAt", "2099-01-01T09:00");
    formData.set("durationMinutes", "30");
    formData.set("cleanupMinutes", "5");
    formData.set("specialty", "restorative");

    const result = await createAppointmentAction(
      appointmentFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: {
        startsAt: "Elegí uno de los horarios disponibles.",
      },
    });
    expect(mocks.createAppointment).not.toHaveBeenCalled();
  });

  it("reports an atomic overlap when reprogramming a pending appointment", async () => {
    mocks.getInitialConfiguration.mockResolvedValue({
      fullName: "Profesional de prueba",
      licenseNumber: null,
      licenseJurisdiction: null,
      gridIntervalMinutes: 15,
      defaultAppointmentDurationMinutes: 30,
      defaultCleanupMinutes: 5,
      availability: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "11:00" },
      ],
    });
    mocks.getPendingAppointmentById.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000010",
      patientId: "00000000-0000-4000-8000-000000000001",
      patientFirstName: "Lucía",
      patientLastName: "Prueba",
      startsAt: "2027-08-10T12:00:00.000Z",
      occupiedUntil: "2027-08-10T12:35:00.000Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
      specialty: "general",
      status: "pending_confirmation",
    });
    mocks.updateAppointment.mockResolvedValue("overlap");
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2027-08-09");
    formData.set("startsAt", "2027-08-10T09:00");
    formData.set("durationMinutes", "30");
    formData.set("cleanupMinutes", "5");
    formData.set("specialty", "implantology");

    const result = await updateAppointmentAction(
      appointmentFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Ese horario se superpone con otro turno.",
      fieldErrors: { startsAt: "Elegí otro horario disponible." },
    });
  });

  it("rejects a stale submitted time that is now exceptionally blocked", async () => {
    mocks.getInitialConfiguration.mockResolvedValue({
      fullName: "Profesional de prueba",
      licenseNumber: null,
      licenseJurisdiction: null,
      gridIntervalMinutes: 15,
      defaultAppointmentDurationMinutes: 30,
      defaultCleanupMinutes: 5,
      availability: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "11:00" },
      ],
    });
    mocks.listExceptionalBlocks.mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000020",
        startsAt: "2099-08-11T12:00:00.000Z",
        endsAt: "2099-08-11T13:00:00.000Z",
        category: "vacation",
      },
    ]);
    const formData = new FormData();
    formData.set("patientId", "00000000-0000-4000-8000-000000000001");
    formData.set("startsAt", "2099-08-11T09:00");
    formData.set("durationMinutes", "30");
    formData.set("cleanupMinutes", "5");
    formData.set("specialty", "restorative");

    const result = await createAppointmentAction(
      appointmentFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Ese período está marcado como no disponible.",
      fieldErrors: { startsAt: "Elegí otro horario disponible." },
    });
    expect(mocks.createAppointment).not.toHaveBeenCalled();
  });
});

describe("confirmAppointmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.confirmAppointment.mockResolvedValue("confirmed");
  });

  it("confirms a pending appointment and returns to its agenda week", async () => {
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");

    await expect(confirmAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&confirmado=1",
    );
    expect(mocks.confirmAppointment).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
    );
  });

  it("preserves the selected daily view after confirming", async () => {
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");
    formData.set("agendaView", "day");
    formData.set("agendaDate", "2026-08-12");

    await expect(confirmAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&vista=dia&fecha=2026-08-12&confirmado=1",
    );
  });

  it("does not confirm when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");

    await expect(confirmAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&errorGestion=1",
    );
    expect(mocks.confirmAppointment).not.toHaveBeenCalled();
  });
});

describe("cancelAppointmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.cancelAppointment.mockResolvedValue("cancelled");
  });

  it("cancels an eligible appointment and returns to its agenda week", async () => {
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");

    await expect(cancelAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&cancelado=1",
    );
    expect(mocks.cancelAppointment).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
    );
  });

  it("does not cancel when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");

    await expect(cancelAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&errorGestion=1",
    );
    expect(mocks.cancelAppointment).not.toHaveBeenCalled();
  });

  it("reports an ineligible appointment without exposing database details", async () => {
    mocks.cancelAppointment.mockResolvedValue("unavailable");
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");

    await expect(cancelAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&errorGestion=1",
    );
  });
});

describe("closeAppointmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.closeAppointment.mockResolvedValue("completed");
  });

  it("marks a finished confirmed appointment as completed", async () => {
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");
    formData.set("closureStatus", "completed");

    await expect(closeAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&cierre=completed",
    );
    expect(mocks.closeAppointment).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
      "completed",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/app/pacientes",
      "layout",
    );
  });

  it("accepts cancellation as the outcome of an unclosed appointment", async () => {
    mocks.closeAppointment.mockResolvedValue("cancelled");
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");
    formData.set("closureStatus", "cancelled");

    await expect(closeAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&cierre=cancelled",
    );
    expect(mocks.closeAppointment).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
      "cancelled",
    );
  });

  it("rejects an invalid closure status before reaching the repository", async () => {
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");
    formData.set("closureStatus", "confirmed");

    await expect(closeAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&errorGestion=1",
    );
    expect(mocks.closeAppointment).not.toHaveBeenCalled();
  });

  it("does not close an appointment when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("appointmentId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2026-08-10");
    formData.set("closureStatus", "no_show");

    await expect(closeAppointmentAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2026-08-10&errorGestion=1",
    );
    expect(mocks.closeAppointment).not.toHaveBeenCalled();
  });
});

describe("rescheduleAppointmentAction", () => {
  const appointment = {
    id: "00000000-0000-4000-8000-000000000010",
    patientId: "00000000-0000-4000-8000-000000000001",
    patientFirstName: "Lucía",
    patientLastName: "Prueba",
    startsAt: "2099-08-10T15:00:00.000Z",
    occupiedUntil: "2099-08-10T15:35:00.000Z",
    durationMinutes: 30,
    cleanupMinutes: 5,
    specialty: "general" as const,
    status: "confirmed" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.getConfirmedAppointmentById.mockResolvedValue(appointment);
    mocks.getInitialConfiguration.mockResolvedValue({
      fullName: "Profesional de prueba",
      licenseNumber: null,
      licenseJurisdiction: null,
      gridIntervalMinutes: 15,
      defaultAppointmentDurationMinutes: 30,
      defaultCleanupMinutes: 5,
      availability: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "11:00" },
      ],
    });
    mocks.listExceptionalBlocks.mockResolvedValue([]);
    mocks.rescheduleAppointment.mockResolvedValue("rescheduled");
  });

  it("reprograms an eligible confirmed appointment and opens the new week", async () => {
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");

    await expect(
      rescheduleAppointmentAction(appointmentRescheduleState, formData),
    ).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&reprogramado=1",
    );
    expect(mocks.rescheduleAppointment).toHaveBeenCalledWith(
      appointment.id,
      "2099-08-11T12:00:00.000Z",
      false,
    );
  });

  it("moves the daily view to the rescheduled date", async () => {
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");
    formData.set("agendaView", "day");
    formData.set("agendaDate", "2099-08-10");

    await expect(
      rescheduleAppointmentAction(appointmentRescheduleState, formData),
    ).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&vista=dia&fecha=2099-08-11&reprogramado=1",
    );
  });

  it("requires an explicit second submission when the new time overlaps", async () => {
    mocks.rescheduleAppointment.mockResolvedValue("overlap");
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");

    const result = await rescheduleAppointmentAction(
      appointmentRescheduleState,
      formData,
    );

    expect(result).toEqual({
      status: "overlap",
      message:
        "Ese horario se superpone con otro turno. Confirmá la superposición para continuar.",
      fieldErrors: {},
      values: { startsAt: "2099-08-11T09:00" },
    });
    expect(mocks.rescheduleAppointment).toHaveBeenCalledWith(
      appointment.id,
      "2099-08-11T12:00:00.000Z",
      false,
    );
  });

  it("passes the explicit overlap confirmation to the atomic operation", async () => {
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");
    formData.set("overlapConfirmed", "true");

    await expect(
      rescheduleAppointmentAction(appointmentRescheduleState, formData),
    ).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&reprogramado=1",
    );
    expect(mocks.rescheduleAppointment).toHaveBeenCalledWith(
      appointment.id,
      "2099-08-11T12:00:00.000Z",
      true,
    );
  });

  it("rejects a time outside configured availability before writing", async () => {
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T12:00");

    const result = await rescheduleAppointmentAction(
      appointmentRescheduleState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { startsAt: "Elegí uno de los horarios configurados." },
    });
    expect(mocks.rescheduleAppointment).not.toHaveBeenCalled();
  });

  it("does not reprogram an unavailable or foreign appointment", async () => {
    mocks.getConfirmedAppointmentById.mockResolvedValue(null);
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");

    const result = await rescheduleAppointmentAction(
      appointmentRescheduleState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "El turno ya no está disponible para reprogramar.",
    });
    expect(mocks.rescheduleAppointment).not.toHaveBeenCalled();
  });

  it("does not reprogram without a valid session", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("appointmentId", appointment.id);
    formData.set("startsAt", "2099-08-11T09:00");

    const result = await rescheduleAppointmentAction(
      appointmentRescheduleState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    });
    expect(mocks.getConfirmedAppointmentById).not.toHaveBeenCalled();
    expect(mocks.rescheduleAppointment).not.toHaveBeenCalled();
  });
});
