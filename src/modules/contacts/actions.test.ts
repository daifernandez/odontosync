import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(), createContact: vi.fn(), updateContact: vi.fn(),
  setContactActive: vi.fn(), redirect: vi.fn(), revalidatePath: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("./repository", () => ({
  createContact: mocks.createContact, updateContact: mocks.updateContact,
  setContactActive: mocks.setContactActive,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createContactAction, setContactActiveAction, updateContactAction } from "./actions";
import { contactFormState } from "./domain/contact";

const id = "b82624c6-c8e7-4ef8-bb13-4fa4ad5cb8db";
function form() {
  const data = new FormData();
  data.set("name", "Dental Sur");
  data.set("type", "supplier");
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: "owner-id" } } }) } });
  mocks.updateContact.mockResolvedValue(true);
  mocks.setContactActive.mockResolvedValue(true);
});

describe("acciones de contactos", () => {
  it("rechaza entradas inválidas antes de escribir", async () => {
    const data = form();
    data.set("name", " ");
    const state = await createContactAction(contactFormState, data);
    expect(state.fieldErrors.name).toBeTruthy();
    expect(mocks.createContact).not.toHaveBeenCalled();
  });

  it("no escribe sin sesión", async () => {
    mocks.createClient.mockResolvedValue({ auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }) } });
    const state = await createContactAction(contactFormState, form());
    expect(state.message).toContain("sesión");
    expect(mocks.createContact).not.toHaveBeenCalled();
  });

  it("crea sólo para el propietario autenticado", async () => {
    await createContactAction(contactFormState, form());
    expect(mocks.createContact).toHaveBeenCalledWith(expect.objectContaining({ name: "Dental Sur", type: "supplier" }), "owner-id");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/contactos");
    expect(mocks.redirect).toHaveBeenCalledWith("/app/contactos?creado=1");
  });

  it("valida identificador y titularidad antes de editar o cambiar el estado", async () => {
    await updateContactAction("invalido", contactFormState, form());
    expect(mocks.updateContact).not.toHaveBeenCalled();
    await updateContactAction(id, contactFormState, form());
    expect(mocks.updateContact).toHaveBeenCalledWith(id, expect.any(Object), "owner-id");
    await setContactActiveAction(id, false, contactFormState, new FormData());
    expect(mocks.setContactActive).toHaveBeenCalledWith(id, false, "owner-id");
  });

  it("conserva búsqueda y filtros al crear y editar en el directorio", async () => {
    const data = form();
    data.set("buscar", "Dental");
    data.set("tipo", "laboratorios");
    data.set("estado", "inactivos");
    await createContactAction(contactFormState, data);
    expect(mocks.redirect).toHaveBeenCalledWith("/app/contactos?estado=inactivos&tipo=laboratorios&buscar=Dental&creado=1");
    await updateContactAction(id, contactFormState, data);
    expect(mocks.redirect).toHaveBeenCalledWith("/app/contactos?estado=inactivos&tipo=laboratorios&buscar=Dental&actualizado=1");
  });

  it("conserva búsqueda y tipo al cambiar de estado y muestra la lista correspondiente", async () => {
    const data = form();
    data.set("buscar", "Dental");
    data.set("tipo", "proveedores");
    await setContactActiveAction(id, false, contactFormState, data);
    expect(mocks.redirect).toHaveBeenCalledWith("/app/contactos?estado=inactivos&tipo=proveedores&buscar=Dental&desactivado=1");
    await setContactActiveAction(id, true, contactFormState, data);
    expect(mocks.redirect).toHaveBeenCalledWith("/app/contactos?tipo=proveedores&buscar=Dental&reactivado=1");
  });
});
