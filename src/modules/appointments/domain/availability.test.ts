import { describe, expect, it } from "vitest";

import {
  getAvailableAppointmentSlots,
  isAppointmentWithinWeeklyAvailability,
} from "./availability";

const availability = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" },
];
const now = new Date("2026-08-10T12:20:00.000Z");

describe("getAvailableAppointmentSlots", () => {
  it("builds future slots aligned to the configured grid", () => {
    expect(
      getAvailableAppointmentSlots({
        date: "2026-08-10",
        availability,
        appointments: [],
        durationMinutes: 30,
        cleanupMinutes: 15,
        gridIntervalMinutes: 15,
        now,
      }),
    ).toEqual(["09:30", "09:45", "10:00", "10:15"]);
  });

  it("removes every slot that overlaps an occupied appointment", () => {
    expect(
      getAvailableAppointmentSlots({
        date: "2026-08-17",
        availability,
        appointments: [
          {
            startsAt: "2026-08-17T12:30:00.000Z",
            durationMinutes: 30,
            cleanupMinutes: 15,
          },
        ],
        durationMinutes: 30,
        cleanupMinutes: 15,
        gridIntervalMinutes: 15,
        now,
      }),
    ).toEqual(["10:15"]);
  });

  it("returns no slots on a day without configured attention", () => {
    expect(
      getAvailableAppointmentSlots({
        date: "2026-08-18",
        availability,
        appointments: [],
        durationMinutes: 30,
        cleanupMinutes: 15,
        gridIntervalMinutes: 15,
        now,
      }),
    ).toEqual([]);
  });
});

describe("isAppointmentWithinWeeklyAvailability", () => {
  it("accepts an aligned appointment that fits completely", () => {
    expect(
      isAppointmentWithinWeeklyAvailability(
        {
          startsAt: "2026-08-17T12:15:00.000Z",
          durationMinutes: 30,
          cleanupMinutes: 15,
        },
        availability,
        15,
      ),
    ).toBe(true);
  });

  it("rejects appointments outside the grid, block, or configured days", () => {
    expect(
      isAppointmentWithinWeeklyAvailability(
        {
          startsAt: "2026-08-17T12:10:00.000Z",
          durationMinutes: 30,
          cleanupMinutes: 15,
        },
        availability,
        15,
      ),
    ).toBe(false);

    expect(
      isAppointmentWithinWeeklyAvailability(
        {
          startsAt: "2026-08-17T13:30:00.000Z",
          durationMinutes: 30,
          cleanupMinutes: 15,
        },
        availability,
        15,
      ),
    ).toBe(false);

    expect(
      isAppointmentWithinWeeklyAvailability(
        {
          startsAt: "2026-08-18T12:15:00.000Z",
          durationMinutes: 30,
          cleanupMinutes: 15,
        },
        availability,
        15,
      ),
    ).toBe(false);
  });
});
