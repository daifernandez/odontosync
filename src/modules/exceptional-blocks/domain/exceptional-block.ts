import { parseArgentinaDateTime } from "@/modules/appointments/domain/appointment";

export const exceptionalBlockCategories = [
  { value: "vacation", label: "Vacaciones" },
  { value: "holiday", label: "Feriado" },
  { value: "personal", label: "Asunto personal" },
  { value: "other", label: "Otro" },
] as const;

export type ExceptionalBlockCategory =
  (typeof exceptionalBlockCategories)[number]["value"];

export type ExceptionalBlock = {
  id: string;
  startsAt: string;
  endsAt: string;
  category: ExceptionalBlockCategory;
};

export type ExceptionalBlockInput = Omit<ExceptionalBlock, "id">;

export type ExceptionalBlockFieldErrors = Partial<
  Record<"startsAt" | "endsAt" | "category", string>
>;

export type ExceptionalBlockFormValues = Record<
  "startsAt" | "endsAt" | "category",
  string
>;

export type ExceptionalBlockFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: ExceptionalBlockFieldErrors;
  values?: ExceptionalBlockFormValues;
};

export const exceptionalBlockFormState: ExceptionalBlockFormState = {
  status: "idle",
  fieldErrors: {},
};

type ExceptionalBlockFormInput = Record<
  keyof ExceptionalBlockFormValues,
  unknown
>;

type ValidationResult =
  | { success: true; data: ExceptionalBlockInput }
  | { success: false; fieldErrors: ExceptionalBlockFieldErrors };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateExceptionalBlock(
  input: ExceptionalBlockFormInput,
  now = new Date(),
): ValidationResult {
  const startsAt = parseArgentinaDateTime(input.startsAt);
  const endsAt = parseArgentinaDateTime(input.endsAt);
  const category = exceptionalBlockCategories.find(
    ({ value }) => value === input.category,
  )?.value;
  const fieldErrors: ExceptionalBlockFieldErrors = {};

  if (!startsAt) {
    fieldErrors.startsAt = "Elegí una fecha y hora de inicio válidas.";
  }

  if (!endsAt) {
    fieldErrors.endsAt = "Elegí una fecha y hora de finalización válidas.";
  }

  if (!category) {
    fieldErrors.category = "Elegí un tipo de bloqueo válido.";
  }

  if (startsAt && endsAt) {
    if (endsAt <= startsAt) {
      fieldErrors.endsAt = "El final debe ser posterior al inicio.";
    } else if (endsAt <= now) {
      fieldErrors.endsAt = "El bloqueo ya finalizó. Elegí otro período.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      startsAt: startsAt!.toISOString(),
      endsAt: endsAt!.toISOString(),
      category: category!,
    },
  };
}

export function validateExceptionalBlockId(value: unknown) {
  return typeof value === "string" && uuidPattern.test(value)
    ? value.toLowerCase()
    : null;
}
