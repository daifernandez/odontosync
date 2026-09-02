import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import InstructionsError from "./error";

describe("InstructionsError", () => {
  it("offers a compact retry state on mobile", () => {
    const markup = renderToStaticMarkup(
      <InstructionsError reset={vi.fn()} />,
    );

    expect(markup).toContain("No pudimos abrir tus indicaciones");
    expect(markup).toContain("min-h-[24rem]");
    expect(markup).toContain("md:min-h-[70vh]");
    expect(markup).toContain("text-xl");
    expect(markup).toContain("md:text-2xl");
    expect(markup).toContain(">Reintentar</button>");
  });
});
