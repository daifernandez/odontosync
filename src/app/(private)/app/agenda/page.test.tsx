import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getInitialConfiguration: vi.fn(),
  listAppointmentsForRange: vi.fn(),
  listAppointmentOccupancy: vi.fn(),
  listExceptionalBlocks: vi.fn(),
  listExceptionalBlocksForRange: vi.fn(),
  listPatients: vi.fn(),
  MonthlyAgenda: vi.fn(),
  WeeklyAgenda: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));
vi.mock("@/components/monthly-agenda", () => ({
  MonthlyAgenda: mocks.MonthlyAgenda,
}));
vi.mock("@/components/weekly-agenda", () => ({
  WeeklyAgenda: mocks.WeeklyAgenda,
}));
vi.mock("@/modules/initial-configuration/repository", () => ({
  getInitialConfiguration: mocks.getInitialConfiguration,
}));
vi.mock("@/modules/appointments/repository", () => ({
  listAppointmentsForRange: mocks.listAppointmentsForRange,
  listAppointmentOccupancy: mocks.listAppointmentOccupancy,
}));
vi.mock("@/modules/exceptional-blocks/repository", () => ({
  listExceptionalBlocks: mocks.listExceptionalBlocks,
  listExceptionalBlocksForRange: mocks.listExceptionalBlocksForRange,
}));
vi.mock("@/modules/patients/repository", () => ({
  listPatients: mocks.listPatients,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import AgendaPage from "./page";

describe("AgendaPage monthly view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
    mocks.getInitialConfiguration.mockResolvedValue({
      availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "13:00" }],
    });
    mocks.listAppointmentsForRange.mockResolvedValue([]);
    mocks.listExceptionalBlocksForRange.mockResolvedValue([]);
  });

  it("loads only the selected owner month and renders the monthly component", async () => {
    const result = await AgendaPage({
      searchParams: Promise.resolve({
        vista: "mes",
        fecha: "2026-08-22",
      }),
    });

    expect(mocks.listAppointmentsForRange).toHaveBeenCalledWith(
      new Date("2026-08-01T03:00:00.000Z"),
      new Date("2026-09-01T03:00:00.000Z"),
      "owner-id",
    );
    expect(mocks.listExceptionalBlocksForRange).toHaveBeenCalledWith(
      new Date("2026-08-01T03:00:00.000Z"),
      new Date("2026-09-01T03:00:00.000Z"),
      "owner-id",
    );
    expect(mocks.listPatients).not.toHaveBeenCalled();
    expect(mocks.listAppointmentOccupancy).not.toHaveBeenCalled();
    expect(result.type).toBe(mocks.MonthlyAgenda);
    expect(result.props.month.startDate).toBe("2026-08-01");
  });

  it("redirects an expired session before reading private calendar data", async () => {
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: {} } }),
      },
    });

    await expect(
      AgendaPage({
        searchParams: Promise.resolve({ vista: "mes", fecha: "2026-08-22" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.redirect).toHaveBeenCalledWith("/ingresar");
    expect(mocks.listAppointmentsForRange).not.toHaveBeenCalled();
  });
});
