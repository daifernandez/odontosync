import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { ExceptionalBlocksPanel } from "./exceptional-blocks-panel";

describe("ExceptionalBlocksPanel", () => {
  it("explains the empty state and keeps every field labelled", () => {
    const markup = renderToStaticMarkup(
      <ExceptionalBlocksPanel
        autoOpen={false}
        blocks={[]}
        created={false}
        deleted={false}
        managementError={false}
        weekStartDate="2099-08-10"
      />,
    );

    expect(markup).toContain("Bloquear horario");
    expect(markup).toContain("No hay bloqueos vigentes");
    expect(markup).toContain("Fecha y hora de inicio");
    expect(markup).toContain("Fecha y hora de finalización");
    expect(markup).toContain("Motivo");
  });

  it("shows an existing block and requires a second destructive action", () => {
    const markup = renderToStaticMarkup(
      <ExceptionalBlocksPanel
        autoOpen
        blocks={[
          {
            id: "00000000-0000-4000-8000-000000000010",
            startsAt: "2099-08-11T12:00:00.000Z",
            endsAt: "2099-08-11T15:00:00.000Z",
            category: "holiday",
          },
        ]}
        created
        deleted={false}
        managementError={false}
        weekStartDate="2099-08-10"
      />,
    );

    expect(markup).toContain("Feriado");
    expect(markup).toContain("El bloqueo se guardó correctamente");
    expect(markup).toContain("¿Eliminar este bloqueo?");
    expect(markup).toContain("Confirmar eliminación");
  });
});
