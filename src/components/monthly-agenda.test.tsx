import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { buildAgendaMonth } from "@/modules/agenda/domain/weekly-schedule";

import { MonthlyAgenda } from "./monthly-agenda";

const appointments = [
  {
    id: "appointment-1",
    patientId: "patient-id",
    patientFirstName: "Lucía",
    patientLastName: "Prueba",
    startsAt: "2026-08-11T12:00:00.000Z",
    occupiedUntil: "2026-08-11T12:35:00.000Z",
    durationMinutes: 30,
    cleanupMinutes: 5,
    specialty: "general" as const,
    status: "confirmed" as const,
  },
  {
    id: "appointment-2",
    patientId: "patient-id",
    patientFirstName: "Lucía",
    patientLastName: "Prueba",
    startsAt: "2026-08-11T15:00:00.000Z",
    occupiedUntil: "2026-08-11T15:35:00.000Z",
    durationMinutes: 30,
    cleanupMinutes: 5,
    specialty: "orthodontics" as const,
    status: "pending_confirmation" as const,
  },
];

const exceptionalBlocks = [
  {
    id: "block-1",
    startsAt: "2026-08-14T20:00:00.000Z",
    endsAt: "2026-08-16T15:00:00.000Z",
    category: "vacation" as const,
  },
];

describe("MonthlyAgenda", () => {
  it("summarizes the month and offers daily actions for the selected date", () => {
    const markup = renderToStaticMarkup(
      <MonthlyAgenda
        appointments={appointments}
        exceptionalBlocks={exceptionalBlocks}
        month={buildAgendaMonth("2026-08-22")}
        currentTime={new Date("2026-08-22T15:00:00.000Z")}
      />,
    );

    expect(markup).toContain("Agenda mensual");
    expect(markup).toContain("agosto de 2026");
    expect(markup).toContain("2 turnos");
    expect(markup).toContain("1 bloqueo");
    expect(markup).toContain(
      "martes, 11 de agosto de 2026. 2 turnos. 0 bloqueos. Seleccionar día.",
    );
    expect(markup).toContain("Día para gestionar");
    expect(markup).toContain("sábado, 22 de agosto de 2026");
    expect(markup).toContain(
      "/app/agenda?semana=2026-08-17&amp;vista=dia&amp;fecha=2026-08-22&amp;nuevo=1#nuevo-turno",
    );
    expect(markup).toContain(
      "/app/agenda?semana=2026-08-17&amp;vista=dia&amp;fecha=2026-08-22&amp;bloqueos=1",
    );
    expect(markup).toContain("Nuevo turno");
    expect(markup).toContain("Bloquear horario");
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("Vista semanal");
    expect(markup).toContain("Vista diaria");
    expect(markup).toContain("Vista mensual");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Mes anterior");
    expect(markup).toContain("Mes siguiente");
  });

  it("explains when the selected month has no appointments or blocks", () => {
    const markup = renderToStaticMarkup(
      <MonthlyAgenda
        appointments={[]}
        exceptionalBlocks={[]}
        month={buildAgendaMonth("2026-10-01")}
        currentTime={new Date("2026-08-22T15:00:00.000Z")}
      />,
    );

    expect(markup).toContain("No hay turnos ni bloqueos en este mes");
  });

  it("limits past dates to consultation and pending outcomes", () => {
    const markup = renderToStaticMarkup(
      <MonthlyAgenda
        appointments={[]}
        exceptionalBlocks={[]}
        month={buildAgendaMonth("2026-07-01")}
        currentTime={new Date("2026-08-22T15:00:00.000Z")}
      />,
    );

    expect(markup).toContain(
      "Nota: en los días pasados podés consultar turnos y registrar resultados pendientes.",
    );
    expect(markup).not.toContain("Nuevo turno");
    expect(markup).not.toContain("Bloquear horario");
    expect(markup).toContain(
      "/app/agenda?semana=2026-06-29&amp;vista=dia&amp;fecha=2026-07-01",
    );
  });
});
