import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppointmentForm } from "./appointment-form";

describe("AppointmentForm", () => {
  it("presents the appointment as a guided flow with a review summary", () => {
    const markup = renderToStaticMarkup(
      <AppointmentForm
        appointmentOccupancy={[]}
        availability={[
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "11:00",
          },
        ]}
        created={false}
        currentTime="2026-08-10T12:20:00.000Z"
        defaultCleanupMinutes={10}
        defaultDurationMinutes={45}
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        onClose={vi.fn()}
        patients={[
          {
            id: "00000000-0000-4000-8000-000000000001",
            firstName: "Lucía",
            lastName: "Prueba",
          },
        ]}
      />,
    );

    expect(markup).toContain("Paso 1");
    expect(markup).toContain("Paso 2");
    expect(markup).toContain("Paso 3");
    expect(markup.indexOf("Definí la práctica y el tiempo")).toBeLessThan(
      markup.indexOf("Definí el horario"),
    );
    expect(markup).toContain("Revisá antes de confirmar");
    expect(markup).toContain("Podés ajustarla para este paciente");
    expect(markup).toContain('type="date"');
    expect(markup).toContain('min="2026-08-10"');
    expect(markup).toContain("Elegí una fecha para ver los horarios libres.");
    expect(markup).toContain('name="durationMinutes"');
    expect(markup).toContain('value="45"');
    expect(markup).toContain('name="cleanupMinutes"');
    expect(markup).toContain('value="10"');
  });
});
