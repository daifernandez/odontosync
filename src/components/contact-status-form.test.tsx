import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
const directory = { search: "", type: "all", status: "active" } as const;

describe("acción secundaria de estado", () => {
  it.each([
    [true, "Desactivar contacto", "¿Desactivar contacto?", "sin perder sus datos"],
    [false, "Reactivar contacto", "¿Reactivar contacto?", "Volverá a aparecer"],
  ])("ofrece el cambio de estado %s desde Opciones con confirmación", (isActive, label, confirmation, consequence) => {
    const markup = renderToStaticMarkup(<ContactStatusForm contact={{ ...contact, isActive }} directory={directory} />);
    expect(markup).toContain("<details");
    expect(markup).toContain("Opciones");
    expect(markup).toContain(label);
    expect(markup).toContain("<dialog");
    expect(markup).toContain(confirmation);
    expect(markup).toContain(consequence);
    expect(markup).toContain("Cancelar");
  });
});
