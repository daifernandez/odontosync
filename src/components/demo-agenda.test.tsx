import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DemoAgenda } from "./demo-agenda";
import { DemoStateProvider } from "./demo-state";

function renderAgenda(initialOpen = false) {
  return renderToStaticMarkup(
    <DemoStateProvider>
      <DemoAgenda initialOpen={initialOpen} />
    </DemoStateProvider>,
  );
}

describe("DemoAgenda", () => {
  it("renders only fictitious appointments and explains the reset behavior", () => {
    const markup = renderAgenda();

    expect(markup).toContain("Paciente de ejemplo");
    expect(markup).toContain("Paciente de muestra");
    expect(markup).toContain("Los cambios se descartan");
    expect(markup).not.toContain("Nuevo turno ficticio");
  });

  it("opens the simulated appointment form from the URL state", () => {
    const markup = renderAgenda(true);

    expect(markup).toContain("Nuevo turno ficticio");
    expect(markup).toContain('name="patient"');
    expect(markup).toContain('name="specialty"');
    expect(markup).toContain('name="time"');
  });
});
