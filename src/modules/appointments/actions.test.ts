import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAppointment: vi.fn(),
  getClaims: vi.fn(),
  getInitialConfiguration: vi.fn(),
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
  createAppointment: mocks.createAppointment,
}));

import { createAppointmentAction } from "./actions";
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
});
