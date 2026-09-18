import { describe, expect, it } from "vitest";

import {
  configurationFormState,
  validateAgendaPreferences,
  validateAvailability,
  validateDocumentSettings,
  validateProfileSettings,
} from "./initial-configuration";

describe("section configuration validators", () => {
  it("provides a serializable state for independent forms", () => {
    expect(configurationFormState).toEqual({
      status: "idle",
      fieldErrors: {},
    });
  });

  it("normalizes profile fields independently", () => {
    expect(
      validateProfileSettings({
        fullName: "  Dra.   Valentina Rossi ",
        licenseNumber: " MN 12345 ",
        licenseJurisdiction: " CABA ",
      }),
    ).toEqual({
      success: true,
      data: {
        fullName: "Dra. Valentina Rossi",
        licenseNumber: "MN 12345",
        licenseJurisdiction: "CABA",
      },
    });
  });

  it("rejects an invalid profile without depending on another section", () => {
    expect(
      validateProfileSettings({
        fullName: " ",
        licenseNumber: "M".repeat(51),
        licenseJurisdiction: "J".repeat(101),
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        fullName: "Ingresá un nombre de entre 3 y 120 caracteres.",
        licenseNumber: "La matrícula admite hasta 50 caracteres.",
        licenseJurisdiction: "La jurisdicción admite hasta 100 caracteres.",
      },
    });
  });

  it("normalizes blank optional document values to null", () => {
    expect(
      validateDocumentSettings({
        clinicName: " ",
        officeAddress: "",
        contactPhone: " ",
        contactEmail: "",
        additionalInformation: " ",
      }),
    ).toEqual({
      success: true,
      data: {
        clinicName: null,
        officeAddress: null,
        contactPhone: null,
        contactEmail: null,
        additionalInformation: null,
      },
    });
  });

  it("validates and normalizes patient document data independently", () => {
    expect(
      validateDocumentSettings({
        clinicName: " Consultorio Central ",
        officeAddress: " Calle 123 ",
        contactPhone: " 11 5555 5555 ",
        contactEmail: "TURNOS@EJEMPLO.COM",
        additionalInformation: " Sólo con turno ",
      }),
    ).toEqual({
      success: true,
      data: {
        clinicName: "Consultorio Central",
        officeAddress: "Calle 123",
        contactPhone: "11 5555 5555",
        contactEmail: "turnos@ejemplo.com",
        additionalInformation: "Sólo con turno",
      },
    });
  });

  it("rejects invalid or oversized public document data", () => {
    expect(
      validateDocumentSettings({
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

  it("validates agenda preferences with their units independently", () => {
    expect(
      validateAgendaPreferences({
        gridIntervalMinutes: "15",
        defaultAppointmentDurationMinutes: "30",
        defaultCleanupMinutes: "5",
      }),
    ).toEqual({
      success: true,
      data: {
        gridIntervalMinutes: 15,
        defaultAppointmentDurationMinutes: 30,
        defaultCleanupMinutes: 5,
      },
    });
  });

  it("rejects unsupported or out-of-range agenda values", () => {
    expect(
      validateAgendaPreferences({
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

  it("requires at least one valid availability block", () => {
    expect(validateAvailability([])).toMatchObject({
      success: false,
      fieldErrors: { availability: expect.any(String) },
    });
    expect(
      validateAvailability([
        { dayOfWeek: 1, startTime: "18:00", endTime: "09:00" },
      ]),
    ).toMatchObject({
      success: false,
      fieldErrors: { availability: expect.any(String) },
    });
  });

  it("reports overlapping availability independently", () => {
    expect(
      validateAvailability([
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "12:30", endTime: "18:00" },
      ]),
    ).toEqual({
      success: false,
      fieldErrors: {
        availability: "Los bloques de un mismo día no pueden superponerse.",
      },
    });
  });

  it("sorts valid blocks and allows adjacent hours", () => {
    expect(
      validateAvailability([
        { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
      ]),
    ).toEqual({
      success: true,
      data: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
      ],
    });
  });
});
