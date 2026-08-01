import { describe, expect, it } from "vitest";

import {
  normalizePatientSearch,
  patientFormState,
  validatePatient,
} from "./patient";

describe("validatePatient", () => {
  it("provides a serializable initial form state", () => {
    expect(patientFormState).toEqual({ status: "idle", fieldErrors: {} });
  });

  it("normalizes a valid administrative patient", () => {
    expect(
      validatePatient({
        firstName: "  Ana   María ",
        lastName: "  Pérez ",
        phone: "  11 5555-1234 ",
        email: "  ANA.PEREZ@EXAMPLE.COM ",
      }),
    ).toEqual({
      success: true,
      data: {
        firstName: "Ana María",
        lastName: "Pérez",
        phone: "11 5555-1234",
        email: "ana.perez@example.com",
      },
    });
  });

  it("normalizes blank optional contact values to null", () => {
    expect(
      validatePatient({
        firstName: "Ana",
        lastName: "Pérez",
        phone: " ",
        email: "",
      }),
    ).toMatchObject({
      success: true,
      data: { phone: null, email: null },
    });
  });

  it("requires names and enforces field length limits", () => {
    expect(
      validatePatient({
        firstName: " ",
        lastName: "a".repeat(81),
        phone: "1".repeat(31),
        email: "a".repeat(250) + "@example.com",
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        firstName: "Ingresá un nombre de hasta 80 caracteres.",
        lastName: "Ingresá un apellido de hasta 80 caracteres.",
        phone: "El teléfono admite hasta 30 caracteres.",
        email: "El correo electrónico admite hasta 254 caracteres.",
      },
    });
  });

  it("rejects an invalid optional email", () => {
    expect(
      validatePatient({
        firstName: "Ana",
        lastName: "Pérez",
        phone: "",
        email: "ana.example.com",
      }),
    ).toEqual({
      success: false,
      fieldErrors: { email: "Ingresá un correo electrónico válido." },
    });
  });
});

describe("normalizePatientSearch", () => {
  it("keeps name characters and removes PostgREST filter controls", () => {
    expect(normalizePatientSearch("  O'Connor, Pérez.%()  ")).toBe(
      "O'Connor Pérez",
    );
  });

  it("limits the search term length", () => {
    expect(normalizePatientSearch("a".repeat(100))).toHaveLength(80);
  });
});
