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
      now,
      todayAppointments: [
        appointment({
          id: "past-id",
          startsAt: "2026-08-22T12:00:00.000Z",
        }),
        appointment(),
        appointment({
          id: "fourth-active-id",
          startsAt: "2026-08-22T17:30:00.000Z",
        }),
        appointment({
          id: "pending-id",
          startsAt: "2026-08-22T15:30:00.000Z",
          status: "pending_confirmation",
        }),
        appointment({
          id: "completed-id",
          startsAt: "2026-08-22T16:00:00.000Z",
          status: "completed",
        }),
        appointment({
          id: "third-active-id",
          startsAt: "2026-08-22T16:30:00.000Z",
        }),
      ],
    });

    expect(data).toEqual({
      confirmedToday: 4,
      date: "2026-08-22",
      pendingConfirmationsToday: 1,
      todayAppointments: 6,
      upcomingAppointments: [
        {
          date: "2026-08-22",
          dateLabel: "Sáb, 22 ago",
          durationMinutes: 30,
          id: "appointment-id",
          patient: "Prueba, Lucía",
          specialty: "Ortodoncia",
          status: "Confirmado",
          time: "11:30",
        },
        {
          date: "2026-08-22",
          dateLabel: "Sáb, 22 ago",
          durationMinutes: 30,
          id: "pending-id",
          patient: "Prueba, Lucía",
          specialty: "Ortodoncia",
          status: "Pendiente de confirmación",
          time: "12:30",
        },
        {
          date: "2026-08-22",
          dateLabel: "Sáb, 22 ago",
          durationMinutes: 30,
          id: "third-active-id",
          patient: "Prueba, Lucía",
          specialty: "Ortodoncia",
          status: "Confirmado",
          time: "13:30",
        },
      ],
    });
  });
});
