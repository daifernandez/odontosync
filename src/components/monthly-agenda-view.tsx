"use client";

import { CalendarOff, CalendarPlus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  AgendaPageHeader,
  AgendaPrototypeNotice,
  AgendaViewToolbar,
} from "@/components/agenda-page-shell";
import { MonthlyAgendaDaySelector } from "@/components/monthly-agenda-day-selector";
import {
  buildAgendaPath,
  type AgendaMonth,
} from "@/modules/agenda/domain/weekly-schedule";
import type { AppointmentSpecialty } from "@/modules/appointments/domain/appointment";

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const primaryActionClassName =
  "flex min-h-11 items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-4 text-sm font-bold text-white no-underline shadow-[0_0.45rem_1.2rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)]";
const secondaryActionClassName =
  "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]";
const disabledActionClassName =
  "flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-soft)] px-4 text-sm font-bold text-[var(--color-muted)] opacity-60";

function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function MonthlyAgendaView({
  appointmentSpecialtyCounts,
  blockCounts,
  currentDate,
  hasContent,
  month,
  monthTitle,
}: Readonly<{
  appointmentSpecialtyCounts: Record<
    string,
    Partial<Record<AppointmentSpecialty, number>>
  >;
  blockCounts: Record<string, number>;
  currentDate: string;
  hasContent: boolean;
  month: AgendaMonth;
  monthTitle: string;
}>) {
  const initialSelectedDate = month.days.some(
    (day) => day.isCurrentMonth && day.date === currentDate,
  )
    ? currentDate
    : month.startDate;
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const selectedDateLabel = capitalizeFirst(
    fullDateFormatter.format(new Date(`${selectedDate}T12:00:00-03:00`)),
  );
  const canCreateForSelectedDate = selectedDate >= currentDate;

  return (
    <main className="@container/monthly-agenda mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <AgendaPageHeader
        actions={
          <>
            {canCreateForSelectedDate ? (
              <Link
                className={primaryActionClassName}
                href={`${buildAgendaPath({
                  weekStartDate: selectedDate,
                  view: "day",
                  selectedDate,
                  params: { nuevo: "1" },
                })}#nuevo-turno`}
              >
                <CalendarPlus aria-hidden="true" size={17} />
                Nuevo turno
              </Link>
            ) : (
              <button
                aria-disabled="true"
                className={disabledActionClassName}
                disabled
                type="button"
              >
                <CalendarPlus aria-hidden="true" size={17} />
                Nuevo turno
              </button>
            )}
            {canCreateForSelectedDate ? (
              <Link
                className={secondaryActionClassName}
                href={buildAgendaPath({
                  weekStartDate: selectedDate,
                  view: "day",
                  selectedDate,
                  params: { bloqueos: "1" },
                })}
              >
                <CalendarOff aria-hidden="true" size={17} />
                Bloquear horario
              </Link>
            ) : (
              <button
                aria-disabled="true"
                className={disabledActionClassName}
                disabled
                type="button"
              >
                <CalendarOff aria-hidden="true" size={17} />
                Bloquear horario
              </button>
            )}
            <Link
              className={secondaryActionClassName}
              href="/app/configuracion#agenda"
            >
              <Settings2 aria-hidden="true" size={17} />
              Ajustar horarios
            </Link>
          </>
        }
      />

      <AgendaViewToolbar
        currentHref={buildAgendaPath({
          view: "month",
          selectedDate: currentDate,
        })}
        dayHref={buildAgendaPath({
          weekStartDate: selectedDate,
          view: "day",
          selectedDate,
        })}
        monthHref={buildAgendaPath({
          view: "month",
          selectedDate: month.startDate,
        })}
        nextHref={buildAgendaPath({
          view: "month",
          selectedDate: month.nextStartDate,
        })}
        nextLabel="Mes siguiente"
        previousHref={buildAgendaPath({
          view: "month",
          selectedDate: month.previousStartDate,
        })}
        previousLabel="Mes anterior"
        view="month"
        weekHref={buildAgendaPath({
          weekStartDate: selectedDate,
          view: "week",
        })}
      />

      <AgendaPrototypeNotice />

      <section
        aria-labelledby="monthly-agenda-title"
        className="mt-5 overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-4 @4xl/monthly-agenda:flex-row @4xl/monthly-agenda:items-start @4xl/monthly-agenda:justify-between @4xl/monthly-agenda:p-6">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Mes seleccionado
            </p>
            <h2 className="m-0 text-xl" id="monthly-agenda-title">
              {monthTitle}
            </h2>
          </div>
          <div className="@4xl/monthly-agenda:text-right">
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Día seleccionado
            </p>
            <p aria-live="polite" className="m-0 text-sm font-bold">
              {selectedDateLabel}
            </p>
            {!canCreateForSelectedDate ? (
              <p
                className="mt-2 mb-0 max-w-md text-xs leading-5 text-[var(--color-muted)]"
                role="note"
              >
                Nota: en los días pasados podés consultar turnos y registrar
                resultados pendientes.
              </p>
            ) : null}
          </div>
        </div>

        {!hasContent ? (
          <p
            className="m-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4 py-3 text-center text-sm font-semibold @2xl/monthly-agenda:mx-6"
            role="status"
          >
            No hay turnos ni bloqueos en este mes.
          </p>
        ) : null}

        <MonthlyAgendaDaySelector
          appointmentSpecialtyCounts={appointmentSpecialtyCounts}
          blockCounts={blockCounts}
          currentDate={currentDate}
          month={month}
          onSelectedDateChange={setSelectedDate}
          selectedDate={selectedDate}
        />
      </section>
    </main>
  );
}
