import { describe, expect, it } from "vitest";

import {
  buildContactDirectoryPath,
  contactFormState,
  normalizeContactSearch,
  normalizeContactStatus,
  normalizeContactTypeFilter,
  validateContact,
  validateContactId,
} from "./contact";

const validInput = {
  name: " Laboratorio   Norte ",
  type: "laboratory",
  contactName: " Ana   López ",
  phone: " 11 5555-1234 ",
  email: " INFO@EXAMPLE.COM ",
  address: " Calle 123 ",
  hours: " Lun a vie, 9 a 18 ",
  specialty: " Prótesis ",
  notes: " Entrega los jueves ",
};

describe("validateContact", () => {
  it("normalizes a fictitious contact and keeps a serializable form state", () => {
    expect(contactFormState).toEqual({ status: "idle", fieldErrors: {} });
    expect(validateContact(validInput)).toEqual({
      success: true,
      data: {
        name: "Laboratorio Norte",
        type: "laboratory",
        contactName: "Ana López",
        phone: "11 5555-1234",
        email: "info@example.com",
        address: "Calle 123",
        hours: "Lun a vie, 9 a 18",
        specialty: "Prótesis",
        notes: "Entrega los jueves",
      },
    });
  });

  it("accepts both types and blank optional fields", () => {
    expect(
      validateContact({
        ...validInput,
        type: "both",
        contactName: " ",
        phone: "",
        email: "",
        address: " ",
        hours: "",
        specialty: "",
        notes: "",
      }),
    ).toMatchObject({
      success: true,
      data: {
        type: "both",
        contactName: null,
        phone: null,
        email: null,
        address: null,
        hours: null,
        specialty: null,
        notes: null,
      },
    });
  });

  it("requires a name and supported type", () => {
    expect(validateContact({ ...validInput, name: " ", type: "clinic" })).toEqual({
      success: false,
      fieldErrors: {
        name: "Ingresá un nombre de hasta 120 caracteres.",
        type: "Elegí proveedor, laboratorio o ambos.",
      },
    });
  });

  it("rejects invalid contact fields and excessive lengths", () => {
    expect(
      validateContact({
        ...validInput,
        contactName: "a".repeat(121),
        phone: "1".repeat(31),
        email: "sin-arroba",
        address: "a".repeat(201),
        hours: "a".repeat(201),
        specialty: "a".repeat(121),
        notes: "a".repeat(1001),
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        contactName: "La persona de contacto admite hasta 120 caracteres.",
        phone: "El teléfono admite hasta 30 caracteres.",
        email: "Ingresá un correo electrónico válido.",
        address: "La dirección admite hasta 200 caracteres.",
        hours: "Los horarios admiten hasta 200 caracteres.",
        specialty: "El rubro o especialidad admite hasta 120 caracteres.",
        notes: "Las notas admiten hasta 1000 caracteres.",
      },
    });
  });
});

describe("directory helpers", () => {
  it("removes PostgREST filter controls from a bounded search", () => {
    expect(normalizeContactSearch("  O'Connor, Dental.%()  ")).toBe(
      "O'Connor Dental",
    );
    expect(normalizeContactSearch("a".repeat(120))).toHaveLength(80);
  });

  it("normalizes type and status filters", () => {
    expect(normalizeContactTypeFilter("laboratorios")).toBe("laboratory");
    expect(normalizeContactTypeFilter("proveedores")).toBe("supplier");
    expect(normalizeContactTypeFilter("bad")).toBe("all");
    expect(normalizeContactStatus("inactivos")).toBe("inactive");
    expect(normalizeContactStatus("bad")).toBe("active");
  });

  it("builds a recargable path retaining the filters", () => {
    expect(
      buildContactDirectoryPath({
        search: "Dental Sur",
        type: "laboratory",
        status: "inactive",
      }),
    ).toBe("/app/contactos?estado=inactivos&tipo=laboratorios&buscar=Dental+Sur");
  });

  it("rejects malformed resource identifiers", () => {
    expect(validateContactId("not-a-uuid")).toBeNull();
    expect(validateContactId("f49d2f79-e3a1-4bb5-9554-75877735c17f")).toBe(
      "f49d2f79-e3a1-4bb5-9554-75877735c17f",
    );
  });
});
