import { describe, expect, it } from "vitest";

import {
  getExceptionalBlockSegmentForDate,
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
        exceptionalBlocks: [],
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
        exceptionalBlocks: [],
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
        exceptionalBlocks: [],
        durationMinutes: 30,
        cleanupMinutes: 15,
        gridIntervalMinutes: 15,
        now,
      }),
    ).toEqual([]);
  });

  it("removes every slot that intersects an exceptional block", () => {
    expect(
      getAvailableAppointmentSlots({
        date: "2026-08-17",
        availability,
        appointments: [],
        exceptionalBlocks: [
          {
            startsAt: "2026-08-17T13:00:00.000Z",
            endsAt: "2026-08-17T13:45:00.000Z",
          },
        ],
        durationMinutes: 30,
        cleanupMinutes: 15,
        gridIntervalMinutes: 15,
        now,
      }),
    ).toEqual(["09:00", "09:15"]);
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
        [],
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
        [],
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
        [],
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
        [],
      ),
    ).toBe(false);
  });

  it("rejects an otherwise valid appointment inside an exceptional block", () => {
    expect(
      isAppointmentWithinWeeklyAvailability(
        {
          startsAt: "2026-08-17T12:15:00.000Z",
          durationMinutes: 30,
          cleanupMinutes: 15,
        },
        availability,
        15,
        [
          {
            startsAt: "2026-08-17T12:30:00.000Z",
            endsAt: "2026-08-17T13:00:00.000Z",
          },
        ],
      ),
    ).toBe(false);
  });
});

describe("getExceptionalBlockSegmentForDate", () => {
  it("clips a multi-day block to each Argentina calendar day", () => {
    const block = {
      startsAt: "2026-08-17T13:30:00.000Z",
      endsAt: "2026-08-18T13:15:00.000Z",
    };

    expect(getExceptionalBlockSegmentForDate(block, "2026-08-17")).toEqual({
      startMinutes: 630,
      endMinutes: 1440,
    });
    expect(getExceptionalBlockSegmentForDate(block, "2026-08-18")).toEqual({
      startMinutes: 0,
      endMinutes: 615,
    });
    expect(getExceptionalBlockSegmentForDate(block, "2026-08-19")).toBeNull();
  });
});
