import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import InstructionsLoading from "./loading";

describe("InstructionsLoading", () => {
  it("mirrors the compact library layout on mobile", () => {
    const markup = renderToStaticMarkup(<InstructionsLoading />);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("h-52");
    expect(markup).toContain("md:h-44");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain("min-h-24");
  });
});
