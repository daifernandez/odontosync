import { describe, expect, it } from "vitest";

import type { Appointment } from "@/modules/appointments/domain/appointment";

import { buildDashboardData, getDashboardDayRange } from "./dashboard";

const now = new Date("2026-08-22T13:00:00.000Z");

function appointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: "appointment-id",
    patientId: "patient-id",
    patientFirstName: "Lucía",
    patientLastName: "Prueba",
    startsAt: "2026-08-22T14:30:00.000Z",
    occupiedUntil: "2026-08-22T15:10:00.000Z",
    durationMinutes: 30,
    cleanupMinutes: 10,
    specialty: "orthodontics",
    status: "confirmed",
    ...overrides,
  };
}

describe("dashboard domain", () => {
  it("builds the current Argentina calendar-day range", () => {
    expect(getDashboardDayRange(now)).toEqual({
      date: "2026-08-22",
      from: new Date("2026-08-22T03:00:00.000Z"),
      to: new Date("2026-08-23T03:00:00.000Z"),
    });
  });

  it("summarizes real appointments without inventing free rows", () => {
    const data = buildDashboardData({
      availableSlotsToday: 4,
      now,
      todayAppointments: [
        appointment(),
        appointment({ id: "pending-id", status: "pending_confirmation" }),
      ],
      upcomingAppointments: [appointment()],
    });

    expect(data).toEqual({
      availableSlotsToday: 4,
      confirmedToday: 1,
      todayAppointments: 2,
      upcomingAppointments: [
        {
          date: "2026-08-22",
          dateLabel: "Hoy",
          id: "appointment-id",
          patient: "Prueba, Lucía",
          specialty: "Ortodoncia",
          status: "Confirmado",
          time: "11:30",
        },
      ],
    });
  });
});
