import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { getLastAgendaView, saveLastAgendaView } from "./repository";

function createQuery(result: {
  data: { last_agenda_view?: string; user_id?: string } | null;
  error: { code: string } | null;
}) {
  const query = {
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };

  query.select.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  return query;
}

describe("agenda view preference repository", () => {
  it("reads only the authenticated owner's saved view", async () => {
    const query = createQuery({
      data: { last_agenda_view: "month" },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(getLastAgendaView("owner-id")).resolves.toBe("month");

    expect(query.select).toHaveBeenCalledWith("last_agenda_view");
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });

  it("updates only the authenticated owner's saved view", async () => {
    const query = createQuery({ data: { user_id: "owner-id" }, error: null });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await saveLastAgendaView("day", "owner-id");

    expect(query.update).toHaveBeenCalledWith({ last_agenda_view: "day" });
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });

  it("reports a missing or rejected owner update", async () => {
    const query = createQuery({ data: null, error: null });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(saveLastAgendaView("month", "owner-id")).rejects.toThrow(
      "Could not save the agenda view preference",
    );
  });
});
