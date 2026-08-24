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
        exceptionalBlocks={[]}
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

  it("prefills a date and time selected from the weekly calendar", () => {
    const markup = renderToStaticMarkup(
      <AppointmentForm
        appointmentOccupancy={[]}
        availability={[
          {
            dayOfWeek: 2,
            startTime: "09:00",
            endTime: "11:00",
          },
        ]}
        created={false}
        currentTime="2026-08-10T12:20:00.000Z"
        defaultCleanupMinutes={5}
        defaultDurationMinutes={30}
        exceptionalBlocks={[]}
        gridIntervalMinutes={15}
        initialDate="2026-08-11"
        initialTime="09:30"
        minimumDate="2026-08-10"
        onClose={vi.fn()}
        patients={[
          {
            id: "00000000-0000-4000-8000-000000000001",
            firstName: "Lucía",
            lastName: "Prueba",
          },
        ]}
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain('type="date" value="2026-08-11"');
    expect(markup).toMatch(
      /<input[^>]*name="startsAt"[^>]*checked=""[^>]*value="2026-08-11T09:30"/,
    );
    expect(markup).toContain('name="weekStartDate" value="2026-08-10"');
    expect(markup).toContain("11/08/2026 a las 09:30");
  });

  it("prefills the patient when opened from a patient record", () => {
    const markup = renderToStaticMarkup(
      <AppointmentForm
        appointmentOccupancy={[]}
        availability={[]}
        created={false}
        currentTime="2026-08-10T12:20:00.000Z"
        defaultCleanupMinutes={5}
        defaultDurationMinutes={30}
        exceptionalBlocks={[]}
        gridIntervalMinutes={15}
        initialPatientId="00000000-0000-4000-8000-000000000001"
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

    expect(markup).toMatch(
      /<select[^>]*name="patientId"[^>]*>[\s\S]*<option[^>]*value="00000000-0000-4000-8000-000000000001"[^>]*selected=""/,
    );
  });

  it("does not offer times that intersect an exceptional block", () => {
    const markup = renderToStaticMarkup(
      <AppointmentForm
        appointmentOccupancy={[]}
        availability={[
          { dayOfWeek: 2, startTime: "09:00", endTime: "11:00" },
        ]}
        created={false}
        currentTime="2026-08-10T12:20:00.000Z"
        defaultCleanupMinutes={5}
        defaultDurationMinutes={30}
        exceptionalBlocks={[
          {
            startsAt: "2026-08-11T12:30:00.000Z",
            endsAt: "2026-08-11T13:00:00.000Z",
          },
        ]}
        gridIntervalMinutes={15}
        initialDate="2026-08-11"
        minimumDate="2026-08-10"
        onClose={vi.fn()}
        patients={[]}
      />,
    );

    expect(markup).not.toContain('value="2026-08-11T09:00"');
    expect(markup).not.toContain('value="2026-08-11T09:30"');
    expect(markup).toContain('value="2026-08-11T10:00"');
  });
});
