import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Appointment } from "@/modules/appointments/domain/appointment";

import {
  AppointmentTimeline,
  filterTimelineAppointments,
  formatTimelineTime,
} from "./appointment-timeline";

const baseAppointment: Appointment = {
  id: "00000000-0000-4000-8000-000000000010",
  patientId: "00000000-0000-4000-8000-000000000001",
  patientFirstName: "Lucía",
  patientLastName: "Prueba",
  startsAt: "2026-08-10T12:00:00.000Z",
  occupiedUntil: "2026-08-10T12:35:00.000Z",
  durationMinutes: 30,
  cleanupMinutes: 5,
  specialty: "general",
  status: "pending_confirmation",
};

const appointments: Appointment[] = [
  baseAppointment,
  {
    ...baseAppointment,
    id: "00000000-0000-4000-8000-000000000011",
    status: "confirmed",
  },
  {
    ...baseAppointment,
    id: "00000000-0000-4000-8000-000000000012",
    status: "completed",
  },
  {
    ...baseAppointment,
    id: "00000000-0000-4000-8000-000000000013",
    status: "no_show",
  },
  {
    ...baseAppointment,
    id: "00000000-0000-4000-8000-000000000014",
    status: "cancelled",
  },
  {
    ...baseAppointment,
    id: "00000000-0000-4000-8000-000000000015",
    startsAt: "2026-08-11T12:00:00.000Z",
    occupiedUntil: "2026-08-11T12:35:00.000Z",
    status: "rescheduled",
  },
];

describe("AppointmentTimeline", () => {
  it("normalizes localized time spacing for identical server and client text", () => {
    const formatted = formatTimelineTime(
      new Date("2026-08-10T12:00:00.000Z"),
    );

    expect(formatted).toBe("09:00 a. m.");
    expect(formatted).not.toMatch(/[\u00a0\u202f]/);
  });

  it("groups each operational status into its filter", () => {
    expect(
      filterTimelineAppointments(appointments, {
        date: "all",
        status: "ongoing",
      }),
    ).toHaveLength(2);
    expect(
      filterTimelineAppointments(appointments, {
        date: "all",
        status: "finished",
      }),
    ).toHaveLength(2);
    expect(
      filterTimelineAppointments(appointments, {
        date: "all",
        status: "changes",
      }),
    ).toHaveLength(2);
  });

  it("combines the selected day and status without pagination", () => {
    expect(
      filterTimelineAppointments(appointments, {
        date: "2026-08-11",
        status: "changes",
      }).map(({ status }) => status),
    ).toEqual(["rescheduled"]);
  });

  it("renders accessible status and day filters with textual states", () => {
    const markup = renderToStaticMarkup(
      <AppointmentTimeline
        appointments={appointments}
        currentTime="2026-08-10T15:00:00.000Z"
        days={[
          { date: "2026-08-10", label: "Lunes" },
          { date: "2026-08-11", label: "Martes" },
        ]}
        selectedDate="2026-08-10"
        view="week"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain('aria-label="Filtrar turnos por estado"');
    expect(markup).toContain('aria-label="Filtrar turnos por día"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-live="polite" class="sr-only"');
    expect(markup).not.toContain("Todos ·");
    expect(markup).not.toContain("En curso ·");
    expect(markup).not.toContain("Toda la semana ·");
    expect(markup).not.toContain("Lunes ·");
    expect(markup).toContain("Cancelado");
    expect(markup).toContain("Reprogramado");
    expect(markup).toContain("Ver cambio");
    expect(markup).toContain("<details");
    expect(markup).toContain("open=\"\"");
    expect(markup).toContain(
      "@4xl/daily-agenda:grid-cols-[5.25rem_minmax(0,1fr)_auto]",
    );
    expect(markup).not.toContain(
      "xl:grid-cols-[5.25rem_minmax(0,1fr)_auto]",
    );
    expect(markup).not.toContain("Paginación");
  });
});
