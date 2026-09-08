import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("print styles", () => {
  it("keeps instruction printing and removes retired static printable styles", () => {
    const styles = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

    expect(styles).toContain(".instruction-print-root");
    expect(styles).toContain(".instruction-document");
    expect(styles).not.toContain(".printable-print-root");
    expect(styles).not.toContain(".printable-document");
  });
});
