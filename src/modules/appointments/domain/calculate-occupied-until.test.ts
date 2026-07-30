import { describe, expect, it } from "vitest";

import { calculateOccupiedUntil } from "./calculate-occupied-until";

describe("calculateOccupiedUntil", () => {
  it("adds the appointment duration and turnover time", () => {
    const startsAt = new Date("2026-07-30T13:00:00.000Z");

    const occupiedUntil = calculateOccupiedUntil({
      startsAt,
      durationMinutes: 30,
      turnoverMinutes: 5,
    });

    expect(occupiedUntil).toEqual(new Date("2026-07-30T13:35:00.000Z"));
    expect(startsAt).toEqual(new Date("2026-07-30T13:00:00.000Z"));
  });

  it.each([
    { durationMinutes: 0, turnoverMinutes: 5 },
    { durationMinutes: 30, turnoverMinutes: -1 },
    { durationMinutes: 30.5, turnoverMinutes: 5 },
  ])("rejects invalid minute values: %o", (input) => {
    expect(() =>
      calculateOccupiedUntil({
        startsAt: new Date("2026-07-30T13:00:00.000Z"),
        ...input,
      }),
    ).toThrow(RangeError);
  });
});
