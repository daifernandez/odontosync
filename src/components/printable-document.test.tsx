import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PrintableDocument } from "./printable-document";

describe("PrintableDocument", () => {
  it("renders the approved four-page dental clinical history", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="historia-clinica-odontologica" />,
    );

    expect(markup.match(/data-printable-page=/g)).toHaveLength(4);
    expect(markup.match(/data-printable-watermark=/g)).toHaveLength(4);
    expect(markup.match(/data-printable-watermark-pattern="true" aria-hidden="true"/g)).toHaveLength(4);
    expect(markup.match(/data-printable-watermark-item=/g)).toHaveLength(72);
    expect(markup).toContain("Historia clínica odontológica general");
    expect(markup).toContain("Identificación y antecedentes");
    expect(markup).toContain("Examen y registro odontológico");
    expect(markup).toContain("Diagnóstico y pronóstico");
    expect(markup).toContain("Plan, evolución y documentación");
    expect(markup).toContain("Motivo de consulta");
    expect(markup).toContain("Antecedentes médicos");
    expect(markup).toContain("Examen extraoral");
    expect(markup).toContain("Examen intraoral");
    expect(markup).toContain("Odontograma FDI");
    expect(markup).toContain("Dentición permanente");
    expect(markup).toContain("Dentición temporaria");
    expect(markup).toContain("18");
    expect(markup).toContain("55");
    expect(markup).toContain("Evolución y actuaciones");
    expect(markup).toContain("Fecha");
    expect(markup).toContain("Hora");
    expect(markup).toContain("Firma / sello");
    expect(markup).toContain("Anexo de evolución N.º");
    expect(markup).not.toMatch(/Página [1234] de 4/);
    expect(markup.indexOf('data-printable-page="2"')).toBeLessThan(
      markup.indexOf('data-printable-page="3"'),
    );
    expect(markup.indexOf('data-printable-page="3"')).toBeLessThan(
      markup.indexOf('data-printable-page="4"'),
    );
    expect(markup.match(/Plantilla académica/g)).toHaveLength(4);
    expect(markup).not.toMatch(/<(input|textarea|select|button)\b/);
    expect(markup).not.toMatch(/contenteditable/i);
    expect(markup).not.toContain("Consentimiento informado");
    expect(markup).not.toContain("Planificación profesional");
    expect(markup).not.toContain("Cálculos administrativos");
  });

  it.each([
    ["identificacion-antecedentes", "Identificación y antecedentes", "1"],
    ["evolucion-documentacion", "Plan, evolución y documentación", "4"],
  ] as const)(
    "renders %s as exactly one reusable A4 sheet",
    (printableId, title, pageNumber) => {
      const markup = renderToStaticMarkup(
        <PrintableDocument printableId={printableId} />,
      );

      expect(markup.match(/data-printable-page=/g)).toHaveLength(1);
      expect(markup.match(/data-printable-watermark=/g)).toHaveLength(1);
      expect(markup).toContain(
        'data-printable-watermark-pattern="true" aria-hidden="true"',
      );
      expect(markup.match(/data-printable-watermark-item=/g)).toHaveLength(18);
      expect(markup).toContain(`data-printable-page="${pageNumber}"`);
      expect(markup).toContain(title);
      expect(markup).not.toMatch(/Página [1234] de 4/);
      expect(markup.match(/Plantilla académica/g)).toHaveLength(1);
      expect(markup).not.toMatch(/<(input|textarea|select|button)\b/);
      expect(markup).not.toMatch(/contenteditable/i);
      expect(markup.match(/>OdontoSync<\/span>/g)).toHaveLength(18);
    },
  );

  it("renders exam and diagnosis as a two-page front-and-back sheet", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="examen-odontograma" />,
    );

    expect(markup.match(/data-printable-page=/g)).toHaveLength(2);
    expect(markup.match(/data-printable-watermark=/g)).toHaveLength(2);
    expect(markup.match(/data-printable-watermark-item=/g)).toHaveLength(36);
    expect(markup.indexOf('data-printable-page="2"')).toBeLessThan(
      markup.indexOf('data-printable-page="3"'),
    );
    expect(markup).toContain("Examen y registro odontológico");
    expect(markup).toContain("Diagnóstico y pronóstico");
  });

  it("keeps the only exam date in the header without a page indicator or details block", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="examen-odontograma" />,
    );
    const examPage = markup.match(/<article[^>]*data-printable-page="2"[\s\S]*?<\/article>/)?.[0] ?? "";
    const header = examPage.match(/<header[\s\S]*?<\/header>/)?.[0];

    expect(header).toBeDefined();
    expect(header).toMatch(/data-printable-header-date="true"[\s\S]*>Fecha<\/span>/);
    expect(header).not.toMatch(/Página [1234] de 4/);
    expect(header).not.toContain(">Hora</span>");
    expect(examPage).not.toContain("Datos del examen");
    expect(examPage).not.toContain('data-exam-details="true"');
    expect(header).toMatch(
      /data-printable-identification="true"[^>]*class="[^"]*mt-\[calc\(1\.1em\+0\.5cm\)\]/,
    );
    expect(examPage.match(/>Fecha<\/span>/g)).toHaveLength(1);
    expect(examPage).not.toContain(">Hora</span>");
    expect(examPage.match(/>Firma \/ sello profesional<\/span>/g)).toHaveLength(1);
    const examSignature = examPage.match(
      /<div[^>]*data-professional-signature-area="true"[\s\S]*?<\/div>/,
    )?.[0] ?? "";
    expect(examSignature).toContain("h-[4cm]");
    expect(examSignature).toContain("w-[9cm]");
    expect(examSignature).toContain("border-b");
    expect(examSignature).not.toContain("border-l");
    expect(examSignature).not.toContain("border-r");
    expect(examSignature).not.toContain("border-t");
  });

  it("renders diagnosis and prognosis as a simple one-page manual sheet", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="examen-odontograma" />,
    );
    const diagnosisPage = markup.match(/<article[^>]*data-printable-page="3"[\s\S]*?<\/article>/)?.[0] ?? "";
    const diagnosisStart = diagnosisPage.indexOf(">Diagnóstico</h3>");
    const prognosisStart = diagnosisPage.indexOf(">Pronóstico</h3>");
    const signatureStart = diagnosisPage.indexOf(">Firma / sello profesional</span>");
    const diagnosisArea = diagnosisPage.slice(diagnosisStart, prognosisStart);
    const prognosisArea = diagnosisPage.slice(prognosisStart, signatureStart);

    expect(diagnosisPage).toContain('data-printable-page="3"');
    expect(diagnosisPage).toContain('data-printable-header-date="true"');
    expect(diagnosisPage).toMatch(
      /data-printable-identification="true"[^>]*class="[^"]*mt-\[calc\(1\.1em\+0\.5cm\)\]/,
    );
    expect(diagnosisPage.match(/>Fecha<\/span>/g)).toHaveLength(1);
    expect(diagnosisPage).toMatch(/<h3[^>]*>Diagnóstico<\/h3>/);
    expect(diagnosisPage).toMatch(/<h3[^>]*>Pronóstico<\/h3>/);
    expect(diagnosisPage).toContain("grid-rows-[2fr_1fr]");
    expect(diagnosisArea.match(/h-\[1\.45em\]/g)).toHaveLength(10);
    expect(prognosisArea.match(/h-\[1\.45em\]/g)).toHaveLength(5);
    expect(diagnosisArea).toContain('data-distributed-lines="true"');
    expect(prognosisArea).toContain('data-distributed-lines="true"');
    expect(diagnosisArea).toContain("flex flex-1 flex-col justify-between");
    expect(prognosisArea).toContain("flex flex-1 flex-col justify-between");
    expect(diagnosisPage.match(/>Firma \/ sello profesional<\/span>/g)).toHaveLength(1);
    const diagnosisSignature = diagnosisPage.match(
      /<div[^>]*data-professional-signature-area="true"[\s\S]*?<\/div>/,
    )?.[0] ?? "";
    expect(diagnosisSignature).toContain("h-[4cm]");
    expect(diagnosisSignature).toContain("w-[9cm]");
    expect(diagnosisSignature).toContain("border-b");
    expect(diagnosisSignature).not.toContain("border-l");
    expect(diagnosisSignature).not.toContain("border-r");
    expect(diagnosisSignature).not.toContain("border-t");
    expect(diagnosisPage.match(/data-printable-watermark-item=/g)).toHaveLength(18);
    expect(diagnosisPage).not.toContain("Estudios complementarios e interconsultas");
    expect(diagnosisPage).not.toContain("Diagnóstico diferencial");
    expect(diagnosisPage).not.toContain("Factores");
    expect(diagnosisPage).not.toContain('role="table"');
  });

  it("uses an open composition for exam and writing areas while keeping only the odontogram boxed", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="examen-odontograma" />,
    );

    expect(markup.match(/data-clinical-section-layout="open"/g)).toHaveLength(6);
    expect(markup).toMatch(
      /data-clinical-section-title="Examen extraoral"[^>]*data-clinical-section-layout="open"[^>]*class="[^"]*border-b[^"]*px-\[0\.2em\][^"]*pb-\[1em\]/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Examen intraoral"[^>]*data-clinical-section-layout="open"/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Referencias y observaciones"[^>]*data-clinical-section-layout="open"/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Estudios complementarios e interconsultas"[^>]*data-clinical-section-layout="open"/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Diagnóstico"[^>]*data-clinical-section-layout="open"/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Pronóstico"[^>]*data-clinical-section-layout="open"/,
    );
    expect(markup).toMatch(
      /data-clinical-section-title="Odontograma FDI"[^>]*data-clinical-section-layout="boxed"[^>]*class="[^"]*rounded-\[0\.8em\][^"]*border[^"]*p-\[1\.1em\]/,
    );
  });

  it("keeps studies on the front and diagnosis on the reverse", () => {
    const markup = renderToStaticMarkup(
      <PrintableDocument printableId="examen-odontograma" />,
    );
    const examPage = markup.match(/<article[^>]*data-printable-page="2"[\s\S]*?<\/article>/)?.[0] ?? "";
    const diagnosisPage = markup.match(/<article[^>]*data-printable-page="3"[\s\S]*?<\/article>/)?.[0] ?? "";

    expect(examPage).not.toContain("Diagnóstico y pronóstico");
    expect(examPage).toContain("Estudios complementarios e interconsultas");
    expect(diagnosisPage).toContain("Diagnóstico y pronóstico");
    expect(diagnosisPage).not.toContain("Estudios complementarios e interconsultas");
  });
});
