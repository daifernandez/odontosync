import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { isPrintableId } from "@/modules/printables/domain/printable";

import { PrintableLibrary } from "./printable-library";

describe("PrintableLibrary", () => {
  it("offers the complete history and each reusable sheet", () => {
    const markup = renderToStaticMarkup(<PrintableLibrary />);

    expect(markup).toContain("Historia clínica odontológica general");
    expect(markup).toContain("Cuatro páginas A4 para completar a mano");
    expect(markup).toContain("Identificación y antecedentes");
    expect(markup).toContain("Examen y registro odontológico");
    expect(markup).toContain(
      "Dos páginas A4 para impresión doble faz: examen y odontograma al frente; diagnóstico y pronóstico al reverso.",
    );
    expect(markup).toContain("Evolución y documentación");
    expect(markup).toContain(
      'href="/app/imprimibles/historia-clinica-odontologica"',
    );
    expect(markup).toContain(
      'href="/app/imprimibles/identificacion-antecedentes"',
    );
    expect(markup).toContain(
      'href="/app/imprimibles/examen-odontograma"',
    );
    expect(markup).not.toContain(
      'href="/app/imprimibles/diagnostico-pronostico"',
    );
    expect(isPrintableId("diagnostico-pronostico")).toBe(false);
    expect(markup).toContain(
      'href="/app/imprimibles/evolucion-documentacion"',
    );
    expect(markup.match(/href="\/app\/imprimibles\//g)).toHaveLength(4);
    expect(markup.indexOf("Examen y registro odontológico")).toBeLessThan(
      markup.indexOf("Evolución y documentación"),
    );
    expect(markup).not.toContain("Planificación profesional");
    expect(markup).not.toContain("Cálculos administrativos");
  });
});
