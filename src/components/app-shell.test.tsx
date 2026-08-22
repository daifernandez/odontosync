import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

let pathname = "/app";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("@/modules/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

const user = {
  fullName: "Evaluación OdontoSync",
  email: "evaluacion@odontosync.test",
};

describe("AppShell", () => {
  beforeEach(() => {
    pathname = "/app";
  });

  it("links every available authenticated section to its route", () => {
    const markup = renderToStaticMarkup(
      <AppShell user={user}>Contenido</AppShell>,
    );

    expect(markup).toContain('href="/app"');
    expect(markup).toContain('href="/app/agenda"');
    expect(markup).toContain('href="/app/pacientes"');
    expect(markup).toContain('href="/app/configuracion"');
  });

  it("keeps a section active on its nested routes", () => {
    pathname = "/app/pacientes/patient-1/editar";

    const markup = renderToStaticMarkup(
      <AppShell user={user}>Contenido</AppShell>,
    );

    expect(markup).toMatch(
      /<a aria-current="page"[^>]+href="\/app\/pacientes"/,
    );
  });

  it("does not expose unavailable sections as working buttons", () => {
    const markup = renderToStaticMarkup(
      <AppShell user={user}>Contenido</AppShell>,
    );

    expect(markup).toMatch(
      /<button aria-disabled="true"[^>]+disabled="" title="Imprimibles: próximamente"/,
    );
    expect(markup).toMatch(
      /<button aria-disabled="true"[^>]+disabled="" title="Indicaciones: próximamente"/,
    );
  });

  it("does not send demo navigation to authenticated routes", () => {
    pathname = "/demo";

    const markup = renderToStaticMarkup(
      <AppShell mode="demo" user={user}>
        Contenido
      </AppShell>,
    );

    expect(markup).not.toContain('href="/app');
    expect(markup).toContain('href="/demo"');
    expect(markup).toContain('href="/demo/agenda"');
    expect(markup).toContain('href="/demo/pacientes"');
  });

  it("keeps only the current demo section active", () => {
    pathname = "/demo/agenda";

    const markup = renderToStaticMarkup(
      <AppShell mode="demo" user={user}>
        Contenido
      </AppShell>,
    );

    expect(markup).toMatch(
      /<a aria-current="page"[^>]+href="\/demo\/agenda"/,
    );
    expect(markup).not.toMatch(
      /<a aria-current="page"[^>]+href="\/demo"/,
    );
  });
});
