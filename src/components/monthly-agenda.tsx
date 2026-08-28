import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { AgendaViewPreferenceLink } from "@/components/agenda-view-preference-link";
import { MonthlyAgendaDaySelector } from "@/components/monthly-agenda-day-selector";
import {
  buildAgendaDay,
  buildAgendaPath,
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
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Agenda
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
            Agenda mensual
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Consultá la actividad del mes y elegí un día para gestionarlo.
          </p>
        </div>
        <Link
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)] sm:w-auto"
          href="/app/configuracion#agenda"
        >
          <Settings2 aria-hidden="true" size={17} />
          Ajustar horarios
        </Link>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <CalendarClock
          aria-hidden="true"
          className="mt-1 shrink-0 md:mt-0"
          size={18}
        />
        <p className="m-0 text-[0.78rem] leading-6">
          Elegí un día del calendario y usá las acciones disponibles en su
          Agenda diaria.
        </p>
      </aside>

      <section
        aria-labelledby="monthly-agenda-title"
        className="mt-5 overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Mes seleccionado
            </p>
            <h2 className="m-0 text-xl" id="monthly-agenda-title">
              {capitalizeFirst(monthTitle)}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <nav
              aria-label="Cambiar vista de agenda"
              className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-1"
            >
              <AgendaViewPreferenceLink
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg px-2 text-xs font-bold text-[var(--color-muted)] no-underline hover:text-[var(--color-brand-dark)] sm:flex-none sm:px-3"
                href={buildAgendaPath({
                  weekStartDate: month.startDate,
                  view: "week",
                })}
                view="week"
              >
                Vista semanal
              </AgendaViewPreferenceLink>
              <AgendaViewPreferenceLink
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg px-2 text-xs font-bold text-[var(--color-muted)] no-underline hover:text-[var(--color-brand-dark)] sm:flex-none sm:px-3"
                href={buildAgendaPath({
                  weekStartDate: month.startDate,
                  view: "day",
                  selectedDate: month.startDate,
                })}
                view="day"
              >
                Vista diaria
              </AgendaViewPreferenceLink>
              <AgendaViewPreferenceLink
                ariaCurrent="page"
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-white px-2 text-xs font-bold text-[var(--color-brand-dark)] no-underline shadow-sm sm:flex-none sm:px-3"
                href={buildAgendaPath({
                  view: "month",
                  selectedDate: month.startDate,
                })}
                view="month"
              >
                Vista mensual
              </AgendaViewPreferenceLink>
            </nav>
            <nav aria-label="Navegar meses" className="flex flex-wrap gap-2">
              <Link
                aria-label="Mes anterior"
                className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={buildAgendaPath({
                  view: "month",
                  selectedDate: month.previousStartDate,
                })}
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </Link>
              <Link
                className="flex min-h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={buildAgendaPath({
                  view: "month",
                  selectedDate: currentDay.date,
                })}
              >
                Hoy
              </Link>
              <Link
                aria-label="Mes siguiente"
                className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={buildAgendaPath({
                  view: "month",
                  selectedDate: month.nextStartDate,
                })}
              >
                <ChevronRight aria-hidden="true" size={18} />
              </Link>
            </nav>
          </div>
        </div>

        {!hasContent ? (
          <p
            className="m-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4 py-3 text-center text-sm font-semibold md:mx-6"
            role="status"
          >
            No hay turnos ni bloqueos en este mes.
          </p>
        ) : null}

        <MonthlyAgendaDaySelector
          appointmentSpecialtyCounts={appointmentSpecialtyCounts}
          blockCounts={Object.fromEntries(blockCounts)}
          currentDate={currentDay.date}
          month={month}
        />
      </section>
    </main>
  );
}
