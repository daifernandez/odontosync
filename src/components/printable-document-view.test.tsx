import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PrintableDocumentView } from "./printable-document-view";

describe("PrintableDocumentView", () => {
  it.each([
    "historia-clinica-odontologica",
    "identificacion-antecedentes",
    "examen-odontograma",
    "evolucion-documentacion",
  ] as const)("keeps screen controls outside %s", (printableId) => {
    const markup = renderToStaticMarkup(
      <PrintableDocumentView printableId={printableId} />,
    );

    expect(markup).toContain('href="/app/imprimibles"');
    expect(markup).toContain("Volver a imprimibles");
    expect(markup).toContain("Imprimir o guardar como PDF");
    expect(markup).toContain("printable-screen-only");
    expect(markup).toContain("printable-print-root");
    expect(markup).toContain("Plantilla académica vacía");
    expect(markup).toContain("validación profesional y jurídica");
  });

  it("shows screen-only double-sided printing guidance for the combined sheet", () => {
    const combinedMarkup = renderToStaticMarkup(
      <PrintableDocumentView printableId="examen-odontograma" />,
    );
    const completeMarkup = renderToStaticMarkup(
      <PrintableDocumentView printableId="historia-clinica-odontologica" />,
    );

    expect(combinedMarkup).toContain(
      "Imprimí doble faz, con giro por el borde largo.",
    );
    expect(combinedMarkup).toContain('data-double-sided-print-help="true"');
    expect(combinedMarkup).toMatch(
      /data-double-sided-print-help="true"[^>]*class="[^"]*printable-screen-only/,
    );
    expect(completeMarkup).not.toContain(
      "Imprimí doble faz, con giro por el borde largo.",
    );
  });
});
