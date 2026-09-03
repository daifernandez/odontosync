import { describe, expect, it } from "vitest";

import {
  initialConfigurationFormState,
  validateInitialConfiguration,
} from "./initial-configuration";

const validInput = {
  fullName: "  Daiana   Fernández ",
  licenseNumber: "  MP 1234 ",
  licenseJurisdiction: " Buenos Aires ",
  clinicName: "  Clínica   del Parque ",
  officeAddress: " Av. Siempre Viva 742 ",
  contactPhone: " 11 4444 5555 ",
  contactEmail: " TURNOS@CLINICA.COM ",
  additionalInformation: " Atención con turno previo ",
  gridIntervalMinutes: "15",
  defaultAppointmentDurationMinutes: "30",
  defaultCleanupMinutes: "5",
  availability: [
    { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
  ],
};

describe("validateInitialConfiguration", () => {
  it("provides a serializable initial form state", () => {
    expect(initialConfigurationFormState).toEqual({
      status: "idle",
      fieldErrors: {},
    });
  });

  it("normalizes a complete valid configuration", () => {
    expect(validateInitialConfiguration(validInput)).toEqual({
      success: true,
      data: {
        fullName: "Daiana Fernández",
        licenseNumber: "MP 1234",
        licenseJurisdiction: "Buenos Aires",
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
          { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
        ],
      },
    });
  });

  it("normalizes blank optional profile values to null", () => {
    const result = validateInitialConfiguration({
      ...validInput,
      licenseNumber: " ",
      licenseJurisdiction: "",
      clinicName: " ",
      officeAddress: "",
      contactPhone: " ",
      contactEmail: "",
      additionalInformation: " ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.licenseNumber).toBeNull();
      expect(result.data.licenseJurisdiction).toBeNull();
      expect(result.data.clinicName).toBeNull();
      expect(result.data.officeAddress).toBeNull();
      expect(result.data.contactPhone).toBeNull();
      expect(result.data.contactEmail).toBeNull();
      expect(result.data.additionalInformation).toBeNull();
    }
  });

  it("rejects invalid or oversized public professional data", () => {
    expect(
      validateInitialConfiguration({
        ...validInput,
        clinicName: "C".repeat(121),
        officeAddress: "A".repeat(161),
        contactPhone: "1".repeat(51),
        contactEmail: "correo-invalido",
        additionalInformation: "I".repeat(161),
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        clinicName: "El nombre de la clínica admite hasta 120 caracteres.",
        officeAddress: "La dirección admite hasta 160 caracteres.",
        contactPhone: "El teléfono admite hasta 50 caracteres.",
        contactEmail: "Ingresá un email válido.",
        additionalInformation:
          "La información adicional admite hasta 160 caracteres.",
      },
    });
  });

  it("requires at least one availability block", () => {
    expect(
      validateInitialConfiguration({ ...validInput, availability: [] }),
    ).toMatchObject({
      success: false,
      fieldErrors: { availability: expect.any(String) },
    });
  });

  it("rejects unsupported or out-of-range agenda values", () => {
    expect(
      validateInitialConfiguration({
        ...validInput,
        gridIntervalMinutes: "17",
        defaultAppointmentDurationMinutes: "0",
        defaultCleanupMinutes: "1441",
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        gridIntervalMinutes: "Elegí un intervalo disponible.",
        defaultAppointmentDurationMinutes:
          "Ingresá una duración de entre 1 y 1440 minutos.",
        defaultCleanupMinutes:
          "Ingresá un margen de entre 0 y 1440 minutos.",
      },
    });
  });

  it("rejects invalid time ranges", () => {
    expect(
      validateInitialConfiguration({
        ...validInput,
        availability: [
          { dayOfWeek: 1, startTime: "18:00", endTime: "09:00" },
          { dayOfWeek: 8, startTime: "9:00", endTime: "13:00" },
        ],
      }),
    ).toMatchObject({
      success: false,
      fieldErrors: { availability: expect.any(String) },
    });
  });

  it("rejects overlapping blocks on the same day", () => {
    expect(
      validateInitialConfiguration({
        ...validInput,
        availability: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
          { dayOfWeek: 1, startTime: "12:30", endTime: "18:00" },
        ],
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        availability: "Los bloques de un mismo día no pueden superponerse.",
      },
    });
  });

  it("allows adjacent blocks and equal hours on different days", () => {
    const result = validateInitialConfiguration({
      ...validInput,
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
      ],
    });

    expect(result.success).toBe(true);
  });
});
