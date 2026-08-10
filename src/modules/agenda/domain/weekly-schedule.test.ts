import { describe, expect, it } from "vitest";

import {
  buildAgendaWeek,
  buildWeeklySchedule,
  getAgendaWeekRange,
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
