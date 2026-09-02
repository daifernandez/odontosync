import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/instructions/actions", () => ({
  createInstructionTemplateAction: vi.fn(),
  updateInstructionTemplateAction: vi.fn(),
}));

import { InstructionTemplateForm } from "./instruction-template-form";

describe("InstructionTemplateForm", () => {
  it("offers long editable points, list styles, and a matching live preview", () => {
    const markup = renderToStaticMarkup(
      <InstructionTemplateForm
        profile={{
          fullName: "Dra. Ana Pérez",
          licenseNumber: "12345",
          licenseJurisdiction: "CABA",
          clinicName: null,
          officeAddress: null,
          contactPhone: null,
          contactEmail: null,
          additionalInformation: null,
        }}
      />,
    );

    expect(markup).toContain('name="title"');
    expect(markup.indexOf('name="specialty"')).toBeLessThan(
      markup.indexOf('name="title"'),
    );
    expect(markup).toContain('name="introduction"');
    expect(markup).toContain('name="points"');
    expect(markup).not.toContain("Crear indicación");
    expect(markup).toContain("Agregar otra indicación");
    expect(markup).toContain("Números");
    expect(markup).toContain("Checks");
    expect(markup).toContain("OdontoSync");
    expect(markup).toContain('aria-label="Ejemplo del estilo seleccionado"');
    expect(markup).toContain("Así se verá en la hoja");
    expect(markup).toContain("Cepillá suavemente la zona tratada.");
    expect(markup).toContain("sm:grid-cols-3");
    expect(markup).toContain(
      "lg:grid-cols-[repeat(4,minmax(0,1fr))_1.25fr]",
    );
    expect(markup).toContain(
      'aria-label="Alternar entre edición y vista previa"',
    );
    expect(markup).toContain("Editar");
    expect(markup).not.toContain("Ampliar vista previa");
    expect(markup).not.toContain("Reducir vista previa");
    expect(markup).toContain("Vista previa en vivo");
    expect(markup).toContain("Guardar y ver imprimible");
  });
});
