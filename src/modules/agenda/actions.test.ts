import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  saveLastAgendaView: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));
vi.mock("./repository", () => ({
  saveLastAgendaView: mocks.saveLastAgendaView,
}));

import { saveAgendaViewPreferenceAction } from "./actions";

describe("saveAgendaViewPreferenceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
  });

  it("saves a validated preference for the authenticated owner", async () => {
    await expect(saveAgendaViewPreferenceAction("month")).resolves.toBe(true);

    expect(mocks.saveLastAgendaView).toHaveBeenCalledWith("month", "owner-id");
  });

  it("rejects unsupported values before accessing the session", async () => {
    await expect(
      saveAgendaViewPreferenceAction("unsupported"),
    ).resolves.toBe(false);

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.saveLastAgendaView).not.toHaveBeenCalled();
  });

  it("does not write without an authenticated owner", async () => {
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: {} } }),
      },
    });

    await expect(saveAgendaViewPreferenceAction("day")).resolves.toBe(false);

    expect(mocks.saveLastAgendaView).not.toHaveBeenCalled();
  });

  it("contains persistence failures so navigation can continue", async () => {
    mocks.saveLastAgendaView.mockRejectedValue(new Error("database unavailable"));

    await expect(saveAgendaViewPreferenceAction("week")).resolves.toBe(false);
  });
});
