import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";

const weekDays = [
  { dayOfWeek: 1, label: "Lunes" },
  { dayOfWeek: 2, label: "Martes" },
  { dayOfWeek: 3, label: "Miércoles" },
  { dayOfWeek: 4, label: "Jueves" },
  { dayOfWeek: 5, label: "Viernes" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 7, label: "Domingo" },
] as const;

export function buildWeeklySchedule(availability: AvailabilityBlock[]) {
  return weekDays.map((day) => ({
    ...day,
    blocks: availability
      .filter((block) => block.dayOfWeek === day.dayOfWeek)
      .sort((left, right) => left.startTime.localeCompare(right.startTime)),
  }));
}
