import {
  appointmentSpecialties,
  type AppointmentSpecialty,
} from "@/modules/appointments/domain/appointment";

export const instructionSpecialties = [
  { value: "general", label: "Odontología general" },
  ...appointmentSpecialties,
] as const;

export const instructionListStyles = [
  { value: "numbered", label: "Números", sample: "1" },
  { value: "dashes", label: "Guiones", sample: "—" },
  { value: "bullets", label: "Puntos", sample: "•" },
  { value: "checks", label: "Checks", sample: "✓" },
  { value: "odontosync", label: "Ícono OdontoSync", sample: "OS" },
] as const;

export type InstructionListStyle =
  (typeof instructionListStyles)[number]["value"];

export type InstructionTemplate = {
  id: string;
  title: string;
  specialty: AppointmentSpecialty;
  introduction: string | null;
  listStyle: InstructionListStyle;
  points: string[];
  updatedAt: string;
};

export type InstructionTemplateInput = Omit<
  InstructionTemplate,
  "id" | "updatedAt"
>;

export type InstructionTemplateFormValues = {
  title: string;
  specialty: string;
  introduction: string;
  listStyle: string;
  points: string[];
};

export type InstructionTemplateFieldErrors = Partial<
  Record<keyof InstructionTemplateFormValues, string>
>;

export type InstructionTemplateFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: InstructionTemplateFieldErrors;
  values?: InstructionTemplateFormValues;
};

export const instructionTemplateFormState: InstructionTemplateFormState = {
  status: "idle",
  fieldErrors: {},
};

type InstructionTemplateFormInput = Record<
  keyof InstructionTemplateFormValues,
  unknown
>;

type ValidationResult =
  | { success: true; data: InstructionTemplateInput }
  | { success: false; fieldErrors: InstructionTemplateFieldErrors };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateInstructionTemplate(
  input: InstructionTemplateFormInput,
): ValidationResult {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const introduction =
    typeof input.introduction === "string" ? input.introduction.trim() : "";
  const specialty = instructionSpecialties.find(
    ({ value }) => value === input.specialty,
  )?.value;
  const listStyle = instructionListStyles.find(
    ({ value }) => value === input.listStyle,
  )?.value;
  const rawPoints = Array.isArray(input.points)
    ? input.points.filter((point): point is string => typeof point === "string")
    : [];
  const points = rawPoints.map((point) => point.trim()).filter(Boolean);
  const fieldErrors: InstructionTemplateFieldErrors = {};

  if (!title) {
    fieldErrors.title = "Escribí un título para identificar la indicación.";
  } else if (title.length > 120) {
    fieldErrors.title = "El título puede tener hasta 120 caracteres.";
  }

  if (!specialty) {
    fieldErrors.specialty = "Elegí una especialidad válida.";
  }

  if (introduction.length > 2000) {
    fieldErrors.introduction =
      "La introducción puede tener hasta 2000 caracteres.";
  }

  if (!listStyle) {
    fieldErrors.listStyle = "Elegí un estilo de lista válido.";
  }

  if (points.length === 0) {
    fieldErrors.points = "Agregá al menos una indicación.";
  } else if (
    rawPoints.length > 20 ||
    points.length > 20 ||
    points.some((point) => point.length > 1000)
  ) {
    fieldErrors.points =
      "Podés agregar hasta 20 indicaciones de 1000 caracteres cada una.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      title,
      specialty: specialty!,
      introduction: introduction || null,
      listStyle: listStyle!,
      points,
    },
  };
}

export function validateInstructionTemplateId(value: unknown) {
  return typeof value === "string" && uuidPattern.test(value)
    ? value.toLowerCase()
    : null;
}

export function getInstructionListMarker(
  style: InstructionListStyle,
  index: number,
) {
  if (style === "numbered") {
    return String(index + 1);
  }

  if (style === "dashes") {
    return "—";
  }

  if (style === "bullets") {
    return "•";
  }

  if (style === "checks") {
    return "✓";
  }

  return "OS";
}
