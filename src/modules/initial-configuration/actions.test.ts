import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  revalidatePath: vi.fn(),
  saveInitialConfiguration: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));
vi.mock("./repository", () => ({
  saveInitialConfiguration: mocks.saveInitialConfiguration,
}));

import { saveInitialConfigurationAction } from "./actions";
import { initialConfigurationFormState } from "./domain/initial-configuration";

function buildValidFormData() {
  const formData = new FormData();
  formData.set("fullName", "Dra. Ana Pérez");
  formData.set("licenseNumber", "MN 12345");
  formData.set("licenseJurisdiction", "CABA");
  formData.set("clinicName", "Clínica del Parque");
  formData.set("officeAddress", "Av. Siempre Viva 742");
  formData.set("contactPhone", "11 4444 5555");
  formData.set("contactEmail", "TURNOS@CLINICA.COM");
  formData.set("additionalInformation", "Atención con turno previo");
  formData.set("gridIntervalMinutes", "15");
  formData.set("defaultAppointmentDurationMinutes", "30");
  formData.set("defaultCleanupMinutes", "5");
  formData.set(
    "availability",
    JSON.stringify([
      { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
    ]),
  );
  return formData;
}

describe("saveInitialConfigurationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.saveInitialConfiguration.mockResolvedValue(undefined);
  });

  it("saves normalized professional data without a print preference", async () => {
    await expect(
      saveInitialConfigurationAction(
        initialConfigurationFormState,
        buildValidFormData(),
      ),
    ).rejects.toThrow("redirect:/app");

    expect(mocks.saveInitialConfiguration).toHaveBeenCalledWith({
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
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
      ],
    });
  });

  it("does not save when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });

    await expect(
      saveInitialConfigurationAction(
        initialConfigurationFormState,
        buildValidFormData(),
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para guardar los cambios.",
    });
    expect(mocks.saveInitialConfiguration).not.toHaveBeenCalled();
  });
});
