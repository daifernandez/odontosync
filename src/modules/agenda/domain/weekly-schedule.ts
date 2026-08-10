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
