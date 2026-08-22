import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const demoComponentFiles = [
  "demo-agenda.tsx",
  "demo-patients.tsx",
  "demo-state.tsx",
];

describe("public demo boundary", () => {
  it.each(demoComponentFiles)(
    "%s does not access persistence or private repositories",
    (fileName) => {
      const source = readFileSync(
        join(process.cwd(), "src", "components", fileName),
        "utf8",
      );

      expect(source).not.toMatch(/@\/lib\/supabase/);
      expect(source).not.toMatch(/@\/modules\//);
      expect(source).not.toMatch(/\bfetch\s*\(/);
      expect(source).not.toMatch(/\b(?:localStorage|sessionStorage)\b/);
    },
  );
});
