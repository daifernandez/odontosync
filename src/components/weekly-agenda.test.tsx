import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { buildAgendaWeek } from "@/modules/agenda/domain/weekly-schedule";

import { WeeklyAgenda } from "./weekly-agenda";

describe("WeeklyAgenda", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T12:00:00-03:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders appointments across their complete occupied time and links the next free slot", () => {
    const appointment = {
      id: "00000000-0000-4000-8000-000000000010",
      patientId: "00000000-0000-4000-8000-000000000001",
      patientFirstName: "Lucía",
      patientLastName: "Prueba",
      startsAt: "2026-08-11T12:00:00.000Z",
      occupiedUntil: "2026-08-11T13:00:00.000Z",
      durationMinutes: 50,
      cleanupMinutes: 10,
      specialty: "implantology" as const,
      status: "pending_confirmation" as const,
    };
    const confirmedAppointment = {
      ...appointment,
      id: "00000000-0000-4000-8000-000000000011",
      startsAt: "2026-08-11T13:00:00.000Z",
      occupiedUntil: "2026-08-11T13:35:00.000Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
      status: "confirmed" as const,
    };
    const completedAppointment = {
      ...appointment,
      id: "00000000-0000-4000-8000-000000000012",
      startsAt: "2026-08-10T12:00:00.000Z",
      occupiedUntil: "2026-08-10T12:35:00.000Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
      status: "completed" as const,
    };
    const noShowAppointment = {
      ...completedAppointment,
      id: "00000000-0000-4000-8000-000000000013",
      startsAt: "2026-08-10T13:00:00.000Z",
      occupiedUntil: "2026-08-10T13:35:00.000Z",
      status: "no_show" as const,
    };
    const markup = renderToStaticMarkup(
      <WeeklyAgenda
        appointmentOccupancy={[appointment, confirmedAppointment]}
        appointments={[
          appointment,
          confirmedAppointment,
          completedAppointment,
          noShowAppointment,
        ]}
        autoOpenNewAppointment={false}
        cancelled={false}
        confirmed={false}
        configuration={{
          fullName: "Profesional de prueba",
          licenseNumber: null,
          licenseJurisdiction: null,
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
          availability: [
            { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
          ],
        }}
        created={false}
        exceptionalBlockCreated={false}
        exceptionalBlockDeleted={false}
        exceptionalBlockManagementError={false}
        exceptionalBlockPanelOpen={false}
        exceptionalBlocks={[]}
        managementError={false}
        patients={[
          {
            id: "00000000-0000-4000-8000-000000000001",
            firstName: "Lucía",
            lastName: "Prueba",
          },
        ]}
        week={buildAgendaWeek("2026-08-10")}
        updated={false}
      />,
    );

    expect(markup).toContain("Agenda semanal");
    expect(markup).not.toContain("style=");
    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("09:00–09:50");
    expect(markup).toContain("Acondicionamiento hasta 10:00");
    expect(markup).toContain("Pendiente de confirmación");
    expect(markup).toContain("Confirmado");
    expect(markup).toContain("Atendido");
    expect(markup).toContain("Ausente");
    expect(markup).toContain("Ver historial");
    expect(markup).toContain("Ver turno");
    expect(markup).not.toContain(
      "semana=2026-08-10&amp;nuevo=1&amp;fecha=2026-08-11&amp;hora=09:45",
    );
    expect(markup).not.toContain(
      "semana=2026-08-10&amp;nuevo=1&amp;fecha=2026-08-11&amp;hora=10:00",
    );
    expect(markup).toContain(
      "semana=2026-08-10&amp;nuevo=1&amp;fecha=2026-08-11&amp;hora=10:45",
    );
  });

  it("keeps a simultaneous appointment occupied when managing the selected one", () => {
    const selectedAppointment = {
      id: "00000000-0000-4000-8000-000000000010",
      patientId: "00000000-0000-4000-8000-000000000001",
      patientFirstName: "Lucía",
      patientLastName: "Prueba",
      startsAt: "2026-08-11T12:00:00.000Z",
      occupiedUntil: "2026-08-11T13:00:00.000Z",
      durationMinutes: 50,
      cleanupMinutes: 10,
      specialty: "implantology" as const,
      status: "confirmed" as const,
    };
    const simultaneousAppointment = {
      ...selectedAppointment,
      id: "00000000-0000-4000-8000-000000000011",
    };
    const markup = renderToStaticMarkup(
      <WeeklyAgenda
        appointmentOccupancy={[
          selectedAppointment,
          simultaneousAppointment,
        ]}
        appointments={[selectedAppointment, simultaneousAppointment]}
        autoOpenNewAppointment={false}
        cancelled={false}
        confirmed={false}
        configuration={{
          fullName: "Profesional de prueba",
          licenseNumber: null,
          licenseJurisdiction: null,
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
          availability: [
            { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
          ],
        }}
        created={false}
        exceptionalBlockCreated={false}
        exceptionalBlockDeleted={false}
        exceptionalBlockManagementError={false}
        exceptionalBlockPanelOpen={false}
        exceptionalBlocks={[]}
        managementError={false}
        patients={[]}
        selectedAppointment={selectedAppointment}
        updated={false}
        week={buildAgendaWeek("2026-08-10")}
      />,
    );

    expect(markup).toContain("Ocupado");
  });

  it("renders exceptional periods as unavailable and removes their links", () => {
    const markup = renderToStaticMarkup(
      <WeeklyAgenda
        appointmentOccupancy={[]}
        appointments={[]}
        autoOpenNewAppointment={false}
        cancelled={false}
        confirmed={false}
        configuration={{
          fullName: "Profesional de prueba",
          licenseNumber: null,
          licenseJurisdiction: null,
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
          availability: [
            { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
          ],
        }}
        created={false}
        exceptionalBlockCreated={false}
        exceptionalBlockDeleted={false}
        exceptionalBlockManagementError={false}
        exceptionalBlockPanelOpen={false}
        exceptionalBlocks={[
          {
            id: "00000000-0000-4000-8000-000000000020",
            startsAt: "2026-08-11T12:30:00.000Z",
            endsAt: "2026-08-11T13:30:00.000Z",
            category: "vacation",
          },
        ]}
        managementError={false}
        patients={[]}
        updated={false}
        week={buildAgendaWeek("2026-08-10")}
      />,
    );

    expect(markup).toContain("No disponible");
    expect(markup).toContain("Vacaciones");
    expect(markup).not.toContain(
      "semana=2026-08-10&amp;nuevo=1&amp;fecha=2026-08-11&amp;hora=09:00",
    );
    expect(markup).toContain(
      "semana=2026-08-10&amp;nuevo=1&amp;fecha=2026-08-11&amp;hora=10:30",
    );
  });

  it("renders only the selected day and preserves its URL context", () => {
    const selectedAppointment = {
      id: "00000000-0000-4000-8000-000000000010",
      patientId: "00000000-0000-4000-8000-000000000001",
      patientFirstName: "Lucía",
      patientLastName: "Martes",
      startsAt: "2026-08-11T12:00:00.000Z",
      occupiedUntil: "2026-08-11T12:35:00.000Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
      specialty: "general" as const,
      status: "pending_confirmation" as const,
    };
    const otherDayAppointment = {
      ...selectedAppointment,
      id: "00000000-0000-4000-8000-000000000011",
      patientLastName: "Miércoles",
      startsAt: "2026-08-12T12:00:00.000Z",
      occupiedUntil: "2026-08-12T12:35:00.000Z",
    };
    const markup = renderToStaticMarkup(
      <WeeklyAgenda
        appointmentOccupancy={[selectedAppointment, otherDayAppointment]}
        appointments={[selectedAppointment, otherDayAppointment]}
        autoOpenNewAppointment={false}
        cancelled={false}
        confirmed={false}
        configuration={{
          fullName: "Profesional de prueba",
          licenseNumber: null,
          licenseJurisdiction: null,
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
          availability: [
            { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
            { dayOfWeek: 3, startTime: "09:00", endTime: "12:00" },
          ],
        }}
        created={false}
        exceptionalBlockCreated={false}
        exceptionalBlockDeleted={false}
        exceptionalBlockManagementError={false}
        exceptionalBlockPanelOpen={false}
        exceptionalBlocks={[]}
        managementError={false}
        patients={[]}
        selectedDate="2026-08-11"
        updated={false}
        view="day"
        week={buildAgendaWeek("2026-08-11")}
      />,
    );

    expect(markup).toContain("Agenda diaria");
    expect(markup).toContain("Martes, Lucía");
    expect(markup).not.toContain("Miércoles, Lucía");
    expect(markup).toContain("Navegar días");
    expect(markup).toContain(
      "semana=2026-08-10&amp;vista=dia&amp;fecha=2026-08-10",
    );
    expect(markup).toContain(
      "semana=2026-08-10&amp;vista=dia&amp;fecha=2026-08-12",
    );
    expect(markup).toContain(
      "semana=2026-08-10&amp;vista=dia&amp;fecha=2026-08-11&amp;turno=00000000-0000-4000-8000-000000000010",
    );
    expect(markup).toContain(
      "semana=2026-08-10&amp;fecha=2026-08-11\">Vista semanal",
    );
  });
});
