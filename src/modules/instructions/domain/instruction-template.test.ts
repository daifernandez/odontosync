import { describe, expect, it } from "vitest";

import {
  getInstructionListMarker,
  validateInstructionTemplate,
  validateInstructionTemplateId,
} from "./instruction-template";

describe("validateInstructionTemplate", () => {
  it("normalizes a reusable instruction with long ordered points", () => {
    expect(
      validateInstructionTemplate({
        title: "  Cuidados después de una extracción  ",
        specialty: "surgery",
        introduction: "  Seguí estas indicaciones durante las próximas horas.  ",
        listStyle: "numbered",
        points: [
          "  Mordé la gasa durante 30 minutos.  ",
          "No realices actividad física intensa durante las primeras 24 horas.",
        ],
      }),
    ).toEqual({
      success: true,
      data: {
        title: "Cuidados después de una extracción",
        specialty: "surgery",
        introduction:
          "Seguí estas indicaciones durante las próximas horas.",
        listStyle: "numbered",
        points: [
          "Mordé la gasa durante 30 minutos.",
          "No realices actividad física intensa durante las primeras 24 horas.",
        ],
      },
    });
  });

  it("accepts an empty introduction and removes empty trailing points", () => {
    expect(
      validateInstructionTemplate({
        title: "Higiene diaria",
        specialty: "general",
        introduction: "   ",
        listStyle: "checks",
        points: ["Cepillate después de cada comida.", "   "],
      }),
    ).toEqual({
      success: true,
      data: {
        title: "Higiene diaria",
        specialty: "general",
        introduction: null,
        listStyle: "checks",
        points: ["Cepillate después de cada comida."],
      },
    });
  });

  it("rejects invalid metadata and requires at least one useful point", () => {
    expect(
      validateInstructionTemplate({
        title: " ",
        specialty: "unknown",
        introduction: "a".repeat(2001),
        listStyle: "custom",
        points: [" ", ""],
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        title: "Escribí un título para identificar la indicación.",
        specialty: "Elegí una especialidad válida.",
        introduction: "La introducción puede tener hasta 2000 caracteres.",
        listStyle: "Elegí un estilo de lista válido.",
        points: "Agregá al menos una indicación.",
      },
    });
  });

  it("limits titles, point length, and the amount of points", () => {
    expect(
      validateInstructionTemplate({
        title: "a".repeat(121),
        specialty: "endodontics",
        introduction: "",
        listStyle: "bullets",
        points: ["a".repeat(1001), ...Array.from({ length: 20 }, () => "Otra")],
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        title: "El título puede tener hasta 120 caracteres.",
        points: "Podés agregar hasta 20 indicaciones de 1000 caracteres cada una.",
      },
    });
  });
});

describe("instruction identifiers and markers", () => {
  it("normalizes UUIDs and rejects arbitrary identifiers", () => {
    expect(
      validateInstructionTemplateId("00000000-0000-4000-8000-0000000000AA"),
    ).toBe("00000000-0000-4000-8000-0000000000aa");
    expect(validateInstructionTemplateId("not-an-id")).toBeNull();
  });

  it.each([
    ["numbered", 2, "3"],
    ["dashes", 0, "—"],
    ["bullets", 0, "•"],
    ["checks", 0, "✓"],
    ["odontosync", 0, "OS"],
  ] as const)("renders the %s list marker", (style, index, marker) => {
    expect(getInstructionListMarker(style, index)).toBe(marker);
  });
});
