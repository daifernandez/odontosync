import { describe, expect, it } from "vitest";

import {
  buildAgendaDay,
  buildAgendaMonth,
  buildAgendaPath,
  buildAgendaWeek,
  buildWeeklySchedule,
  getAgendaMonthRange,
  getAgendaWeekRange,
  parseAgendaView,
  parseOptionalAgendaView,
} from "./weekly-schedule";

describe("buildWeeklySchedule", () => {
  it("returns every weekday and orders each day's blocks by start time", () => {
    const schedule = buildWeeklySchedule([
      { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "10:00", endTime: "13:00" },
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    ]);

    expect(schedule).toHaveLength(7);
    expect(schedule[0]).toMatchObject({
      label: "Lunes",
      blocks: [
        { startTime: "09:00", endTime: "12:00" },
        { startTime: "14:00", endTime: "18:00" },
      ],
    });
    expect(schedule[1]).toMatchObject({ label: "Martes", blocks: [] });
    expect(schedule[2]).toMatchObject({
      label: "Miércoles",
      blocks: [{ startTime: "10:00", endTime: "13:00" }],
    });
  });
});

describe("buildAgendaWeek", () => {
  it("normalizes any selected date to a Monday and returns five dated days", () => {
    const week = buildAgendaWeek("2026-08-12");

    expect(week.startDate).toBe("2026-08-10");
    expect(week.previousStartDate).toBe("2026-08-03");
    expect(week.nextStartDate).toBe("2026-08-17");
    expect(week.days).toEqual([
      { dayOfWeek: 1, date: "2026-08-10", label: "Lunes" },
      { dayOfWeek: 2, date: "2026-08-11", label: "Martes" },
      { dayOfWeek: 3, date: "2026-08-12", label: "Miércoles" },
      { dayOfWeek: 4, date: "2026-08-13", label: "Jueves" },
      { dayOfWeek: 5, date: "2026-08-14", label: "Viernes" },
    ]);
  });

  it("falls back to the current Argentina week for an invalid value", () => {
    const week = buildAgendaWeek(
      "not-a-date",
      new Date("2026-08-16T15:00:00.000Z"),
    );

    expect(week.startDate).toBe("2026-08-10");
  });
});

describe("getAgendaWeekRange", () => {
  it("returns Argentina midnight boundaries for the selected week", () => {
    const range = getAgendaWeekRange("2026-08-10");

    expect(range.from.toISOString()).toBe("2026-08-10T03:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-08-17T03:00:00.000Z");
  });
});

describe("buildAgendaDay", () => {
  it("returns the selected day and its adjacent dates", () => {
    expect(buildAgendaDay("2026-08-12")).toEqual({
      date: "2026-08-12",
      dayOfWeek: 3,
      label: "Miércoles",
      previousDate: "2026-08-11",
      nextDate: "2026-08-13",
    });
  });

  it("falls back to the current Argentina date for an invalid value", () => {
    expect(
      buildAgendaDay("not-a-date", new Date("2026-08-16T02:00:00.000Z")),
    ).toMatchObject({ date: "2026-08-15", label: "Sábado" });
  });
});

describe("buildAgendaMonth", () => {
  it("returns a stable six-week grid for the selected calendar month", () => {
    const month = buildAgendaMonth("2026-08-22");

    expect(month).toMatchObject({
      startDate: "2026-08-01",
      previousStartDate: "2026-07-01",
      nextStartDate: "2026-09-01",
    });
    expect(month.days).toHaveLength(42);
    expect(month.days[0]).toMatchObject({
      date: "2026-07-27",
      dayOfMonth: 27,
      isCurrentMonth: false,
      label: "Lunes",
    });
    expect(month.days[5]).toMatchObject({
      date: "2026-08-01",
      dayOfMonth: 1,
      isCurrentMonth: true,
      label: "Sábado",
    });
    expect(month.days.at(-1)).toMatchObject({
      date: "2026-09-06",
      isCurrentMonth: false,
      label: "Domingo",
    });
  });

  it("falls back to the current Argentina month for an invalid value", () => {
    expect(
      buildAgendaMonth(
        "not-a-date",
        new Date("2026-09-01T02:00:00.000Z"),
      ).startDate,
    ).toBe("2026-08-01");
  });
});

describe("getAgendaMonthRange", () => {
  it("returns Argentina midnight boundaries for the selected month", () => {
    const range = getAgendaMonthRange("2026-08-22");

    expect(range.from.toISOString()).toBe("2026-08-01T03:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-09-01T03:00:00.000Z");
  });
});

describe("parseAgendaView", () => {
  it("accepts daily and monthly views and safely falls back to weekly", () => {
    expect(parseAgendaView("dia")).toBe("day");
    expect(parseAgendaView("mes")).toBe("month");
    expect(parseAgendaView("semana")).toBe("week");
    expect(parseAgendaView("day")).toBe("day");
    expect(parseAgendaView("month")).toBe("month");
    expect(parseAgendaView("invalid")).toBe("week");
  });

  it("distinguishes a valid explicit view from an absent or invalid value", () => {
    expect(parseOptionalAgendaView("dia")).toBe("day");
    expect(parseOptionalAgendaView("month")).toBe("month");
    expect(parseOptionalAgendaView("invalid")).toBeNull();
    expect(parseOptionalAgendaView(undefined)).toBeNull();
  });
});

describe("buildAgendaPath", () => {
  it("keeps the daily date and appends known state parameters", () => {
    expect(
      buildAgendaPath({
        weekStartDate: "2026-08-10",
        view: "day",
        selectedDate: "2026-08-12",
        params: { turno: "00000000-0000-4000-8000-000000000010" },
      }),
    ).toBe(
      "/app/agenda?semana=2026-08-10&vista=dia&fecha=2026-08-12&turno=00000000-0000-4000-8000-000000000010",
    );
  });

  it("preserves the existing weekly URL shape", () => {
    expect(
      buildAgendaPath({
        weekStartDate: "2026-08-10",
        view: "week",
        selectedDate: "2026-08-12",
        params: { creado: "1" },
      }),
    ).toBe("/app/agenda?semana=2026-08-10&creado=1");
  });

  it("keeps the monthly view in a normalized and shareable URL", () => {
    expect(
      buildAgendaPath({
        view: "month",
        selectedDate: "2026-08-22",
      }),
    ).toBe("/app/agenda?vista=mes&fecha=2026-08-01");
  });
});
