import { describe, expect, it } from "vitest";

import {
  normalizePatientSearch,
  normalizePatientStatus,
  patientFormState,
  validatePatientId,
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

describe("validatePatientId", () => {
  it("accepts a UUID patient identifier", () => {
    expect(validatePatientId("f49d2f79-e3a1-4bb5-9554-75877735c17f")).toBe(
      "f49d2f79-e3a1-4bb5-9554-75877735c17f",
    );
  });

  it("rejects malformed patient identifiers", () => {
    expect(validatePatientId("not-a-patient-id")).toBeNull();
  });
});

describe("normalizePatientStatus", () => {
  it("shows active patients by default", () => {
    expect(normalizePatientStatus(undefined)).toBe("active");
    expect(normalizePatientStatus("unknown")).toBe("active");
  });

  it("recognizes the inactive patient filter", () => {
    expect(normalizePatientStatus("inactivos")).toBe("inactive");
  });
});
