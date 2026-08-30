import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const appointmentsRlsTest = readFileSync(
  new URL("../../../supabase/tests/database/appointments-rls.sql", import.meta.url),
  "utf8",
);

describe("appointments RLS fixture", () => {
  it("uses a transaction-local auth user instead of a real project user", () => {
    expect(appointmentsRlsTest).toMatch(/INSERT INTO auth\.users/i);
    expect(appointmentsRlsTest).toContain('"fixture":"appointments_rls"');
    expect(appointmentsRlsTest).not.toMatch(/FROM auth\.users\s+LIMIT 1/i);
    expect(appointmentsRlsTest).toMatch(/ROLLBACK;/i);
  });
});
