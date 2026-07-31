import { CalendarClock, Clock3, Settings2 } from "lucide-react";
import Link from "next/link";

import { buildWeeklySchedule } from "@/modules/agenda/domain/weekly-schedule";
import type { InitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";

const summaryCardClassName =
  "rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]";

export function WeeklyAgenda({
  configuration,
}: Readonly<{ configuration: InitialConfiguration }>) {
  const schedule = buildWeeklySchedule(configuration.availability);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Agenda
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
            Semana habitual
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Consultá los bloques de atención que configuraste para cada día.
          </p>
        </div>
        <Link
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href="/app/configuracion#agenda"
        >
          <Settings2 aria-hidden="true" size={17} />
          Ajustar horarios
        </Link>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <CalendarClock aria-hidden="true" className="mt-1 shrink-0 md:mt-0" size={18} />
        <p className="m-0 text-[0.78rem] leading-6">
          Esta primera vista muestra disponibilidad habitual. Los turnos se
          incorporarán después de habilitar las fichas de pacientes ficticios.
        </p>
      </aside>

      <section
        aria-label="Preferencias de la agenda"
        className="mt-5 grid gap-4 sm:grid-cols-3"
      >
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Intervalo de grilla
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.gridIntervalMinutes} min
          </strong>
        </article>
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Duración habitual
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.defaultAppointmentDurationMinutes} min
          </strong>
        </article>
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Acondicionamiento
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.defaultCleanupMinutes} min
          </strong>
        </article>
      </section>

      <section
        aria-labelledby="weekly-availability-title"
        className="mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
      >
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Disponibilidad
          </p>
          <h2 className="m-0 text-xl" id="weekly-availability-title">
            Horarios por día
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {schedule.map((day) => (
            <article
              className="min-h-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-3.5"
              key={day.dayOfWeek}
            >
              <h3 className="m-0 text-sm font-bold">{day.label}</h3>

              {day.blocks.length === 0 ? (
                <p className="mt-5 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                  Sin atención
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {day.blocks.map((block) => (
                    <div
                      className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5"
                      key={`${block.startTime}-${block.endTime}`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-dark)]">
                        <Clock3 aria-hidden="true" size={14} />
                        <time dateTime={block.startTime}>{block.startTime}</time>
                        <span aria-hidden="true">–</span>
                        <time dateTime={block.endTime}>{block.endTime}</time>
                      </span>
                      <span className="mt-1 block text-[0.68rem] text-[var(--color-muted)]">
                        Disponible
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
