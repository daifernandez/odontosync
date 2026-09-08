import { MonthlyAgendaView } from "@/components/monthly-agenda-view";
import {
  buildAgendaDay,
  type AgendaMonth,
} from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  type Appointment,
  type AppointmentSpecialty,
} from "@/modules/appointments/domain/appointment";
import { getExceptionalBlockSegmentForDate } from "@/modules/appointments/domain/availability";
import type { ExceptionalBlock } from "@/modules/exceptional-blocks/domain/exceptional-block";

const monthTitleFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  month: "long",
  year: "numeric",
});

function addCount(counts: Map<string, number>, date: string) {
  counts.set(date, (counts.get(date) ?? 0) + 1);
}

function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function MonthlyAgenda({
  appointments,
  currentTime,
  exceptionalBlocks,
  month,
}: Readonly<{
  appointments: Appointment[];
  currentTime: Date;
  exceptionalBlocks: ExceptionalBlock[];
  month: AgendaMonth;
}>) {
  const appointmentSpecialtyCounts: Record<
    string,
    Partial<Record<AppointmentSpecialty, number>>
  > = {};
  const blockCounts = new Map<string, number>();

  for (const appointment of appointments) {
    const date = formatArgentinaDateInput(new Date(appointment.startsAt));
    const counts = appointmentSpecialtyCounts[date] ?? {};
    counts[appointment.specialty] =
      (counts[appointment.specialty] ?? 0) + 1;
    appointmentSpecialtyCounts[date] = counts;
  }

  for (const day of month.days) {
    if (!day.isCurrentMonth) {
      continue;
    }

    for (const block of exceptionalBlocks) {
      if (getExceptionalBlockSegmentForDate(block, day.date)) {
        addCount(blockCounts, day.date);
      }
    }
  }

  const currentDay = buildAgendaDay(undefined, currentTime);
  const monthTitle = monthTitleFormatter.format(
    new Date(`${month.startDate}T12:00:00-03:00`),
  );
  const hasContent = appointments.length > 0 || exceptionalBlocks.length > 0;

  return (
    <MonthlyAgendaView
      appointmentSpecialtyCounts={appointmentSpecialtyCounts}
      blockCounts={Object.fromEntries(blockCounts)}
      currentDate={currentDay.date}
      hasContent={hasContent}
      key={month.startDate}
      month={month}
      monthTitle={capitalizeFirst(monthTitle)}
    />
  );
}
