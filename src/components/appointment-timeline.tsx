"use client";

import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  buildAgendaPath,
  type AgendaView,
} from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  getAppointmentSpecialtyLabel,
  isPendingAppointmentAwaitingOutcome,
  isPendingAppointmentManageable,
  type Appointment,
  type AppointmentStatus,
} from "@/modules/appointments/domain/appointment";

export type TimelineStatusFilter =
  | "all"
  | "ongoing"
  | "finished"
  | "changes";

type TimelineFilters = {
  date: string | "all";
  status: TimelineStatusFilter;
};

const statusFilters: Array<{
  value: TimelineStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "ongoing", label: "En curso" },
  { value: "finished", label: "Finalizados" },
  { value: "changes", label: "Cambios" },
];

const statusStyles: Record<
  AppointmentStatus,
  { badge: string; dot: string }
> = {
  pending_confirmation: {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
  },
  confirmed: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
  },
  completed: {
    badge: "border-teal-200 bg-teal-50 text-teal-800",
    dot: "bg-teal-600",
  },
  no_show: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  cancelled: {
    badge: "border-red-200 bg-red-50 text-red-800",
    dot: "bg-red-500",
  },
  rescheduled: {
    badge: "border-violet-200 bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
  },
};

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTimelineTime(date: Date) {
  return timeFormatter.format(date).replace(/\s/g, " ");
}

const dayFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
});

function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getTimelineCategory(status: AppointmentStatus) {
  if (status === "cancelled" || status === "rescheduled") {
    return "changes";
  }

  if (status === "completed" || status === "no_show") {
    return "finished";
  }

  return "ongoing";
}

function getStatusLabel(appointment: Appointment, now: Date) {
  if (isPendingAppointmentAwaitingOutcome(appointment, now)) {
    return "Pendiente de cierre";
  }

  switch (appointment.status) {
    case "confirmed":
      return "Confirmado";
    case "completed":
      return "Atendido";
    case "no_show":
      return "Ausente";
    case "cancelled":
      return "Cancelado";
    case "rescheduled":
      return "Reprogramado";
    default:
      return "Pendiente de confirmación";
  }
}

export function filterTimelineAppointments(
  appointments: Appointment[],
  filters: TimelineFilters,
) {
  return appointments.filter((appointment) => {
    const matchesDate =
      filters.date === "all" ||
      formatArgentinaDateInput(new Date(appointment.startsAt)) === filters.date;
    const matchesStatus =
      filters.status === "all" ||
      getTimelineCategory(appointment.status) === filters.status;

    return matchesDate && matchesStatus;
  });
}

function getAction(
  appointment: Appointment,
  now: Date,
  forceReadOnly: boolean,
) {
  const awaitsOutcome = isPendingAppointmentAwaitingOutcome(appointment, now);
  const isChange =
    appointment.status === "cancelled" || appointment.status === "rescheduled";
  const isFinished =
    appointment.status === "completed" || appointment.status === "no_show";
  const isReadOnly =
    forceReadOnly ||
    isChange ||
    isFinished ||
    (appointment.status === "pending_confirmation" &&
      !isPendingAppointmentManageable(appointment, now) &&
      !awaitsOutcome);

  if (isChange) {
    return { label: "Ver cambio", readOnly: true };
  }

  if (isFinished) {
    return { label: "Ver historial", readOnly: true };
  }

  if (awaitsOutcome && !forceReadOnly) {
    return { label: "Registrar resultado", readOnly: false };
  }

  return {
    label: isReadOnly ? "Ver turno" : "Gestionar turno",
    readOnly: isReadOnly,
  };
}

function appointmentCountLabel(count: number) {
  return `${count} ${count === 1 ? "turno" : "turnos"}`;
}

