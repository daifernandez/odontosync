import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LandingPage, { metadata } from "./page";

describe("LandingPage", () => {
  it("presents the current product without advertising retired printables", () => {
    const markup = renderToStaticMarkup(<LandingPage />);

    expect(markup).toContain("Agenda flexible");
    expect(markup).toContain("Pacientes organizados");
    expect(markup).toContain("Indicaciones ordenadas");
    expect(markup).not.toContain("Imprimibles útiles");
    expect(markup).not.toContain("odontogramas");
    expect(markup).not.toContain("materiales imprimibles");
    expect(metadata.description).not.toContain("imprimibles");
  });
});
