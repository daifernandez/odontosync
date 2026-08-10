import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppointmentForm } from "./appointment-form";

describe("AppointmentForm", () => {
  it("presents the appointment as a guided flow with a review summary", () => {
    const markup = renderToStaticMarkup(
      <AppointmentForm
        created={false}
        defaultCleanupMinutes={10}
        defaultDurationMinutes={45}
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
    expect(markup).toContain("Revisá antes de confirmar");
    expect(markup).toContain('name="durationMinutes"');
    expect(markup).toContain('value="45"');
    expect(markup).toContain('name="cleanupMinutes"');
    expect(markup).toContain('value="10"');
  });
});
