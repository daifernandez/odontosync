import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DemoPatients } from "./demo-patients";
import { DemoStateProvider } from "./demo-state";

function renderPatients() {
  return renderToStaticMarkup(
    <DemoStateProvider>
      <DemoPatients />
    </DemoStateProvider>,
  );
}

describe("DemoPatients", () => {
  it("renders fictitious active patients and search controls", () => {
    const markup = renderPatients();

    expect(markup).toContain("Paciente de ejemplo");
    expect(markup).toContain("Paciente de muestra");
    expect(markup).not.toContain("Paciente inactivo de prueba");
    expect(markup).toContain("Buscar paciente ficticio");
    expect(markup).toContain('aria-pressed="true"');
  });

  it("makes the no-persistence boundary explicit", () => {
    const markup = renderPatients();

    expect(markup).toContain("Nada de lo que agregues se envía ni se guarda");
    expect(markup).toContain("se descarta al recargar");
  });
});
