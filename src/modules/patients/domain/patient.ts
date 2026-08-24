export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

export type PatientInput = Pick<
  Patient,
  "firstName" | "lastName" | "phone" | "email"
>;

export type PatientStatus = "active" | "inactive";

export type PatientFieldErrors = Partial<
  Record<"firstName" | "lastName" | "phone" | "email", string>
>;

export type PatientFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: PatientFieldErrors;
};

export const patientFormState: PatientFormState = {
  status: "idle",
  fieldErrors: {},
};

type PatientFormInput = Record<keyof PatientInput, unknown>;

type ValidationResult =
  | { success: true; data: PatientInput }
  | { success: false; fieldErrors: PatientFieldErrors };

function normalizeText(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

export function validatePatient(input: PatientFormInput): ValidationResult {
  const firstName = normalizeText(input.firstName);
  const lastName = normalizeText(input.lastName);
  const phone = normalizeText(input.phone);
  const email = normalizeText(input.email).toLowerCase();
  const fieldErrors: PatientFieldErrors = {};

  if (firstName.length === 0 || firstName.length > 80) {
    fieldErrors.firstName = "Ingresá un nombre de hasta 80 caracteres.";
  }

  if (lastName.length === 0 || lastName.length > 80) {
    fieldErrors.lastName = "Ingresá un apellido de hasta 80 caracteres.";
  }

  if (phone.length > 30) {
    fieldErrors.phone = "El teléfono admite hasta 30 caracteres.";
  }

  if (email.length > 254) {
    fieldErrors.email =
      "El correo electrónico admite hasta 254 caracteres.";
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresá un correo electrónico válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
    },
  };
}

export function normalizePatientSearch(value: unknown) {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function validatePatientId(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return null;
  }

  return value.toLowerCase();
}

export function normalizePatientStatus(value: unknown): PatientStatus {
  return value === "inactivos" ? "inactive" : "active";
}

export function buildPatientDirectoryPath({
  search,
  status,
}: {
  search: string;
  status: PatientStatus;
}) {
  const params = new URLSearchParams();
  const normalizedSearch = search.trim();

  if (status === "inactive") {
    params.set("estado", "inactivos");
  }

  if (normalizedSearch) {
    params.set("buscar", normalizedSearch);
  }

  const query = params.toString();

  return query ? `/app/pacientes?${query}` : "/app/pacientes";
}
