import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  getInitialConfiguration: vi.fn(),
  revalidatePath: vi.fn(),
  saveInitialConfiguration: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));
vi.mock("./repository", () => ({
  getInitialConfiguration: mocks.getInitialConfiguration,
  saveInitialConfiguration: mocks.saveInitialConfiguration,
}));

import {
  saveAgendaPreferencesAction,
  saveAvailabilityAction,
  saveDocumentSettingsAction,
  saveProfileSettingsAction,
} from "./actions";
import {
  configurationFormState,
  type InitialConfiguration,
} from "./domain/initial-configuration";

const current: InitialConfiguration = {
  fullName: "Dra. Ana Pérez",
  licenseNumber: "MN 12345",
  licenseJurisdiction: "CABA",
  clinicName: "Clínica del Parque",
  officeAddress: "Av. Siempre Viva 742",
  contactPhone: "11 4444 5555",
  contactEmail: "turnos@clinica.com",
  additionalInformation: "Atención con turno previo",
  gridIntervalMinutes: 15,
  defaultAppointmentDurationMinutes: 30,
  defaultCleanupMinutes: 5,
  availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "13:00" }],
};

describe("section configuration actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.getInitialConfiguration.mockResolvedValue(current);
    mocks.saveInitialConfiguration.mockResolvedValue(undefined);
  });

  it("updates only profile fields and preserves the other sections", async () => {
    const formData = new FormData();
    formData.set("fullName", " Dra. Valentina Rossi ");
    formData.set("licenseNumber", "MP 9876");
    formData.set("licenseJurisdiction", "Buenos Aires");

    await expect(
      saveProfileSettingsAction(configurationFormState, formData),
    ).resolves.toMatchObject({ status: "success" });

    expect(mocks.saveInitialConfiguration).toHaveBeenCalledWith({
      ...current,
      fullName: "Dra. Valentina Rossi",
      licenseNumber: "MP 9876",
      licenseJurisdiction: "Buenos Aires",
    });
  });

  it("updates document fields without changing profile or agenda data", async () => {
    const formData = new FormData();
    formData.set("clinicName", "Consultorio Central");
    formData.set("officeAddress", "Calle 123");
    formData.set("contactPhone", "11 5555 5555");
    formData.set("contactEmail", "TURNOS@EJEMPLO.COM");
    formData.set("additionalInformation", "Sólo con turno");

    await saveDocumentSettingsAction(configurationFormState, formData);

    expect(mocks.saveInitialConfiguration).toHaveBeenCalledWith({
      ...current,
      clinicName: "Consultorio Central",
      officeAddress: "Calle 123",
      contactPhone: "11 5555 5555",
      contactEmail: "turnos@ejemplo.com",
      additionalInformation: "Sólo con turno",
    });
  });

  it("updates agenda preferences independently", async () => {
    const formData = new FormData();
    formData.set("gridIntervalMinutes", "10");
    formData.set("defaultAppointmentDurationMinutes", "45");
    formData.set("defaultCleanupMinutes", "10");

    await saveAgendaPreferencesAction(configurationFormState, formData);

    expect(mocks.saveInitialConfiguration).toHaveBeenCalledWith({
      ...current,
      gridIntervalMinutes: 10,
      defaultAppointmentDurationMinutes: 45,
      defaultCleanupMinutes: 10,
    });
  });

  it("normalizes and sorts weekly availability", async () => {
    const formData = new FormData();
    formData.set(
      "availability",
      JSON.stringify([
        { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
      ]),
    );

    await saveAvailabilityAction(configurationFormState, formData);

    expect(mocks.saveInitialConfiguration).toHaveBeenCalledWith({
      ...current,
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
      ],
    });
  });

  it("does not read or save private settings when the session expired", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = new FormData();
    formData.set("fullName", "Dra. Ana Pérez");

    await expect(
      saveProfileSettingsAction(configurationFormState, formData),
    ).resolves.toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para guardar los cambios.",
    });
    expect(mocks.getInitialConfiguration).not.toHaveBeenCalled();
    expect(mocks.saveInitialConfiguration).not.toHaveBeenCalled();
  });

  it("rejects a section before reading stored configuration", async () => {
    const formData = new FormData();
    formData.set("gridIntervalMinutes", "17");
    formData.set("defaultAppointmentDurationMinutes", "0");
    formData.set("defaultCleanupMinutes", "5");

    await expect(
      saveAgendaPreferencesAction(configurationFormState, formData),
    ).resolves.toMatchObject({
      status: "error",
      fieldErrors: {
        gridIntervalMinutes: "Elegí un intervalo disponible.",
      },
    });
    expect(mocks.getInitialConfiguration).not.toHaveBeenCalled();
  });
});
