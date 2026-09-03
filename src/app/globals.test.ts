import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("printable page styles", () => {
  it("lets the printable root size itself without forcing a blank second page", () => {
    const styles = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

    expect(styles).toMatch(
      /\.printable-print-root\s*\{[^}]*bottom:\s*auto;/,
    );
    expect(styles).toMatch(
      /body:has\(\.printable-print-root\) \.min-h-screen\s*\{[^}]*min-height:\s*0;/,
    );
    expect(styles).toMatch(
      /\.printable-document\s*\{[^}]*min-height:\s*269mm;[^}]*height:\s*269mm;/,
    );
  });

  it("covers each sheet with a diagonal, subtle and printable watermark pattern", () => {
    const styles = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

    expect(styles).toMatch(
      /\.printable-document-watermark\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*pointer-events:\s*none;[^}]*z-index:\s*0;/,
    );
    expect(styles).toMatch(
      /\.printable-document-watermark\s*\{[^}]*grid-template-columns:\s*repeat\(3,[^;]+;[^}]*grid-template-rows:\s*repeat\(6,/,
    );
    expect(styles).toMatch(
      /\.printable-document-watermark > span\s*\{[^}]*transform:\s*rotate\(-32deg\);[^}]*opacity:\s*0\.05;/,
    );
    expect(styles).toMatch(
      /@media print\s*\{[\s\S]*\.printable-document-watermark\s*\{[^}]*print-color-adjust:\s*exact;/,
    );
  });

});
