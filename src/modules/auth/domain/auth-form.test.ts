import { describe, expect, it } from "vitest";

import { validateLogin, validateRegistration } from "./auth-form";

describe("validateLogin", () => {
  it("normalizes a valid email and preserves the password", () => {
    const result = validateLogin({
      email: "  DAI@Example.com ",
      password: "mi-clave",
    });

    expect(result).toEqual({
      success: true,
      data: {
        email: "dai@example.com",
        password: "mi-clave",
      },
    });
  });

  it("reports invalid credentials by field", () => {
    const result = validateLogin({
      email: "correo-invalido",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        email: "Ingresá un correo electrónico válido.",
        password: "Ingresá tu contraseña.",
      },
    });
  });
});

describe("validateRegistration", () => {
  it("normalizes a valid registration", () => {
    const result = validateRegistration({
      fullName: "  Daiana   Fernández ",
      email: " DAI@Example.com ",
      password: "clave-segura",
      academicUseAccepted: true,
    });

    expect(result).toEqual({
      success: true,
      data: {
        fullName: "Daiana Fernández",
        email: "dai@example.com",
        password: "clave-segura",
        academicUseAccepted: true,
      },
    });
  });

  it("requires the academic-use agreement", () => {
    const result = validateRegistration({
      fullName: "Daiana Fernández",
      email: "dai@example.com",
      password: "clave-segura",
      academicUseAccepted: false,
    });

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        academicUse:
          "Necesitamos que aceptes el alcance académico para continuar.",
      },
    });
  });

  it.each([
    {
      name: "short full name",
      input: {
        fullName: "D",
        email: "dai@example.com",
        password: "clave-segura",
        academicUseAccepted: true,
      },
      expectedField: "fullName",
    },
    {
      name: "invalid email",
      input: {
        fullName: "Daiana Fernández",
        email: "correo-invalido",
        password: "clave-segura",
        academicUseAccepted: true,
      },
      expectedField: "email",
    },
    {
      name: "short password",
      input: {
        fullName: "Daiana Fernández",
        email: "dai@example.com",
        password: "1234567",
        academicUseAccepted: true,
      },
      expectedField: "password",
    },
  ])("rejects $name", ({ input, expectedField }) => {
    const result = validateRegistration(input);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors).toHaveProperty(expectedField);
    }
  });
});
