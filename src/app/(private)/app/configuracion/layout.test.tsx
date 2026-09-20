import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/configuracion/horarios",
}));

import ConfigurationLayout from "./layout";

describe("ConfigurationLayout", () => {
  it("keeps section navigation and content in one configuration column", () => {
    const markup = renderToStaticMarkup(
      <ConfigurationLayout>
        <p>Contenido de la sección</p>
      </ConfigurationLayout>,
    );

    expect(markup).not.toContain(
      "xl:grid-cols-[14rem_minmax(0,1fr)]",
    );
    expect(markup).toContain("los datos de tu consultorio");
    expect(markup).toContain("Contenido de la sección");
  });
});
