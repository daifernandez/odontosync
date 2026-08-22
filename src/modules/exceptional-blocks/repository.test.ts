import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  createExceptionalBlock,
  deleteExceptionalBlock,
  listExceptionalBlocks,
} from "./repository";

describe("exceptional block repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists unfinished blocks in chronological order", async () => {
    const query = {
      select: vi.fn(),
      gt: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "block-id",
            starts_at: "2099-08-10T12:00:00.000Z",
            ends_at: "2099-08-10T15:00:00.000Z",
            category: "vacation",
          },
        ],
        error: null,
      }),
    };
    query.select.mockReturnValue(query);
    query.gt.mockReturnValue(query);
    query.order.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(
      listExceptionalBlocks(new Date("2099-08-10T14:00:00.000Z")),
    ).resolves.toEqual([
      {
        id: "block-id",
        startsAt: "2099-08-10T12:00:00.000Z",
        endsAt: "2099-08-10T15:00:00.000Z",
        category: "vacation",
      },
    ]);
    expect(query.gt).toHaveBeenCalledWith(
      "ends_at",
      "2099-08-10T14:00:00.000Z",
    );
    expect(query.order).toHaveBeenCalledWith("starts_at");
  });

  it("creates a block using only the authenticated owner and fixed fields", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert }),
    });

    await expect(
      createExceptionalBlock(
        {
          startsAt: "2099-08-10T12:00:00.000Z",
          endsAt: "2099-08-10T15:00:00.000Z",
          category: "holiday",
        },
        "owner-id",
      ),
    ).resolves.toBe("created");
    expect(insert).toHaveBeenCalledWith({
      user_id: "owner-id",
      starts_at: "2099-08-10T12:00:00.000Z",
      ends_at: "2099-08-10T15:00:00.000Z",
      category: "holiday",
    });
  });

  it.each([
    ["23P01", "conflict"],
    ["23514", "unavailable"],
    ["42501", "unavailable"],
  ] as const)("maps database rejection %s to %s", async (code, expected) => {
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code } }),
      }),
    });

    await expect(
      createExceptionalBlock(
        {
          startsAt: "2099-08-10T12:00:00.000Z",
          endsAt: "2099-08-10T15:00:00.000Z",
          category: "other",
        },
        "owner-id",
      ),
    ).resolves.toBe(expected);
  });

  it("deletes only a block visible to the current user", async () => {
    const query = {
      delete: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "block-id" },
        error: null,
      }),
    };
    query.delete.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.select.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(
      deleteExceptionalBlock("block-id", "owner-id"),
    ).resolves.toBe(true);
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "block-id");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "owner-id");
  });
});
