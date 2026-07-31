import { describe, expect, it } from "vitest";

import { validateInitialConfiguration } from "./initial-configuration";

const validInput = {
  fullName: "  Daiana   Fernández ",
  licenseNumber: "  MP 1234 ",
  licenseJurisdiction: " Buenos Aires ",
  gridIntervalMinutes: "15",
  defaultAppointmentDurationMinutes: "30",
  defaultCleanupMinutes: "5",
  availability: [
    { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
  ],
};

describe("validateInitialConfiguration", () => {
  it("normalizes a complete valid configuration", () => {
    expect(validateInitialConfiguration(validInput)).toEqual({
      success: true,
      data: {
        fullName: "Daiana Fernández",
        licenseNumber: "MP 1234",
        licenseJurisdiction: "Buenos Aires",
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
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.licenseNumber).toBeNull();
      expect(result.data.licenseJurisdiction).toBeNull();
    }
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
