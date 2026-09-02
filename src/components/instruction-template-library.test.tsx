import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
  useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return { ...actual, useState: reactMocks.useState };
});

import type { InstructionTemplate } from "@/modules/instructions/domain/instruction-template";

import {
  filterInstructionTemplates,
  InstructionTemplateLibrary,
} from "./instruction-template-library";

const templates: InstructionTemplate[] = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    title: "Cuidados después de una extracción",
    specialty: "surgery",
    introduction: "Para acompañar una buena recuperación.",
    listStyle: "checks",
    points: ["Evitá enjuagarte con fuerza."],
    updatedAt: "2026-09-01T03:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    title: "Rutina de higiene diaria",
    specialty: "general",
    introduction: null,
    listStyle: "numbered",
    points: ["Cepillate después de cada comida."],
    updatedAt: "2026-08-31T03:00:00.000Z",
  },
];

describe("InstructionTemplateLibrary", () => {
  beforeEach(() => {
    reactMocks.useState.mockImplementation((initialValue) => [
      initialValue,
      vi.fn(),
    ]);
  });

  it("searches titles, introductions and points without case or accent differences", () => {
    expect(filterInstructionTemplates(templates, "EXTRACCION", "all")).toEqual([
      templates[0],
    ]);
    expect(
      filterInstructionTemplates(templates, "recuperacion", "all"),
    ).toEqual([templates[0]]);
    expect(filterInstructionTemplates(templates, "cepillate", "all")).toEqual([
      templates[1],
    ]);
  });

  it("combines text search with the selected specialty", () => {
    expect(
      filterInstructionTemplates(templates, "cuidados", "general"),
    ).toEqual([]);
    expect(filterInstructionTemplates(templates, "", "surgery")).toEqual([
      templates[0],
    ]);
  });

  it("renders the search and specialty controls with the grouped library", () => {
    const markup = renderToStaticMarkup(
      <InstructionTemplateLibrary templates={templates} />,
    );

    expect(markup).toContain('type="search"');
    expect(markup).toContain("Buscar indicaciones");
    expect(markup).toContain(">Todas<");
    expect(markup).toContain("Odontología general");
    expect(markup).toContain("Cirugía");
    expect(markup).not.toContain(">2 plantillas<");
    expect(markup).toContain("mt-8 flex min-w-0");
    expect(markup).toContain("size-9 shrink-0");
    expect(markup).toContain("sm:size-11");
    expect(markup).toContain('class="hidden text-[0.66rem]');
    expect(markup).toContain("sm:inline");
    expect(markup).toContain("line-clamp-1");
    expect(markup).toContain("sm:line-clamp-2");
  });

  it("presents filter reset as a subtle secondary button", () => {
    reactMocks.useState
      .mockReturnValueOnce(["", vi.fn()])
      .mockReturnValueOnce(["general", vi.fn()]);

    const markup = renderToStaticMarkup(
      <InstructionTemplateLibrary templates={templates} />,
    );

    expect(markup).toContain('aria-label="Restablecer filtros"');
    expect(markup).toContain(
      '>Restablecer<span class="hidden sm:inline"> filtros</span></button>',
    );
    expect(markup).toContain("inline-flex min-h-8");
    expect(markup).toContain("px-2 text-xs!");
    expect(markup).toContain("after:-inset-y-1.5");
    expect(markup).toContain("rounded-full");
    expect(markup).toContain("border-[rgb(219_230_228/70%)]");
    expect(markup).toContain("bg-white/70");
    expect(markup).toContain("items-center justify-between");
    expect(markup).toContain("mt-8 flex min-w-0");
  });
});
