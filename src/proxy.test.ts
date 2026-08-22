import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "@/lib/supabase/proxy";

import { proxy } from "./proxy";

vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));

const updateSessionMock = vi.mocked(updateSession);

describe("proxy demo access", () => {
  beforeEach(() => {
    updateSessionMock.mockClear();
  });

  it.each(["/demo", "/demo/agenda", "/demo/pacientes"])(
    "returns not found for %s outside localhost",
    async (pathname) => {
      const response = await proxy(
        new NextRequest(`http://127.0.0.1:3000${pathname}`, {
          headers: { host: "odontosync.example" },
        }),
      );

      expect(response.status).toBe(404);
      expect(updateSessionMock).not.toHaveBeenCalled();
    },
  );

  it.each(["localhost", "127.0.0.1"])(
    "keeps the demo available on %s",
    async (hostname) => {
      const request = new NextRequest("http://127.0.0.1:3000/demo", {
        headers: { host: `${hostname}:3000` },
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(updateSessionMock).toHaveBeenCalledWith(request);
    },
  );

  it("does not change non-demo routes on deployed hosts", async () => {
    const request = new NextRequest("https://odontosync.example/app");

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(updateSessionMock).toHaveBeenCalledWith(request);
  });
});
