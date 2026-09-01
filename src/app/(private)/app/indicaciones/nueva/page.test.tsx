import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/instruction-template-form", () => ({
  InstructionTemplateForm: () => <div>Formulario</div>,
}));
vi.mock("@/modules/initial-configuration/repository", () => ({
  getProfile: vi.fn().mockResolvedValue(null),
}));

import NewInstructionPage from "./page";

describe("NewInstructionPage", () => {
  it("uses one clear page heading and operational supporting copy", async () => {
    const page = await NewInstructionPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toMatch(/<h1[^>]*>Nueva plantilla<\/h1>/);
    expect(markup).toContain(
      "Completá el contenido y revisá cómo quedará impreso.",
    );
    expect(markup).not.toContain("Escribí una vez");
    expect(markup).not.toMatch(/>Indicaciones</);
  });
});
