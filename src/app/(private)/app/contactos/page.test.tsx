import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), listContacts: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/modules/contacts/repository", () => ({ listContacts: mocks.listContacts }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import ContactsPage from "./page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: "owner-id" } } }) } });
  mocks.listContacts.mockResolvedValue([]);
});

describe("directorio de contactos", () => {
  it("muestra filtros y estado vacío claro sin exponer otros usuarios", async () => {
    const page = await ContactsPage({ searchParams: Promise.resolve({ estado: "inactivos", tipo: "laboratorios", buscar: "Dental" }) });
    const markup = renderToStaticMarkup(page);
    expect(mocks.listContacts).toHaveBeenCalledWith("Dental", "laboratory", "inactive", "owner-id");
    expect(markup).toContain("No encontramos coincidencias");
    expect(markup).toContain("Probá con otro nombre o cambiá los filtros.");
    expect(markup).not.toContain("Podés agregar el primero");
    expect(markup).toContain("Laboratorios");
    expect(markup).toContain("Limpiar filtros");
  });

  it("muestra datos esenciales y permite desplegar detalles sin salir del directorio", async () => {
    mocks.listContacts.mockResolvedValue([{ id: "00000000-0000-4000-8000-000000000010", name: "Dental Sur", type: "both", specialty: "Prótesis", phone: "123456", hours: "Lunes a viernes", email: "demo@example.com", address: null, contactName: null, notes: null, isActive: true }]);
    const page = await ContactsPage({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(page);
    expect(markup).toContain("Dental Sur");
    expect(markup).toContain("Proveedor y laboratorio");
    expect(markup).toContain("123456");
    expect(markup).toContain("Lunes a viernes");
    expect(markup).toContain("Más datos");
    expect(markup).toContain("demo@example.com");
    expect(markup).toContain("editar=00000000-0000-4000-8000-000000000010#editar-contacto-00000000-0000-4000-8000-000000000010");
    expect(markup).not.toContain("Desactivar contacto");
    expect(markup).not.toContain("/app/contactos/00000000-0000-4000-8000-000000000010");
  });

  it("abre el editor en la misma pantalla y conserva el contexto al cancelar", async () => {
    mocks.listContacts.mockResolvedValue([{ id: "00000000-0000-4000-8000-000000000010", name: "Dental Sur", type: "supplier", specialty: null, phone: null, hours: null, email: null, address: null, contactName: null, notes: null, isActive: true }]);
    const page = await ContactsPage({ searchParams: Promise.resolve({ buscar: "Dental", tipo: "proveedores", editar: "00000000-0000-4000-8000-000000000010" }) });
    const markup = renderToStaticMarkup(page);
    expect(markup).toContain("Editar contacto");
    expect(markup).toContain("Opciones");
    expect(markup.indexOf("Opciones")).toBeLessThan(markup.indexOf("Guardar cambios"));
    expect(markup).toContain("Desactivar contacto");
    expect(markup).toContain("<dialog");
    expect(markup).toContain("¿Desactivar contacto?");
    expect(markup).toContain("Cancelar");
    expect(markup).toContain('id="editar-contacto-00000000-0000-4000-8000-000000000010"');
    expect(markup).toContain("/app/contactos?tipo=proveedores&amp;buscar=Dental#contacto-00000000-0000-4000-8000-000000000010");
  });

  it("muestra reactivar sólo al editar un contacto inactivo", async () => {
    mocks.listContacts.mockResolvedValue([{ id: "00000000-0000-4000-8000-000000000010", name: "Dental Sur", type: "supplier", specialty: null, phone: null, hours: null, email: null, address: null, contactName: null, notes: null, isActive: false }]);
    const page = await ContactsPage({ searchParams: Promise.resolve({ estado: "inactivos", editar: "00000000-0000-4000-8000-000000000010" }) });
    const markup = renderToStaticMarkup(page);
    expect(markup).toContain("Opciones");
    expect(markup).toContain("Reactivar contacto");
    expect(markup).toContain("¿Reactivar contacto?");
  });
});
