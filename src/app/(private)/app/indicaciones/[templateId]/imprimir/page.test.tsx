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

import PrintableInstructionPage from "./page";

describe("PrintableInstructionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
    mocks.getProfile.mockResolvedValue({
      fullName: "Dra. Ana Pérez",
      licenseNumber: "12345",
      licenseJurisdiction: "CABA",
      clinicName: null,
      officeAddress: null,
      contactPhone: null,
      contactEmail: null,
      additionalInformation: null,
    });
    mocks.getInstructionTemplate.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000010",
      title: "Cuidados posteriores",
      specialty: "surgery",
      introduction: null,
      listStyle: "checks",
      points: ["Descansá."],
      updatedAt: "2026-09-01T03:00:00.000Z",
    });
  });

  it("shows the owner document and only screen actions outside the paper", async () => {
    const page = await PrintableInstructionPage({
      params: Promise.resolve({
        templateId: "00000000-0000-4000-8000-000000000010",
      }),
      searchParams: Promise.resolve({ creada: "1" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(mocks.getInstructionTemplate).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
      "owner-id",
    );
    expect(markup).toContain("La indicación quedó guardada");
    expect(markup).not.toContain("Dra. Ana Pérez");
    expect(markup).toContain("Incluir mis datos profesionales");
    expect(markup).toContain("Cuidados posteriores");
    expect(markup).toContain("Imprimir o guardar como PDF");
    expect(markup).toContain("Imprimir / PDF");
    expect(markup).toContain(
      "grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]",
    );
    expect(markup).toContain('aria-label="Imprimir o guardar como PDF"');
    expect(markup).toContain('class="xl:hidden"');
    expect(markup).toContain('class="hidden xl:inline"');
    expect(markup).toContain('class="px-3 py-5 md:px-8 md:py-10"');
    expect(markup).toContain("px-3 py-2.5 text-xs leading-5");
    expect(markup).toContain("max-w-[30rem] md:max-w-[60rem]");
    expect(markup).toContain("w-fit max-w-full");
    expect(markup).toContain(
      "xl:grid-cols-[minmax(0,1fr)_auto]",
    );
    expect(markup).toContain("hidden text-[0.72rem]");
    expect(markup).toContain("md:block");
    expect(markup).toContain("instruction-screen-only");
    expect(markup).toContain("instruction-print-root");
  });
});
