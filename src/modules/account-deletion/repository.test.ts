import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  remove: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: { from: () => ({ list: mocks.list, remove: mocks.remove }) },
    auth: { admin: { deleteUser: mocks.deleteUser } },
  })),
}));

import { deleteAuthUser, removeAccountAvatars } from "./repository";

describe("account deletion repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
    mocks.list.mockResolvedValue({ data: [], error: null });
    mocks.remove.mockResolvedValue({ data: [], error: null });
    mocks.deleteUser.mockResolvedValue({ error: null });
  });

  it("removes every avatar under the user's folder before deleting Auth", async () => {
    mocks.list.mockResolvedValueOnce({
      data: [{ name: "first.png" }, { name: "second.webp" }], error: null,
    });
    await removeAccountAvatars("user-1");
    await deleteAuthUser("user-1");
    expect(mocks.list).toHaveBeenCalledWith("user-1", expect.objectContaining({ limit: 100, offset: 0 }));
    expect(mocks.remove).toHaveBeenCalledWith(["user-1/first.png", "user-1/second.webp"]);
    expect(mocks.remove.mock.invocationCallOrder[0]).toBeLessThan(mocks.deleteUser.mock.invocationCallOrder[0]);
  });

  it("stops before Auth deletion when Storage fails", async () => {
    mocks.list.mockResolvedValueOnce({ data: null, error: new Error("unavailable") });
    await expect(removeAccountAvatars("user-1")).rejects.toThrow();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("stops when removing an avatar fails", async () => {
    mocks.list.mockResolvedValueOnce({ data: [{ name: "avatar.png" }], error: null });
    mocks.remove.mockResolvedValueOnce({ data: null, error: new Error("unavailable") });
    await expect(removeAccountAvatars("user-1")).rejects.toThrow();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("reads subsequent pages of avatar files", async () => {
    mocks.list
      .mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, index) => ({ name: `${index}.png` })), error: null })
      .mockResolvedValueOnce({ data: [{ name: "last.png" }], error: null });
    await removeAccountAvatars("user-1");
    expect(mocks.list).toHaveBeenLastCalledWith("user-1", expect.objectContaining({ offset: 100 }));
    expect(mocks.remove).toHaveBeenCalledTimes(2);
    expect(mocks.remove).toHaveBeenLastCalledWith(["user-1/last.png"]);
  });
});
