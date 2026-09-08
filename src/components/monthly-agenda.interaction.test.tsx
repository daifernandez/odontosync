// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { buildAgendaMonth } from "@/modules/agenda/domain/weekly-schedule";

import { MonthlyAgenda } from "./monthly-agenda";

afterEach(cleanup);

describe("monthly agenda actions", () => {
  it("keeps actions in place and updates them for the selected day", () => {
    render(
      <MonthlyAgenda
        appointments={[]}
        currentTime={new Date("2026-08-22T15:00:00.000Z")}
        exceptionalBlocks={[]}
        month={buildAgendaMonth("2026-08-22")}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /martes, 25 de agosto de 2026/i,
      }),
    );

    expect(
      screen.getByRole("link", { name: "Nuevo turno" }).getAttribute("href"),
    ).toContain("fecha=2026-08-25");

    fireEvent.click(
      screen.getByRole("button", {
        name: /lunes, 10 de agosto de 2026/i,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Nuevo turno" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Bloquear horario" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
