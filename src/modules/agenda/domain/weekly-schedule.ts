import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";
import {
  formatArgentinaDateInput,
  parseArgentinaDateTime,
} from "@/modules/appointments/domain/appointment";

const weekDays = [
  { dayOfWeek: 1, label: "Lunes" },
  { dayOfWeek: 2, label: "Martes" },
  { dayOfWeek: 3, label: "Miércoles" },
  { dayOfWeek: 4, label: "Jueves" },
  { dayOfWeek: 5, label: "Viernes" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 7, label: "Domingo" },
] as const;

const calendarWeekDays = weekDays.slice(0, 5);
const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export type AgendaView = "week" | "day";
export type AgendaDisplayView = AgendaView | "month";

function parseLocalDate(value: string | undefined) {
  const match = value ? localDatePattern.exec(value) : null;

  if (!match) {
    return null;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

function formatLocalDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

export function buildWeeklySchedule(availability: AvailabilityBlock[]) {
  return weekDays.map((day) => ({
    ...day,
    blocks: availability
      .filter((block) => block.dayOfWeek === day.dayOfWeek)
      .sort((left, right) => left.startTime.localeCompare(right.startTime)),
  }));
}

export function buildAgendaWeek(selectedDate?: string, now = new Date()) {
  const selected =
    parseLocalDate(selectedDate) ??
    parseLocalDate(formatArgentinaDateInput(now)) ??
    new Date();
  const dayOfWeek = selected.getUTCDay() || 7;
  const monday = addDays(selected, 1 - dayOfWeek);

  return {
    startDate: formatLocalDate(monday),
    previousStartDate: formatLocalDate(addDays(monday, -7)),
    nextStartDate: formatLocalDate(addDays(monday, 7)),
    days: calendarWeekDays.map((day, index) => ({
      ...day,
      date: formatLocalDate(addDays(monday, index)),
    })),
  };
}

export type AgendaWeek = ReturnType<typeof buildAgendaWeek>;

export function buildAgendaDay(selectedDate?: string, now = new Date()) {
  const selected =
    parseLocalDate(selectedDate) ??
    parseLocalDate(formatArgentinaDateInput(now)) ??
    new Date();
  const dayOfWeek = selected.getUTCDay() || 7;
  const day = weekDays.find((candidate) => candidate.dayOfWeek === dayOfWeek);

  if (!day) {
    throw new Error("Could not build agenda day");
  }

  return {
    ...day,
    date: formatLocalDate(selected),
    previousDate: formatLocalDate(addDays(selected, -1)),
    nextDate: formatLocalDate(addDays(selected, 1)),
  };
}

export type AgendaDay = ReturnType<typeof buildAgendaDay>;

export function buildAgendaMonth(selectedDate?: string, now = new Date()) {
  const selected =
    parseLocalDate(selectedDate) ??
    parseLocalDate(formatArgentinaDateInput(now)) ??
    new Date();
  const firstDay = new Date(
    Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1),
  );
  const firstDayOfWeek = firstDay.getUTCDay() || 7;
  const gridStart = addDays(firstDay, 1 - firstDayOfWeek);
  const previousMonth = new Date(
    Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() - 1, 1),
  );
  const nextMonth = new Date(
    Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 1),
  );

  return {
    startDate: formatLocalDate(firstDay),
    previousStartDate: formatLocalDate(previousMonth),
    nextStartDate: formatLocalDate(nextMonth),
    days: Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      const dayOfWeek = date.getUTCDay() || 7;
      const day = weekDays.find(
        (candidate) => candidate.dayOfWeek === dayOfWeek,
      );

      if (!day) {
        throw new Error("Could not build agenda month day");
      }

      return {
        ...day,
        date: formatLocalDate(date),
        dayOfMonth: date.getUTCDate(),
        isCurrentMonth: date.getUTCMonth() === firstDay.getUTCMonth(),
      };
    }),
  };
}

export type AgendaMonth = ReturnType<typeof buildAgendaMonth>;

export function parseAgendaView(value: string | undefined): AgendaDisplayView {
  return value === "dia" ? "day" : value === "mes" ? "month" : "week";
}

export function buildAgendaPath({
  params,
  selectedDate,
  view,
  weekStartDate,
}: {
  params?: Record<string, string | undefined>;
  selectedDate?: string;
  view: AgendaDisplayView;
  weekStartDate?: string;
}) {
  if (view === "month") {
    const month = buildAgendaMonth(selectedDate ?? weekStartDate);
    const searchParams = new URLSearchParams({
      vista: "mes",
      fecha: month.startDate,
    });

    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) {
        searchParams.set(key, value);
      }
    }

    return `/app/agenda?${searchParams.toString().replaceAll("%3A", ":")}`;
  }

  const week = buildAgendaWeek(weekStartDate);
  const searchParams = new URLSearchParams({ semana: week.startDate });

  if (view === "day") {
    searchParams.set("vista", "dia");
    searchParams.set("fecha", buildAgendaDay(selectedDate).date);
  }

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  return `/app/agenda?${searchParams.toString().replaceAll("%3A", ":")}`;
}

export function getAgendaWeekRange(selectedDate?: string, now = new Date()) {
  const week = buildAgendaWeek(selectedDate, now);
  const nextWeek = buildAgendaWeek(week.nextStartDate, now);
  const from = parseArgentinaDateTime(`${week.startDate}T00:00`);
  const to = parseArgentinaDateTime(`${nextWeek.startDate}T00:00`);

  if (!from || !to) {
    throw new Error("Could not build agenda week range");
  }

  return { from, to, week };
}

export function getAgendaMonthRange(selectedDate?: string, now = new Date()) {
  const month = buildAgendaMonth(selectedDate, now);
  const from = parseArgentinaDateTime(`${month.startDate}T00:00`);
  const to = parseArgentinaDateTime(`${month.nextStartDate}T00:00`);

  if (!from || !to) {
    throw new Error("Could not build agenda month range");
  }

  return { from, to, month };
}