export function AppointmentTimeline({
  appointments,
  currentTime,
  days,
  readOnlyAppointment = false,
  selectedDate,
  view,
  weekStartDate,
}: Readonly<{
  appointments: Appointment[];
  currentTime: string;
  days: Array<{ date: string; label: string }>;
  readOnlyAppointment?: boolean;
  selectedDate: string;
  view: AgendaView;
  weekStartDate: string;
}>) {
  const [statusFilter, setStatusFilter] =
    useState<TimelineStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<string | "all">("all");
  const now = new Date(currentTime);
  const visibleAppointments = filterTimelineAppointments(appointments, {
    date: view === "day" ? selectedDate : dateFilter,
    status: statusFilter,
  });
  const groupedAppointments = Object.entries(
    Object.groupBy(visibleAppointments, (appointment) =>
      formatArgentinaDateInput(new Date(appointment.startsAt)),
    ),
  ).sort(([left], [right]) => left.localeCompare(right));

  return (
    <section
      aria-labelledby="appointment-timeline-title"
      className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
    >
      <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
        Turnos {view === "day" ? "del día" : "de la semana"}
      </p>
      <div>
        <h2 className="m-0 text-xl" id="appointment-timeline-title">
          Seguimiento de turnos
        </h2>
        <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
          Consultá el estado de cada turno y accedé a la acción disponible.
        </p>
        <p aria-live="polite" className="sr-only">
          {appointmentCountLabel(visibleAppointments.length)}
        </p>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="m-0 text-xs font-bold text-[var(--color-muted)]">
          Estado
        </p>
        <div
          aria-label="Filtrar turnos por estado"
          className="mt-2 flex flex-wrap gap-2"
          role="group"
        >
          {statusFilters.map((filter) => {
            const selected = statusFilter === filter.value;

            return (
              <button
                aria-pressed={selected}
                className={`min-h-11 cursor-pointer rounded-xl border px-3 text-xs font-bold ${selected ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white" : "border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)]"}`}
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "week" ? (
        <div className="mt-4">
          <p className="m-0 text-xs font-bold text-[var(--color-muted)]">Día</p>
          <div
            aria-label="Filtrar turnos por día"
            className="mt-2 flex gap-2 overflow-x-auto pb-1"
            role="group"
          >
            {[{ date: "all", label: "Toda la semana" }, ...days].map(
              (filter) => {
                const selected = dateFilter === filter.date;

                return (
                  <button
                    aria-pressed={selected}
                    className={`min-h-11 shrink-0 cursor-pointer rounded-xl border px-3 text-xs font-bold ${selected ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]" : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:text-[var(--color-brand-dark)]"}`}
                    key={filter.date}
                    onClick={() => setDateFilter(filter.date)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                );
              },
            )}
          </div>
        </div>
      ) : null}

      {visibleAppointments.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
          <CalendarClock
            aria-hidden="true"
            className="mx-auto text-[var(--color-brand)]"
            size={28}
          />
          <h3 className="mt-3 mb-0 text-base">
            No hay turnos para estos filtros
          </h3>
          <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
            Probá con otro día o estado, o elegí un espacio libre de la grilla
            para cargar un turno.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {groupedAppointments.map(([date, group]) => (
            <details
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)]"
              open
              key={`${date}-${dateFilter}-${statusFilter}`}
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-bold marker:hidden">
                <span>
                  {capitalizeFirst(
                    dayFormatter.format(new Date(`${date}T12:00:00-03:00`)),
                  )}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {appointmentCountLabel(group?.length ?? 0)}
                </span>
              </summary>
              <ol className="relative m-0 list-none space-y-3 border-t border-[var(--color-border)] px-4 py-4 before:absolute before:top-7 before:bottom-7 before:left-[1.72rem] before:w-px before:bg-[var(--color-border)] md:px-5">
                {group?.map((appointment) => {
                  const action = getAction(
                    appointment,
                    now,
                    readOnlyAppointment,
                  );
                  const appointmentDate = formatArgentinaDateInput(
                    new Date(appointment.startsAt),
                  );
                  const statusLabel = getStatusLabel(appointment, now);
                  const styles = statusStyles[appointment.status];

                  return (
                    <li className="relative pl-8" key={appointment.id}>
                      <span
                        aria-hidden="true"
                        className={`absolute top-5 left-0.5 size-3.5 rounded-full border-2 border-white shadow-sm ${styles.dot}`}
                      />
                      <article className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 @4xl/daily-agenda:grid-cols-[5.25rem_minmax(0,1fr)_auto] @4xl/daily-agenda:items-center">
                        <p className="m-0 text-sm font-bold text-[var(--color-brand-dark)]">
                          {formatTimelineTime(new Date(appointment.startsAt))}
                        </p>
                        <div className="min-w-0">
                          <h3 className="m-0 truncate text-sm">
                            {appointment.patientLastName},{" "}
                            {appointment.patientFirstName}
                          </h3>
                          <p className="mt-1 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                            {getAppointmentSpecialtyLabel(
                              appointment.specialty,
                            )}{" "}
                            · {appointment.durationMinutes} min +{" "}
                            {appointment.cleanupMinutes} min de acondicionamiento
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 @4xl/daily-agenda:justify-end">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${styles.badge}`}
                          >
                            {statusLabel}
                          </span>
                          <Link
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                            href={buildAgendaPath({
                              weekStartDate,
                              view,
                              selectedDate:
                                view === "day" ? selectedDate : appointmentDate,
                              params: {
                                turno: appointment.id,
                                ...(action.readOnly ? { consulta: "1" } : {}),
                              },
                            })}
                          >
                            {action.label}
                          </Link>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
