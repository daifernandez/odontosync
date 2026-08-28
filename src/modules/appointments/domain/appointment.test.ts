import { describe, expect, it } from "vitest";

import {
  appointmentFormState,
  appointmentSpecialties,
  isPendingAppointmentAwaitingOutcome,
  isPendingAppointmentManageable,
  validateAppointment,
} from "./appointment";

const now = new Date("2026-08-01T12:00:00.000Z");
const validInput = {
  patientId: "ef3debb5-125b-4ca4-8847-848960465589",
  startsAt: "2026-08-03T09:30",
  durationMinutes: "30",
  cleanupMinutes: "5",
  specialty: "restorative",
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
        specialty: "restorative",
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

  it("offers the approved catalog and preserves general only for legacy appointments", () => {
    expect(appointmentSpecialties).toEqual([
      { value: "restorative", label: "Operatoria / restauradora" },
      { value: "pediatric_dentistry", label: "Odontopediatría" },
      { value: "orthodontics", label: "Ortodoncia" },
      { value: "surgery", label: "Cirugía" },
      { value: "implantology", label: "Implantología" },
      { value: "endodontics", label: "Endodoncia" },
      { value: "periodontics", label: "Periodoncia" },
      { value: "prosthodontics", label: "Prótesis / rehabilitación" },
      { value: "control", label: "Control" },
      { value: "aesthetic", label: "Estética" },
      { value: "whitening", label: "Blanqueamiento" },
    ]);

    for (const specialty of ["control", "aesthetic", "whitening"]) {
      expect(
        validateAppointment({ ...validInput, specialty }, now),
      ).toMatchObject({
        success: true,
        data: { specialty },
      });
    }

    expect(
      validateAppointment({ ...validInput, specialty: "general" }, now),
    ).toMatchObject({
      success: false,
      fieldErrors: { specialty: expect.any(String) },
    });
    expect(
      validateAppointment(
        { ...validInput, specialty: "general" },
        now,
        { allowLegacyGeneral: true },
      ),
    ).toMatchObject({
      success: true,
      data: { specialty: "general" },
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

describe("isPendingAppointmentManageable", () => {
  const appointment = {
    id: "00000000-0000-4000-8000-000000000010",
    patientId: "00000000-0000-4000-8000-000000000001",
    patientFirstName: "Lucía",
    patientLastName: "Prueba",
    startsAt: "2026-08-10T12:00:00.000Z",
    occupiedUntil: "2026-08-10T12:35:00.000Z",
    durationMinutes: 30,
    cleanupMinutes: 5,
    specialty: "general" as const,
    status: "pending_confirmation" as const,
  };

  it("allows management only before a pending appointment starts", () => {
    expect(
      isPendingAppointmentManageable(
        appointment,
        new Date("2026-08-10T11:59:59.000Z"),
      ),
    ).toBe(true);
    expect(
      isPendingAppointmentManageable(
        appointment,
        new Date("2026-08-10T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("rejects non-pending appointments regardless of their date", () => {
    expect(
      isPendingAppointmentManageable(
        { ...appointment, status: "confirmed" },
        new Date("2026-08-10T11:00:00.000Z"),
      ),
    ).toBe(false);
  });
});

describe("isPendingAppointmentAwaitingOutcome", () => {
  const appointment = {
    startsAt: "2026-08-10T12:00:00.000Z",
    occupiedUntil: "2026-08-10T12:35:00.000Z",
    status: "pending_confirmation" as const,
  };

  it("waits until the complete reserved time has finished", () => {
    expect(
      isPendingAppointmentAwaitingOutcome(
        appointment,
        new Date("2026-08-10T12:34:59.000Z"),
      ),
    ).toBe(false);
    expect(
      isPendingAppointmentAwaitingOutcome(
        appointment,
        new Date("2026-08-10T12:35:00.000Z"),
      ),
    ).toBe(true);
  });

  it("rejects appointments that already have another status", () => {
    expect(
      isPendingAppointmentAwaitingOutcome(
        { ...appointment, status: "confirmed" },
        new Date("2026-08-10T13:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
