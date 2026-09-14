import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { createContact, getContact, listContacts, setContactActive, updateContact } from "./repository";

beforeEach(() => mocks.createClient.mockReset());

function query() {
  const q = {
    select: vi.fn(), eq: vi.fn(), or: vi.fn(), ilike: vi.fn(), order: vi.fn(),
    insert: vi.fn(), update: vi.fn(), maybeSingle: vi.fn(),
  };
  for (const method of ["select", "eq", "or", "ilike", "order", "insert", "update"] as const) q[method].mockReturnValue(q);
  q.maybeSingle.mockResolvedValue({ data: { id: "contact-id" }, error: null });
  return q;
}

const input = {
  name: "Dental Sur", type: "both" as const, contactName: null, phone: null,
  email: null, address: null, hours: null, specialty: null, notes: null,
};

describe("directorio privado de contactos", () => {
  it("filtra búsqueda, estado y ambos tipos por el propietario", async () => {
    const q = query();
    q.order.mockResolvedValue({ data: [], error: null });
    mocks.createClient.mockResolvedValue({ from: vi.fn().mockReturnValue(q) });
    await listContacts("Dental", "laboratory", "active", "owner-id");
    expect(q.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(q.eq).toHaveBeenCalledWith("is_active", true);
    expect(q.or).toHaveBeenCalledWith("type.eq.laboratory,type.eq.both");
    expect(q.ilike).toHaveBeenCalledWith("name", "%Dental%");
  });

  it("limita la lectura de un registro al propietario", async () => {
    const q = query();
    mocks.createClient.mockResolvedValue({ from: vi.fn().mockReturnValue(q) });
    await getContact("contact-id", "owner-id");
    expect(q.eq).toHaveBeenCalledWith("id", "contact-id");
    expect(q.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });

  it("crea con el usuario de la sesión y no permite cambiar la titularidad al editar o desactivar", async () => {
    const q = query();
    mocks.createClient.mockResolvedValue({ from: vi.fn().mockReturnValue(q) });
    await createContact(input, "owner-id");
    expect(q.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "owner-id", name: "Dental Sur" }));
    await updateContact("contact-id", input, "owner-id");
    expect(q.update).toHaveBeenCalledWith(expect.not.objectContaining({ user_id: expect.anything() }));
    expect(q.eq).toHaveBeenCalledWith("user_id", "owner-id");
    await setContactActive("contact-id", false, "owner-id");
    expect(q.update).toHaveBeenCalledWith({ is_active: false });
  });
});
