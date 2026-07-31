export const gridIntervalOptions = [10, 15, 20, 30, 60] as const;

export type AvailabilityBlock = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type InitialConfiguration = {
  fullName: string;
  licenseNumber: string | null;
  licenseJurisdiction: string | null;
  gridIntervalMinutes: number;
  defaultAppointmentDurationMinutes: number;
  defaultCleanupMinutes: number;
  availability: AvailabilityBlock[];
};

export type InitialConfigurationFieldErrors = Partial<
  Record<
    | "fullName"
    | "licenseNumber"
    | "licenseJurisdiction"
    | "gridIntervalMinutes"
    | "defaultAppointmentDurationMinutes"
    | "defaultCleanupMinutes"
    | "availability",
    string
  >
>;

type InitialConfigurationInput = {
  fullName: unknown;
  licenseNumber: unknown;
  licenseJurisdiction: unknown;
  gridIntervalMinutes: unknown;
  defaultAppointmentDurationMinutes: unknown;
  defaultCleanupMinutes: unknown;
  availability: unknown;
};

type ValidationResult =
  | { success: true; data: InitialConfiguration }
  | { success: false; fieldErrors: InitialConfigurationFieldErrors };

function normalizeText(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

function parseInteger(value: unknown) {
  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(normalized) ? normalized : null;
}

function parseTime(value: unknown) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hour, minute] = value.split(":").map(Number);

  if (hour > 23 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function parseAvailability(value: unknown): AvailabilityBlock[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const parsed = value.map((block) => {
    if (!block || typeof block !== "object") {
      return null;
    }

    const dayOfWeek = parseInteger(Reflect.get(block, "dayOfWeek"));
    const startTime = Reflect.get(block, "startTime");
    const endTime = Reflect.get(block, "endTime");
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    if (
      dayOfWeek === null ||
      dayOfWeek < 1 ||
      dayOfWeek > 7 ||
      startMinutes === null ||
      endMinutes === null ||
      startMinutes >= endMinutes
    ) {
      return null;
    }

    return {
      dayOfWeek,
      startTime: startTime as string,
      endTime: endTime as string,
      startMinutes,
      endMinutes,
    };
  });

  if (parsed.some((block) => block === null)) {
    return null;
  }

  const sorted = parsed
    .filter((block) => block !== null)
    .sort(
      (left, right) =>
        left.dayOfWeek - right.dayOfWeek ||
        left.startMinutes - right.startMinutes,
    );

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];

    if (
      previous.dayOfWeek === current.dayOfWeek &&
      current.startMinutes < previous.endMinutes
    ) {
      return [];
    }
  }

  return sorted.map(({ dayOfWeek, startTime, endTime }) => ({
    dayOfWeek,
    startTime,
    endTime,
  }));
}

export function validateInitialConfiguration(
  input: InitialConfigurationInput,
): ValidationResult {
  const fullName = normalizeText(input.fullName);
  const licenseNumber = normalizeText(input.licenseNumber);
  const licenseJurisdiction = normalizeText(input.licenseJurisdiction);
  const gridIntervalMinutes = parseInteger(input.gridIntervalMinutes);
  const defaultAppointmentDurationMinutes = parseInteger(
    input.defaultAppointmentDurationMinutes,
  );
  const defaultCleanupMinutes = parseInteger(input.defaultCleanupMinutes);
  const availability = parseAvailability(input.availability);
  const fieldErrors: InitialConfigurationFieldErrors = {};

  if (fullName.length < 3 || fullName.length > 120) {
    fieldErrors.fullName = "Ingresá un nombre de entre 3 y 120 caracteres.";
  }

  if (licenseNumber.length > 50) {
    fieldErrors.licenseNumber = "La matrícula admite hasta 50 caracteres.";
  }

  if (licenseJurisdiction.length > 100) {
    fieldErrors.licenseJurisdiction =
      "La jurisdicción admite hasta 100 caracteres.";
  }

  if (
    gridIntervalMinutes === null ||
    !gridIntervalOptions.some((option) => option === gridIntervalMinutes)
  ) {
    fieldErrors.gridIntervalMinutes = "Elegí un intervalo disponible.";
  }

  if (
    defaultAppointmentDurationMinutes === null ||
    defaultAppointmentDurationMinutes < 1 ||
    defaultAppointmentDurationMinutes > 1440
  ) {
    fieldErrors.defaultAppointmentDurationMinutes =
      "Ingresá una duración de entre 1 y 1440 minutos.";
  }

  if (
    defaultCleanupMinutes === null ||
    defaultCleanupMinutes < 0 ||
    defaultCleanupMinutes > 1440
  ) {
    fieldErrors.defaultCleanupMinutes =
      "Ingresá un margen de entre 0 y 1440 minutos.";
  }

  if (availability === null) {
    fieldErrors.availability =
      "Agregá al menos un bloque con un día y horario válidos.";
  } else if (availability.length === 0) {
    fieldErrors.availability =
      "Los bloques de un mismo día no pueden superponerse.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      fullName,
      licenseNumber: licenseNumber || null,
      licenseJurisdiction: licenseJurisdiction || null,
      gridIntervalMinutes: gridIntervalMinutes as number,
      defaultAppointmentDurationMinutes:
        defaultAppointmentDurationMinutes as number,
      defaultCleanupMinutes: defaultCleanupMinutes as number,
      availability: availability as AvailabilityBlock[],
    },
  };
}
