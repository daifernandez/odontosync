import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardHome } from "./dashboard-home";

describe("DashboardHome", () => {
  const authenticatedData = {
    todayAppointments: 1,
    confirmedToday: 1,
    availableSlotsToday: 3,
    date: "2026-08-22",
    upcomingAppointments: [
      {
        id: "appointment-id",
        date: "2026-08-22",
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

  it("renders the authenticated summary from real data", () => {
    const markup = renderToStaticMarkup(
      <DashboardHome data={authenticatedData} />,
    );

    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("14:30");
    expect(markup).toContain("Ortodoncia · 30 min");
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
    expect(markup).toContain("Ver agenda de hoy");
    expect(markup).toContain("Crear turno");
    expect(markup).not.toContain("Paciente de ejemplo");
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

  it("disables modules that are not part of the demo yet", () => {
    const markup = renderToStaticMarkup(<DashboardHome demoMode />);

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain("Próximamente");
  });
});
