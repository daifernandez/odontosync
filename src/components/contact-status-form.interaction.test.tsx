// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/contacts/actions", () => ({
  createContactAction: vi.fn(),
  updateContactAction: vi.fn(),
  setContactActiveAction: vi.fn(),
}));

import { ContactStatusForm } from "./contact-form";
import type { Contact } from "@/modules/contacts/domain/contact";

const contact: Contact = {
  id: "099a5900-e665-4a81-9fa9-e039d268bca8",
  name: "Laboratorio ficticio",
  type: "laboratory",
  contactName: null,
  phone: null,
  email: null,
  address: null,
  hours: null,
  specialty: null,
  notes: null,
  isActive: true,
};

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
});
afterEach(cleanup);

describe("menú de estado del contacto", () => {
  it("requiere abrir Opciones y confirmar antes de desactivar", () => {
    render(<ContactStatusForm contact={contact} directory={{ search: "", type: "all", status: "active" }} />);
    const menu = screen.getByText("Opciones").closest("details")!;
    const dialog = screen.getByText("¿Desactivar contacto?").closest("dialog")!;

    expect(menu.open).toBe(false);
    expect(dialog.open).toBe(false);
    fireEvent.click(screen.getByText("Opciones"));
    expect(menu.open).toBe(true);
    fireEvent.click(within(menu).getByRole("button", { name: "Desactivar contacto" }));
    expect(menu.open).toBe(false);
    expect(dialog.open).toBe(true);
    expect(within(dialog).getByText(/sin perder sus datos/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(screen.getByText("Opciones"));
  });
});
