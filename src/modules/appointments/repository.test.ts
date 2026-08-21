import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { cancelAppointment, closeAppointment } from "./repository";

function createUpdateQuery(result: {
  data: { id: string } | null;
  error: { code: string } | null;
}) {
  const query = {
    update: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };

  query.update.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.select.mockReturnValue(query);

  return query;
}

describe("cancelAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests cancellation for a pending or confirmed appointment", async () => {
    const query = createUpdateQuery({
      data: { id: "appointment-id" },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(cancelAppointment("appointment-id")).resolves.toBe(
      "cancelled",
    );
    expect(query.update).toHaveBeenCalledWith({ status: "cancelled" });
    expect(query.eq).toHaveBeenCalledWith("id", "appointment-id");
    expect(query.in).toHaveBeenCalledWith("status", [
      "pending_confirmation",
      "confirmed",
    ]);
  });

  it("reports a cancellation rejected by database policy as unavailable", async () => {
    const query = createUpdateQuery({ data: null, error: { code: "23514" } });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(cancelAppointment("appointment-id")).resolves.toBe(
      "unavailable",
    );
  });
});

describe("closeAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests a confirmed appointment closure and returns the historical status", async () => {
    const query = createUpdateQuery({
      data: { id: "appointment-id" },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(closeAppointment("appointment-id", "completed")).resolves.toBe(
      "completed",
    );
    expect(query.update).toHaveBeenCalledWith({ status: "completed" });
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "appointment-id");
    expect(query.eq).toHaveBeenNthCalledWith(2, "status", "confirmed");
  });

  it("reports an appointment rejected by database policy as unavailable", async () => {
    const query = createUpdateQuery({ data: null, error: { code: "42501" } });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(closeAppointment("appointment-id", "no_show")).resolves.toBe(
      "unavailable",
    );
  });

  it("reports a missing or ineligible confirmed appointment as unavailable", async () => {
    const query = createUpdateQuery({ data: null, error: null });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(closeAppointment("appointment-id", "completed")).resolves.toBe(
      "unavailable",
    );
  });
});
