/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/initial-configuration/actions", () => ({
  saveAvailabilityAction: vi.fn(),
}));

import { WeeklyAvailabilityForm } from "./weekly-availability-form";

afterEach(cleanup);

describe("WeeklyAvailabilityForm", () => {
  it("summarizes active and inactive days before editing", () => {
    render(
      <WeeklyAvailabilityForm
        initialAvailability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
          { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
        ]}
      />,
    );

    expect(
      within(screen.getByRole("group", { name: "Lunes" })).getByRole("button", {
        name: "Editar horarios de Lunes",
      }).textContent,
    ).toContain("09:00–13:00 · 14:00–18:00");
    expect(
      within(screen.getByRole("group", { name: "Domingo" })).getByText(
        "No atiendo",
      ),
    ).toBeTruthy();
    expect(
      within(screen.getByRole("group", { name: "Lunes" })).getByText(
        "Copiar estos horarios",
      ),
    ).toBeTruthy();
  });

  it("activates a day and adds a sensible default block", () => {
    render(<WeeklyAvailabilityForm initialAvailability={[]} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Atiendo los lunes" }));

    const monday = screen.getByRole("group", { name: "Lunes" });
    expect(within(monday).getByDisplayValue("09:00")).toBeTruthy();
    expect(within(monday).getByDisplayValue("13:00")).toBeTruthy();
  });

  it("copies one day's blocks to another day", () => {
    render(
      <WeeklyAvailabilityForm
        initialAvailability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        ]}
      />,
    );

    const monday = screen.getByRole("group", { name: "Lunes" });
    fireEvent.click(within(monday).getByRole("button", {name:"Editar horarios de Lunes"}));
    fireEvent.click(within(monday).getByText("Copiar estos horarios"));
    fireEvent.change(within(monday).getByLabelText("Copiar horarios de Lunes a"), {
      target: { value: "2" },
    });
    fireEvent.click(within(monday).getByRole("button", { name: "Copiar" }));

    const tuesday = screen.getByRole("group", { name: "Martes" });
    expect(
      (within(tuesday).getByRole("checkbox", {
        name: "Atiendo los martes",
      }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(within(tuesday).getByDisplayValue("09:00")).toBeTruthy();
    expect(within(tuesday).getByDisplayValue("13:00")).toBeTruthy();
  });

  it("shows an overlap before submitting", () => {
    render(
      <WeeklyAvailabilityForm
        initialAvailability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
          { dayOfWeek: 1, startTime: "12:00", endTime: "18:00" },
        ]}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Los horarios del lunes se superponen",
    );
    expect(
      (screen.getByRole("button", {
        name: "Guardar horarios",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

it("explains why an empty week cannot be saved", () => {
  render(<WeeklyAvailabilityForm initialAvailability={[{dayOfWeek:1,startTime:"09:00",endTime:"13:00"}]} />);
  fireEvent.click(screen.getByRole("checkbox", {name:"Atiendo los lunes"}));
  expect(screen.getByText("Agregá al menos un bloque de atención para guardar." )).toBeTruthy();
});
it("warns before replacing a day and offers undo", () => {
  render(<WeeklyAvailabilityForm initialAvailability={[{dayOfWeek:1,startTime:"09:00",endTime:"13:00"},{dayOfWeek:2,startTime:"10:00",endTime:"12:00"}]} />);
  const monday = screen.getByRole("group", {name:"Lunes"});
  fireEvent.click(within(monday).getByRole("button", {name:"Editar horarios de Lunes"}));
  fireEvent.click(within(monday).getByText("Copiar estos horarios"));
  expect(within(monday).getByText("Se reemplazarán los horarios de Martes.")).toBeTruthy();
  fireEvent.click(within(monday).getByRole("button", {name:"Reemplazar"}));
  expect(screen.getByText("Horarios copiados de Lunes a Martes.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Deshacer copia"}));
  expect(screen.getByText("10:00–12:00")).toBeTruthy();
});
