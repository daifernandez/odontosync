export type AuthFieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  academicUse?: string;
};

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors: AuthFieldErrors;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegistrationInput = LoginInput & {
  fullName: string;
  academicUseAccepted: boolean;
};

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: AuthFieldErrors };

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  fieldErrors: {},
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

function normalizeLoginInput(input: LoginInput) {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

export function validateLogin(
  input: LoginInput,
): ValidationResult<LoginInput> {
  const data = normalizeLoginInput(input);
  const fieldErrors: AuthFieldErrors = {};

  if (!emailPattern.test(data.email)) {
    fieldErrors.email = "Ingresá un correo electrónico válido.";
  }

  if (!data.password) {
    fieldErrors.password = "Ingresá tu contraseña.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return { success: true, data };
}

export function validateRegistration(
  input: RegistrationInput,
): ValidationResult<RegistrationInput> {
  const loginResult = validateLogin(input);
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const fieldErrors: AuthFieldErrors = loginResult.success
    ? {}
    : { ...loginResult.fieldErrors };

  if (fullName.length < 3) {
    fieldErrors.fullName = "Ingresá tu nombre completo.";
  }

  if (!strongPasswordPattern.test(input.password)) {
    fieldErrors.password =
      "Usá al menos 12 caracteres e incluí mayúscula, minúscula, número y símbolo.";
  }

  if (!input.academicUseAccepted) {
    fieldErrors.academicUse =
      "Necesitamos que aceptes el alcance académico para continuar.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      fullName,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      academicUseAccepted: true,
    },
  };
}
