import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardHome } from "./dashboard-home";

describe("DashboardHome", () => {
  const authenticatedData = {
    todayAppointments: 1,
    confirmedToday: 1,
    pendingConfirmationsToday: 2,
    date: "2026-08-22",
    upcomingAppointments: [
      {
        id: "appointment-id",
        date: "2026-08-22",
        dateLabel: "Sáb, 22 ago",
        durationMinutes: 30,
        time: "14:30",
        patient: "Prueba, Lucía",
        specialty: "Ortodoncia",
        status: "Confirmado" as const,
      },
    ],
  };

  it("links the authenticated new appointment action to the agenda form", () => {
    const markup = renderToStaticMarkup(<DashboardHome />);

    expect(markup).toContain(
      'href="/app/agenda?nuevo=1#nuevo-turno"',
    );
    expect(markup).toContain("Nuevo turno");
  });

  it("links the authenticated agenda actions to the agenda", () => {
    const markup = renderToStaticMarkup(
      <DashboardHome data={authenticatedData} />,
    );

    expect(markup).toContain("Ver agenda de hoy");
    expect(markup).toContain(
      'href="/app/agenda?semana=2026-08-17&amp;vista=dia&amp;fecha=2026-08-22"',
    );
    expect(markup).toContain(
      'href="/app/agenda?semana=2026-08-17&amp;vista=dia&amp;fecha=2026-08-22&amp;turno=appointment-id"',
    );
  });

  it("opens the next appointment from its summary card only when it exists", () => {
    const populatedMarkup = renderToStaticMarkup(
      <DashboardHome data={authenticatedData} />,
    );
    const populatedSummary = populatedMarkup.match(
      /<section class="mt-5[\s\S]*?<\/section>/,
    )?.[0];
    const emptyMarkup = renderToStaticMarkup(
      <DashboardHome
        data={{ ...authenticatedData, upcomingAppointments: [] }}
      />,
    );
    const emptySummary = emptyMarkup.match(
      /<section class="mt-5[\s\S]*?<\/section>/,
    )?.[0];

    expect(populatedSummary).toContain(
      'aria-label="Abrir próximo turno: 14:30, Prueba, Lucía"',
    );
    expect(populatedSummary).toContain(
      'href="/app/agenda?semana=2026-08-17&amp;vista=dia&amp;fecha=2026-08-22&amp;turno=appointment-id"',
    );
    expect(populatedSummary).toContain("hover:bg-[var(--color-brand-subtle)]");
    expect(populatedSummary).toContain("focus-visible:outline-2");
    expect(emptySummary).not.toContain("Abrir próximo turno");
    expect(emptySummary).not.toContain("<a ");
  });

  it("renders the authenticated summary from real data", () => {
    const markup = renderToStaticMarkup(
      <DashboardHome data={authenticatedData} />,
    );

    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("14:30");
    expect(markup).toContain("Sáb, 22 ago · Ortodoncia");
    expect(markup).toContain("Ortodoncia · 30 min");
    expect(markup).toContain("Confirmaciones pendientes");
    expect(markup).not.toContain("Espacios libres");
    expect(markup).toMatch(
      /Confirmaciones pendientes<\/p><strong[^>]*>2<\/strong>/,
    );
    expect(markup).toContain("bg-emerald-600");
    expect(markup).toContain(
      'aria-label="14:30, Prueba, Lucía, Confirmado. Abrir turno en la agenda"',
    );
    expect(markup).toContain("3");
    expect(markup).not.toContain("Paciente de ejemplo");
    expect(markup).not.toContain("datos de demostración");
  });

  it("explains when the authenticated account has no upcoming appointments", () => {
    const markup = renderToStaticMarkup(
      <DashboardHome
        data={{ ...authenticatedData, upcomingAppointments: [] }}
      />,
    );

    expect(markup).toContain("No quedan turnos para hoy");
    expect(markup).toContain("Sin turnos hoy");
    expect(markup).not.toContain("Agenda libre");
    expect(markup).toContain("Ver agenda de hoy");
    expect(markup).toContain("Crear turno");
    expect(markup).not.toContain("Paciente de ejemplo");
  });

  it("keeps the summary stacked before desktop and shows its text without truncation", () => {
    const markup = renderToStaticMarkup(
      <DashboardHome data={authenticatedData} />,
    );
    const summaryMarkup = markup.match(
      /<section class="mt-5[\s\S]*?<\/section>/,
    )?.[0];
    const nextAppointmentMarkup = summaryMarkup?.match(
      /<a aria-label="Abrir próximo turno:[\s\S]*?<\/a>/,
    )?.[0];

    expect(summaryMarkup).toBeDefined();
    expect(nextAppointmentMarkup).toBeDefined();
    expect(summaryMarkup).toContain("grid-cols-1");
    expect(summaryMarkup).toContain(
      "xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)]",
    );
    expect(summaryMarkup).toContain("whitespace-nowrap");
    expect(summaryMarkup).toContain(
      "grid-cols-[auto_auto_minmax(0,1fr)]",
    );
    expect(summaryMarkup).toContain(
      "grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-3.5",
    );
    expect(nextAppointmentMarkup).toContain(
      "row-span-2 grid size-11 self-center",
    );
    expect(nextAppointmentMarkup).toContain("row-start-1 m-0 text-[0.72rem]");
    expect(nextAppointmentMarkup).toContain("row-start-2 text-xl");
    expect(nextAppointmentMarkup).toContain(
      "col-start-3 row-start-2 flex min-w-0 flex-col items-start gap-0.5 text-left",
    );
    expect(nextAppointmentMarkup).toContain("relative pr-8");
    expect(nextAppointmentMarkup).toContain("top-1/2 right-2.5");
    expect(nextAppointmentMarkup).not.toContain("self-end");
    expect(nextAppointmentMarkup).not.toContain("self-start");
    expect(summaryMarkup).not.toContain("size-10");
    expect(summaryMarkup).not.toContain("min-[520px]:size-11");
    expect(summaryMarkup).not.toContain("text-[0.68rem]");
    expect(summaryMarkup).not.toContain("text-lg");
    expect(summaryMarkup).not.toContain("min-[520px]:row-start");
    expect(summaryMarkup).not.toContain("text-ellipsis");
    expect(summaryMarkup).not.toContain("overflow-hidden");
  });

  it("keeps demo agenda actions inside the public demo", () => {
    const markup = renderToStaticMarkup(<DashboardHome demoMode />);

    expect(markup).not.toContain('href="/app');
    expect(markup).toContain('href="/demo/agenda"');
    expect(markup).toContain("2 confirmados");
    expect(markup).toContain(
      'href="/demo/agenda?nuevo=1#nuevo-turno"',
    );
  });

  it("describes the complete clinical history as four pages", () => {
    const markup = renderToStaticMarkup(<DashboardHome />);

    expect(markup).toContain("Cuatro páginas para completar a mano");
    expect(markup).not.toContain("Tres páginas para completar a mano");
  });

  it("disables modules that are not part of the demo yet", () => {
    const markup = renderToStaticMarkup(<DashboardHome demoMode />);

    expect(markup).not.toContain('href="/demo/imprimibles"');
    expect(markup).toContain('title="Historia clínica odontológica: próximamente"');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain("Próximamente");
  });
});
