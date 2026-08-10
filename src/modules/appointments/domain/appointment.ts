export const appointmentSpecialties = [
  { value: "general", label: "Odontología general" },
  { value: "pediatric_dentistry", label: "Odontopediatría" },
  { value: "orthodontics", label: "Ortodoncia" },
  { value: "surgery", label: "Cirugía" },
  { value: "implantology", label: "Implantología" },
  { value: "endodontics", label: "Endodoncia" },
  { value: "periodontics", label: "Periodoncia" },
  { value: "restorative", label: "Operatoria / restauradora" },
  { value: "prosthodontics", label: "Prótesis / rehabilitación" },
] as const;

export type AppointmentSpecialty =
  (typeof appointmentSpecialties)[number]["value"];

export type Appointment = {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  startsAt: string;
  durationMinutes: number;
  cleanupMinutes: number;
  specialty: AppointmentSpecialty;
  status: "pending_confirmation";
};

export type AppointmentInput = Pick<
  Appointment,
  | "patientId"
  | "startsAt"
  | "durationMinutes"
  | "cleanupMinutes"
  | "specialty"
>;

type AppointmentField = keyof AppointmentInput;

export type AppointmentFormValues = Record<AppointmentField, string>;

export type AppointmentFieldErrors = Partial<
  Record<AppointmentField, string>
>;

export type AppointmentFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: AppointmentFieldErrors;
  values?: AppointmentFormValues;
};

export const appointmentFormState: AppointmentFormState = {
  status: "idle",
  fieldErrors: {},
};

type AppointmentFormInput = Record<AppointmentField, unknown>;

type ValidationResult =
  | { success: true; data: AppointmentInput }
  | { success: false; fieldErrors: AppointmentFieldErrors };

const argentinaTimeZone = "America/Argentina/Buenos_Aires";
const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const argentinaDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: argentinaTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function parseInteger(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(parsed) ? parsed : null;
}

function getArgentinaParts(date: Date) {
  const parts = argentinaDateTimeFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function parseArgentinaDateTime(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const match = localDateTimePattern.exec(value);

  if (!match) {
    return null;
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  const calendarCheck = new Date(localTimestamp);

  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  let timestamp = localTimestamp;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = getArgentinaParts(new Date(timestamp));
    const representedLocalTimestamp = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    timestamp += localTimestamp - representedLocalTimestamp;
  }

  const result = new Date(timestamp);
  const parts = getArgentinaParts(result);

  if (
    parts.year !== year ||
    parts.month !== month ||
    parts.day !== day ||
    parts.hour !== hour ||
    parts.minute !== minute
  ) {
    return null;
  }

  return result;
}

export function validateAppointment(
  input: AppointmentFormInput,
  now = new Date(),
): ValidationResult {
  const patientId =
    typeof input.patientId === "string" && uuidPattern.test(input.patientId)
      ? input.patientId.toLowerCase()
      : null;
  const startsAt = parseArgentinaDateTime(input.startsAt);
  const durationMinutes = parseInteger(input.durationMinutes);
  const cleanupMinutes = parseInteger(input.cleanupMinutes);
  const specialty = appointmentSpecialties.find(
    (option) => option.value === input.specialty,
  )?.value;
  const fieldErrors: AppointmentFieldErrors = {};

  if (!patientId) {
    fieldErrors.patientId = "Elegí un paciente activo.";
  }

  if (!startsAt || startsAt.getTime() <= now.getTime()) {
    fieldErrors.startsAt = "Elegí una fecha y hora futuras válidas.";
  }

  if (
    durationMinutes === null ||
    durationMinutes < 1 ||
    durationMinutes > 1440
  ) {
    fieldErrors.durationMinutes =
      "Ingresá una duración de entre 1 y 1440 minutos.";
  }

  if (
    cleanupMinutes === null ||
    cleanupMinutes < 0 ||
    cleanupMinutes > 1440
  ) {
    fieldErrors.cleanupMinutes =
      "Ingresá un margen de entre 0 y 1440 minutos.";
  }

  if (!specialty) {
    fieldErrors.specialty = "Elegí un área odontológica.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      patientId: patientId as string,
      startsAt: (startsAt as Date).toISOString(),
      durationMinutes: durationMinutes as number,
      cleanupMinutes: cleanupMinutes as number,
      specialty: specialty as AppointmentSpecialty,
    },
  };
}

export function getAppointmentSpecialtyLabel(
  specialty: AppointmentSpecialty,
) {
  return appointmentSpecialties.find((option) => option.value === specialty)
    ?.label;
}
