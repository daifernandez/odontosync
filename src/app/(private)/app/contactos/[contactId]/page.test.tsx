import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), getContact: vi.fn(), notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }), redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/modules/contacts/repository", () => ({ getContact: mocks.getContact }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound, redirect: mocks.redirect }));

import ContactPage from "./page";

const id = "00000000-0000-4000-8000-000000000010";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: "owner-id" } } }) } });
  mocks.getContact.mockResolvedValue({ id, name: "Dental Sur", type: "both", contactName: "María", phone: "11 1234", email: null, address: "Calle 1", hours: "Lunes a viernes", specialty: "Prótesis", notes: null, isActive: true });
});

describe("acceso anterior a la ficha de contacto", () => {
  it("redirige al editor en la agenda sin perder el control de propiedad", async () => {
    await ContactPage({ params: Promise.resolve({ contactId: id }) });
    expect(mocks.getContact).toHaveBeenCalledWith(id, "owner-id");
    expect(mocks.redirect).toHaveBeenCalledWith(`/app/contactos?editar=${id}`);
  });

  it("oculta identificadores inválidos o ajenos", async () => {
    await expect(ContactPage({ params: Promise.resolve({ contactId: "mal" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.getContact).not.toHaveBeenCalled();
    mocks.getContact.mockResolvedValue(null);
    await expect(ContactPage({ params: Promise.resolve({ contactId: id }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
