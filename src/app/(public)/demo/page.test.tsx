import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import DemoPage from "./page";

describe("demo home", () => {
  it("opens the agenda demo instead of rendering a duplicate dashboard", () => {
    expect(() => DemoPage()).toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/demo/agenda");
  });
});
