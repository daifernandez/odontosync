import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  cancelAppointment,
  closeAppointment,
  listPatientAppointments,
  listUpcomingAppointments,
  rescheduleAppointment,
} from "./repository";

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

describe("listUpcomingAppointments", () => {
  it("scopes dashboard reads to the authenticated owner and requested limit", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      gte: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.in.mockReturnValue(query);
    query.order.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await listUpcomingAppointments(
      new Date("2099-08-10T14:00:00.000Z"),
      "owner-id",
      3,
    );

    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(query.limit).toHaveBeenCalledWith(3);
  });
});

describe("listPatientAppointments", () => {
  it("scopes patient history reads to the patient and authenticated owner", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await listPatientAppointments("patient-id", "owner-id");

    expect(query.eq).toHaveBeenCalledWith("patient_id", "patient-id");
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(query.in).toHaveBeenCalledWith("status", [
      "pending_confirmation",
      "confirmed",
      "completed",
      "no_show",
    ]);
    expect(query.order).toHaveBeenCalledWith("starts_at", {
      ascending: false,
    });
  });
});

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

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the atomic database function with the selected time", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "00000000-0000-4000-8000-000000000011",
      error: null,
    });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      rescheduleAppointment(
        "00000000-0000-4000-8000-000000000010",
        "2099-08-11T12:00:00.000Z",
        false,
      ),
    ).resolves.toBe("rescheduled");
    expect(rpc).toHaveBeenCalledWith("reschedule_appointment", {
      appointment_id: "00000000-0000-4000-8000-000000000010",
      new_starts_at: "2099-08-11T12:00:00.000Z",
      confirm_overlap: false,
    });
  });

  it("reports a database overlap without losing the original appointment", async () => {
    mocks.createClient.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "23P01" },
      }),
    });

    await expect(
      rescheduleAppointment(
        "00000000-0000-4000-8000-000000000010",
        "2099-08-11T12:00:00.000Z",
        false,
      ),
    ).resolves.toBe("overlap");
  });

  it("distinguishes an exceptional block from a confirmable overlap", async () => {
    mocks.createClient.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "P1001" },
      }),
    });

    await expect(
      rescheduleAppointment(
        "00000000-0000-4000-8000-000000000010",
        "2099-08-11T12:00:00.000Z",
        true,
      ),
    ).resolves.toBe("blocked");
  });

  it.each(["23514", "42501", "P0002"])(
    "maps database rejection %s to an unavailable appointment",
    async (code) => {
      mocks.createClient.mockResolvedValue({
        rpc: vi.fn().mockResolvedValue({ data: null, error: { code } }),
      });

      await expect(
        rescheduleAppointment(
          "00000000-0000-4000-8000-000000000010",
          "2099-08-11T12:00:00.000Z",
          false,
        ),
      ).resolves.toBe("unavailable");
    },
  );
});
