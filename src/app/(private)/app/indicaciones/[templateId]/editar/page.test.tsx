import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getInstructionTemplate: vi.fn(),
  getProfile: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/modules/initial-configuration/repository", () => ({
  getProfile: mocks.getProfile,
}));
vi.mock("@/modules/instructions/repository", () => ({
  getInstructionTemplate: mocks.getInstructionTemplate,
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import EditInstructionPage from "./page";

describe("EditInstructionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
    mocks.getProfile.mockResolvedValue(null);
    mocks.getInstructionTemplate.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000010",
      title: "Copia de Cuidados posteriores",
      specialty: "surgery",
      introduction: null,
      listStyle: "checks",
      points: ["Descansá."],
      updatedAt: "2026-09-01T03:00:00.000Z",
    });
  });

  it("confirms that the duplicate is independent and ready to edit", async () => {
    const page = await EditInstructionPage({
      params: Promise.resolve({
        templateId: "00000000-0000-4000-8000-000000000010",
      }),
      searchParams: Promise.resolve({ duplicada: "1" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain(
      "Creamos una copia independiente. Podés editarla sin modificar la original.",
    );
    expect(markup).toContain("Copia de Cuidados posteriores");
  });
});
