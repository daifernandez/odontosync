import { describe, expect, it } from "vitest";

import { getAvailableAppointmentWindows } from "./availability";

const input = {
  date: "2026-09-14",
  availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "13:00" }],
  appointments: [
    {
      startsAt: "2026-09-14T12:00:00Z",
      durationMinutes: 30,
      cleanupMinutes: 5,
    },
  ],
  exceptionalBlocks: [
    { startsAt: "2026-09-14T13:30:00Z", endsAt: "2026-09-14T14:00:00Z" },
  ],
  durationMinutes: 30,
  cleanupMinutes: 5,
  gridIntervalMinutes: 15,
  now: new Date("2026-09-13T12:00:00Z"),
};

describe("available windows for the daily agenda", () => {
  it("shows actual free boundaries while offering only valid grid starts", () => {
    expect(getAvailableAppointmentWindows(input)).toEqual([
      { startTime: "09:35", endTime: "10:30", slots: ["09:45"] },
      {
        startTime: "11:00",
        endTime: "13:00",
        slots: ["11:00", "11:15", "11:30", "11:45", "12:00", "12:15"],
      },
    ]);
  });

  it("excludes past slots and gaps too short for clinical time plus cleanup", () => {
    expect(
      getAvailableAppointmentWindows({
        ...input,
        now: new Date("2026-09-14T15:20:00Z"),
      }),
    ).toEqual([]);
    expect(
      getAvailableAppointmentWindows({ ...input, durationMinutes: 56 }),
    ).not.toContainEqual(expect.objectContaining({ startTime: "09:35" }));
  });

  it("handles a blocked day, a day off and overlapping occupancy", () => {
    expect(
      getAvailableAppointmentWindows({ ...input, availability: [] }),
    ).toEqual([]);
    expect(
      getAvailableAppointmentWindows({
        ...input,
        exceptionalBlocks: [
          { startsAt: "2026-09-13T03:00:00Z", endsAt: "2026-09-15T03:00:00Z" },
        ],
      }),
    ).toEqual([]);
    const windows = getAvailableAppointmentWindows({
      ...input,
      appointments: [
        ...input.appointments,
        {
          startsAt: "2026-09-14T12:15:00Z",
          durationMinutes: 45,
          cleanupMinutes: 5,
        },
      ],
    });
    expect(windows[0]).toMatchObject({ startTime: "11:00" });
  });
});
