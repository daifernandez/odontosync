import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import HomePage from "./page";

describe("authenticated home", () => {
  it("opens the daily agenda instead of rendering a duplicate dashboard", async () => {
    await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/app/agenda?vista=dia");
  });
});
