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
});
