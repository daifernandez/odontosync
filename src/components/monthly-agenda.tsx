import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { AgendaViewPreferenceLink } from "@/components/agenda-view-preference-link";
import {
  buildAgendaDay,
  buildAgendaPath,
  type AgendaMonth,
} from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  type Appointment,
} from "@/modules/appointments/domain/appointment";
import { getExceptionalBlockSegmentForDate } from "@/modules/appointments/domain/availability";
import type { ExceptionalBlock } from "@/modules/exceptional-blocks/domain/exceptional-block";

const monthTitleFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  month: "long",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const weekDayLabels = [
  ["Lun", "Lunes"],
  ["Mar", "Martes"],
  ["Mié", "Miércoles"],
  ["Jue", "Jueves"],
  ["Vie", "Viernes"],
  ["Sáb", "Sábado"],
  ["Dom", "Domingo"],
] as const;

function addCount(counts: Map<string, number>, date: string) {
  counts.set(date, (counts.get(date) ?? 0) + 1);
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
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
  const appointmentCounts = new Map<string, number>();
  const blockCounts = new Map<string, number>();

  for (const appointment of appointments) {
    addCount(
      appointmentCounts,
      formatArgentinaDateInput(new Date(appointment.startsAt)),
    );
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
            Consultá la actividad del mes y elegí un día para abrir su agenda.
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
          Vista de consulta: elegí un día para crear o gestionar turnos en la
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

        <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-brand-subtle)]">
          {weekDayLabels.map(([shortLabel, label]) => (
            <div className="px-1 py-3 text-center text-xs font-bold" key={label}>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-l border-[var(--color-border)]">
          {month.days.map((day) => {
            const appointmentCount = appointmentCounts.get(day.date) ?? 0;
            const blockCount = blockCounts.get(day.date) ?? 0;
            const appointmentText = countLabel(
              appointmentCount,
              "turno",
              "turnos",
            );
            const blockText = countLabel(blockCount, "bloqueo", "bloqueos");
            const date = new Date(`${day.date}T12:00:00-03:00`);

            return (
              <Link
                aria-current={day.date === currentDay.date ? "date" : undefined}
                aria-label={`${fullDateFormatter.format(date)}. ${appointmentText}. ${blockText}. Abrir Agenda diaria.`}
                className={`min-h-24 border-r border-b border-[var(--color-border)] p-1.5 text-[var(--color-foreground)] no-underline hover:bg-[var(--color-brand-soft)] focus-visible:z-10 sm:min-h-32 sm:p-3 ${day.isCurrentMonth ? "bg-white" : "bg-[var(--color-brand-subtle)] text-[var(--color-muted)]"}`}
                href={buildAgendaPath({
                  weekStartDate: day.date,
                  view: "day",
                  selectedDate: day.date,
                })}
                key={day.date}
              >
                <span
                  className={`grid size-7 place-items-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${day.date === currentDay.date ? "bg-[var(--color-brand)] text-white" : ""}`}
                >
                  {day.dayOfMonth}
                </span>
                {day.isCurrentMonth && (appointmentCount > 0 || blockCount > 0) ? (
                  <span className="mt-1.5 flex flex-col gap-1 sm:mt-3">
                    {appointmentCount > 0 ? (
                      <span className="rounded-md bg-[var(--color-brand-soft)] px-1 py-1 text-center text-[0.58rem] leading-3 font-bold text-[var(--color-brand-dark)] sm:text-[0.68rem]">
                        {appointmentText}
                      </span>
                    ) : null}
                    {blockCount > 0 ? (
                      <span className="rounded-md bg-[var(--color-neutral-soft)] px-1 py-1 text-center text-[0.58rem] leading-3 font-bold text-[var(--color-muted)] sm:text-[0.68rem]">
                        {blockText}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
