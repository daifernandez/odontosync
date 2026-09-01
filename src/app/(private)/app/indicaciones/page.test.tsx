import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  listInstructionTemplates: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));
vi.mock("@/modules/instructions/repository", () => ({
  listInstructionTemplates: mocks.listInstructionTemplates,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import InstructionsPage from "./page";

describe("InstructionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
    mocks.listInstructionTemplates.mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000010",
        title: "Cuidados posteriores",
        specialty: "surgery",
        introduction: null,
        listStyle: "checks",
        points: ["Descansá."],
        updatedAt: "2026-09-01T03:00:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000011",
        title: "Higiene diaria",
        specialty: "general",
        introduction: null,
        listStyle: "numbered",
        points: ["Cepillate."],
        updatedAt: "2026-08-31T03:00:00.000Z",
      },
    ]);
  });

  it("groups the private library by specialty and exposes clear next actions", async () => {
    const page = await InstructionsPage();
    const markup = renderToStaticMarkup(page);

    expect(mocks.listInstructionTemplates).toHaveBeenCalledWith("owner-id");
    expect(markup).toContain("Odontología general");
    expect(markup).toContain("Cirugía");
    expect(markup).toContain("Cuidados posteriores");
    expect(markup).toContain("Higiene diaria");
    expect(markup).toContain('href="/app/indicaciones/nueva"');
    expect(markup).toContain(
      'href="/app/indicaciones/00000000-0000-4000-8000-000000000010/editar"',
    );
    expect(markup).toContain(
      'href="/app/indicaciones/00000000-0000-4000-8000-000000000010/imprimir"',
    );
  });
});
