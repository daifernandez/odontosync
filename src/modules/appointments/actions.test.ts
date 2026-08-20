import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cancelAppointment: vi.fn(),
  createAppointment: vi.fn(),
  getClaims: vi.fn(),
  getInitialConfiguration: vi.fn(),
  getPendingAppointmentById: vi.fn(),
  updateAppointment: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));

vi.mock("@/modules/initial-configuration/repository", () => ({
  getInitialConfiguration: mocks.getInitialConfiguration,
}));

vi.mock("./repository", () => ({
  cancelAppointment: mocks.cancelAppointment,
  createAppointment: mocks.createAppointment,
  getPendingAppointmentById: mocks.getPendingAppointmentById,
  updateAppointment: mocks.updateAppointment,
}));

import { createAppointmentAction, updateAppointmentAction } from "./actions";
import { appointmentFormState } from "./domain/appointment";

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
    formData.set("specialty", "general");

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
});
