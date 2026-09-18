import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/configuracion/documentos",
}));

import { ConfigurationNavigation } from "./configuration-navigation";

describe("ConfigurationNavigation", () => {
  it("links every settings section and marks the current page", () => {
    const markup = renderToStaticMarkup(<ConfigurationNavigation />);

    expect(markup).toContain("<summary");
    expect(markup).toContain("Sección");
    expect(markup).toContain('href="/app/configuracion/perfil"');
    expect(markup).toContain('href="/app/configuracion/documentos"');
    expect(markup).toContain('href="/app/configuracion/agenda"');
    expect(markup).toContain('href="/app/configuracion/horarios"');
    expect(markup).toMatch(
      /aria-current="page"[^>]+href="\/app\/configuracion\/documentos"/,
    );
  });
});
