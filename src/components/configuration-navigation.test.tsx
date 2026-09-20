import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/configuracion/documentos",
}));

import { ConfigurationNavigation } from "./configuration-navigation";

describe("ConfigurationNavigation", () => {
  it("renders compact labeled icons on mobile and horizontal tabs", () => {
    const markup = renderToStaticMarkup(<ConfigurationNavigation />);

    expect(markup).not.toContain("<summary");
    expect(markup).toContain('nav aria-label="Secciones de configuración" class="min-w-0"');
    expect(markup).not.toContain("overflow-x-auto");
    expect(markup).toContain("grid-cols-5");
    expect(markup).toContain("gap-0");
    expect(markup).toContain("sm:gap-1");
    expect(markup).not.toContain("col-start-2");
    expect(markup).toContain("sm:flex");
    expect(markup).not.toContain("bg-[var(--color-surface)]");
    expect(markup).not.toContain("shadow-[var(--shadow-card)]");
    expect(markup).toContain("sm:bg-transparent");
    expect(markup).toContain("bg-[var(--color-brand-soft)]");
    expect(markup).not.toContain("sr-only sm:not-sr-only");
    expect(markup).toContain("text-[0.625rem]");
    expect(markup).toContain("sm:text-sm");
    expect(markup).toContain('aria-label="Perfil"');
    expect(markup).toContain('aria-label="Consultorio"');
    expect(markup).toContain('aria-label="Agenda"');
    expect(markup).toContain('aria-label="Horarios"');
    expect(markup).toContain('href="/app/configuracion/perfil"');
    expect(markup).toContain('href="/app/configuracion/documentos"');
    expect(markup).toContain('href="/app/configuracion/agenda"');
    expect(markup).toContain('href="/app/configuracion/horarios"');
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });
});
