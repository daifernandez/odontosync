import { describe, expect, it } from "vitest";

import { buildWeeklySchedule } from "./weekly-schedule";

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
