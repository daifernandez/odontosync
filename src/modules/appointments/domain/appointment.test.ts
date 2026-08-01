import { describe, expect, it } from "vitest";

import {
  appointmentFormState,
  validateAppointment,
} from "./appointment";

const now = new Date("2026-08-01T12:00:00.000Z");
const validInput = {
  patientId: "ef3debb5-125b-4ca4-8847-848960465589",
  startsAt: "2026-08-03T09:30",
  durationMinutes: "30",
  cleanupMinutes: "5",
  specialty: "general",
};

describe("validateAppointment", () => {
  it("provides a serializable initial form state", () => {
    expect(appointmentFormState).toEqual({
      status: "idle",
      fieldErrors: {},
    });
  });

  it("normalizes a valid appointment in the Argentina timezone", () => {
    expect(validateAppointment(validInput, now)).toEqual({
      success: true,
      data: {
        patientId: validInput.patientId,
        startsAt: "2026-08-03T12:30:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "general",
      },
    });
  });

  it("rejects invalid identifiers and unsupported specialties", () => {
    expect(
      validateAppointment(
        { ...validInput, patientId: "otro-paciente", specialty: "otra" },
        now,
      ),
    ).toMatchObject({
      success: false,
      fieldErrors: {
        patientId: expect.any(String),
        specialty: expect.any(String),
      },
    });
  });

  it("rejects invalid or past local dates", () => {
    expect(
      validateAppointment({ ...validInput, startsAt: "2026-02-30T09:30" }, now),
    ).toMatchObject({
      success: false,
      fieldErrors: { startsAt: expect.any(String) },
    });

    expect(
      validateAppointment({ ...validInput, startsAt: "2026-08-01T08:00" }, now),
    ).toMatchObject({
      success: false,
      fieldErrors: { startsAt: expect.any(String) },
    });
  });

  it("rejects durations and cleanup margins outside one day", () => {
    expect(
      validateAppointment(
        { ...validInput, durationMinutes: "0", cleanupMinutes: "1441" },
        now,
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        durationMinutes: "Ingresá una duración de entre 1 y 1440 minutos.",
        cleanupMinutes: "Ingresá un margen de entre 0 y 1440 minutos.",
      },
    });
  });
});
