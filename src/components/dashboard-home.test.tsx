import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardHome } from "./dashboard-home";

describe("DashboardHome", () => {
  it("links the authenticated new appointment action to the agenda form", () => {
    const markup = renderToStaticMarkup(<DashboardHome />);

    expect(markup).toContain(
      'href="/app/agenda?nuevo=1#nuevo-turno"',
    );
    expect(markup).toContain("Nuevo turno");
  });

  it("links the authenticated agenda actions to the agenda", () => {
    const markup = renderToStaticMarkup(<DashboardHome />);

    expect(markup).toContain('href="/app/agenda"');
    expect(markup.match(/href="\/app\/agenda"/g)).toHaveLength(4);
  });

  it("keeps demo agenda actions inside the public demo", () => {
    const markup = renderToStaticMarkup(<DashboardHome demoMode />);

    expect(markup).not.toContain('href="/app');
    expect(markup).toContain('href="/demo/agenda"');
    expect(markup).toContain(
      'href="/demo/agenda?nuevo=1#nuevo-turno"',
    );
  });

  it("disables modules that are not part of the demo yet", () => {
    const markup = renderToStaticMarkup(<DashboardHome demoMode />);

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain("Próximamente");
  });
});
