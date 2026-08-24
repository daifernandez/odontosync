import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getLastAgendaView: vi.fn(),
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
vi.mock("@/modules/agenda/repository", () => ({
  getLastAgendaView: mocks.getLastAgendaView,
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
    mocks.listAppointmentOccupancy.mockResolvedValue([]);
    mocks.listExceptionalBlocksForRange.mockResolvedValue([]);
    mocks.listExceptionalBlocks.mockResolvedValue([]);
    mocks.listPatients.mockResolvedValue([]);
    mocks.getLastAgendaView.mockResolvedValue("week");
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
    expect(mocks.getLastAgendaView).not.toHaveBeenCalled();
  });

  it("opens the authenticated owner saved view when the URL does not choose one", async () => {
    mocks.getLastAgendaView.mockResolvedValue("month");

    const result = await AgendaPage({
      searchParams: Promise.resolve({ fecha: "2026-08-22" }),
    });

    expect(mocks.getLastAgendaView).toHaveBeenCalledWith("owner-id");
    expect(result.type).toBe(mocks.MonthlyAgenda);
  });

  it("lets a valid explicit URL override the saved view without reading it", async () => {
    mocks.getLastAgendaView.mockResolvedValue("month");

    const result = await AgendaPage({
      searchParams: Promise.resolve({
        vista: "dia",
        fecha: "2026-08-22",
      }),
    });

    expect(mocks.getLastAgendaView).not.toHaveBeenCalled();
    expect(result.type).toBe(mocks.WeeklyAgenda);
    expect(result.props.view).toBe("day");
  });

  it("keeps legacy weekly URLs on their requested week", async () => {
    mocks.getLastAgendaView.mockResolvedValue("month");

    const result = await AgendaPage({
      searchParams: Promise.resolve({ semana: "2026-08-10" }),
    });

    expect(mocks.getLastAgendaView).not.toHaveBeenCalled();
    expect(result.type).toBe(mocks.WeeklyAgenda);
    expect(result.props.view).toBe("week");
    expect(result.props.week.startDate).toBe("2026-08-10");
  });

  it("opens the new appointment workflow even when month is preferred", async () => {
    mocks.getLastAgendaView.mockResolvedValue("month");

    const result = await AgendaPage({
      searchParams: Promise.resolve({ nuevo: "1" }),
    });

    expect(mocks.getLastAgendaView).not.toHaveBeenCalled();
    expect(result.type).toBe(mocks.WeeklyAgenda);
    expect(result.props.autoOpenNewAppointment).toBe(true);
  });

  it("passes the patient context to the new appointment workflow", async () => {
    const result = await AgendaPage({
      searchParams: Promise.resolve({ nuevo: "1", paciente: "patient-id" }),
    });

    expect(result.type).toBe(mocks.WeeklyAgenda);
    expect(result.props.initialPatientId).toBe("patient-id");
  });

  it("falls back to weekly agenda when the preference cannot be read", async () => {
    mocks.getLastAgendaView.mockRejectedValue(new Error("database unavailable"));

    const result = await AgendaPage({
      searchParams: Promise.resolve({}),
    });

    expect(result.type).toBe(mocks.WeeklyAgenda);
    expect(result.props.view).toBe("week");
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
