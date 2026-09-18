import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T,>(callback: T) => callback };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
    })),
  })),
}));

import { getProfileAvatarPath } from "./repository";

describe("getProfileAvatarPath", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the app usable before the avatar migration is applied", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: "42703", message: "column avatar_path does not exist" },
    });

    await expect(getProfileAvatarPath()).resolves.toBeNull();
  });

  it("returns the stored path after the migration is available", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { avatar_path: "user-id/avatar.png" },
      error: null,
    });

    await expect(getProfileAvatarPath()).resolves.toBe(
      "user-id/avatar.png",
    );
  });
});
