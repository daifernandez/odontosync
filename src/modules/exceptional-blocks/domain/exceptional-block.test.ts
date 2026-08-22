import { describe, expect, it } from "vitest";

import {
  validateExceptionalBlock,
  validateExceptionalBlockId,
} from "./exceptional-block";

const now = new Date("2099-08-10T14:00:00.000Z");

describe("validateExceptionalBlock", () => {
  it("accepts an ongoing block and normalizes Argentina local time", () => {
    expect(
      validateExceptionalBlock(
        {
          startsAt: "2099-08-10T09:00",
          endsAt: "2099-08-10T12:00",
          category: "vacation",
        },
        now,
      ),
    ).toEqual({
      success: true,
      data: {
        startsAt: "2099-08-10T12:00:00.000Z",
        endsAt: "2099-08-10T15:00:00.000Z",
        category: "vacation",
      },
    });
  });

  it("rejects invalid dates, ranges, categories, and finished blocks", () => {
    expect(
      validateExceptionalBlock(
        {
          startsAt: "2099-02-30T09:00",
          endsAt: "2099-08-10T12:00",
          category: "custom",
        },
        now,
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        startsAt: "Elegí una fecha y hora de inicio válidas.",
        category: "Elegí un tipo de bloqueo válido.",
      },
    });

    expect(
      validateExceptionalBlock(
        {
          startsAt: "2099-08-10T11:00",
          endsAt: "2099-08-10T10:00",
          category: "holiday",
        },
        now,
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        endsAt: "El final debe ser posterior al inicio.",
      },
    });

    expect(
      validateExceptionalBlock(
        {
          startsAt: "2099-08-10T09:00",
          endsAt: "2099-08-10T10:00",
          category: "personal",
        },
        now,
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        endsAt: "El bloqueo ya finalizó. Elegí otro período.",
      },
    });
  });
});

describe("validateExceptionalBlockId", () => {
  it("normalizes valid UUIDs and rejects arbitrary values", () => {
    expect(
      validateExceptionalBlockId("00000000-0000-4000-8000-0000000000AA"),
    ).toBe("00000000-0000-4000-8000-0000000000aa");
    expect(validateExceptionalBlockId("not-an-id")).toBeNull();
  });
});
