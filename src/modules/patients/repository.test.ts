import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { getPatient } from "./repository";

describe("getPatient", () => {
  it("scopes a patient read to the authenticated owner", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await getPatient("patient-id", "owner-id");

    expect(query.eq).toHaveBeenCalledWith("id", "patient-id");
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });
});
