import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { AgendaViewPreferenceLink } from "@/components/agenda-view-preference-link";
import { AppointmentManagementPanel } from "@/components/appointment-management-panel";
import { AppointmentPanel } from "@/components/appointment-panel";
import { ExceptionalBlocksPanel } from "@/components/exceptional-blocks-panel";
import {
  buildAgendaDay,
  buildAgendaPath,
  buildAgendaWeek,
  type AgendaView,
  type AgendaWeek,
} from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  getArgentinaDateTimeParts,
  getAppointmentSpecialtyLabel,
  isPendingAppointmentManageable,
  type Appointment,
  type AppointmentClosureStatus,
  type AppointmentStatus,
} from "@/modules/appointments/domain/appointment";
import {
  getExceptionalBlockSegmentForDate,
  getAvailableAppointmentSlots,
  type AppointmentOccupancy,
} from "@/modules/appointments/domain/availability";
import {
  exceptionalBlockCategories,
  type ExceptionalBlock,
} from "@/modules/exceptional-blocks/domain/exceptional-block";
import type { InitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import type { Patient } from "@/modules/patients/domain/patient";

type AppointmentPatientOption = Pick<
  Patient,
  "id" | "firstName" | "lastName"
>;

const summaryCardClassName =
  "rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]";
const pixelsPerMinute = 1.2;

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function getAppointmentStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "completed":
      return "Atendido";
    case "no_show":
      return "Ausente";
    default:
      return "Pendiente de confirmación";
  }
}

function isHistoricalAppointment(status: AppointmentStatus) {
  return status === "completed" || status === "no_show";
}

export function WeeklyAgenda({
  appointments,
  appointmentOccupancy,
  autoOpenNewAppointment,
  cancelled,
  closureStatus,
  confirmed,
  configuration,
  created,
  exceptionalBlockCreated,
  exceptionalBlockDeleted,
  exceptionalBlockManagementError,
  exceptionalBlockPanelOpen,
  exceptionalBlocks,
  initialDate,
  initialPatientId,
  initialTime,
  managementError,
  patients,
  readOnlyAppointment,
  rescheduled = false,
  selectedAppointment,
  selectedDate,
  updated,
  view = "week",
  week,
}: Readonly<{
  appointments: Appointment[];
  appointmentOccupancy: AppointmentOccupancy[];
  autoOpenNewAppointment: boolean;
  cancelled: boolean;
  closureStatus?: AppointmentClosureStatus;
  confirmed: boolean;
  configuration: InitialConfiguration;
  created: boolean;
  exceptionalBlockCreated: boolean;
  exceptionalBlockDeleted: boolean;
  exceptionalBlockManagementError: boolean;
  exceptionalBlockPanelOpen: boolean;
  exceptionalBlocks: ExceptionalBlock[];
  initialDate?: string;
  initialPatientId?: string;
  initialTime?: string;
  managementError: boolean;
  patients: AppointmentPatientOption[];
  readOnlyAppointment?: boolean;
  rescheduled?: boolean;
  selectedAppointment?: Appointment;
  selectedDate?: string;
  updated: boolean;
  view?: AgendaView;
  week: AgendaWeek;
}>) {
  const currentTime = new Date();
  const day = buildAgendaDay(selectedDate ?? week.startDate, currentTime);
  const visibleDays = view === "day" ? [day] : week.days;
  const visibleAppointments =
    view === "day"
      ? appointments.filter(
          (appointment) =>
            formatArgentinaDateInput(new Date(appointment.startsAt)) ===
            day.date,
        )
      : appointments;
  const calendarAvailability = configuration.availability.filter((block) =>
    visibleDays.some((visibleDay) => visibleDay.dayOfWeek === block.dayOfWeek),
  );
  const hasCalendarAvailability = calendarAvailability.length > 0;
  const calendarStart = hasCalendarAvailability
    ? Math.min(
        ...calendarAvailability.map((block) => timeToMinutes(block.startTime)),
      )
    : 0;
  const calendarEnd = hasCalendarAvailability
    ? Math.max(
        ...calendarAvailability.map((block) => timeToMinutes(block.endTime)),
      )
    : 0;
  const calendarHeight = (calendarEnd - calendarStart) * pixelsPerMinute;
  const calendarGridClassName =
    view === "day"
      ? "grid-cols-[4.5rem_minmax(0,1fr)]"
      : "grid-cols-[4.5rem_repeat(5,minmax(0,1fr))]";
  const hourMarkers = Array.from(
    { length: Math.ceil((calendarEnd - calendarStart) / 60) + 1 },
    (_, index) => calendarStart + index * 60,
  ).filter((minutes) => minutes <= calendarEnd);
  const currentWeekStart = buildAgendaWeek(undefined, currentTime).startDate;
  const currentDay = buildAgendaDay(undefined, currentTime);
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
  });
  const weekTitleFormatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(`${visibleDays[0].date}T12:00:00-03:00`);
  const lastDay = new Date(
    `${visibleDays.at(-1)?.date}T12:00:00-03:00`,
  );
  const selectedOccupancyIndex = selectedAppointment
    ? appointmentOccupancy.findIndex(
        (occupied) =>
          occupied.startsAt === selectedAppointment.startsAt &&
          occupied.durationMinutes === selectedAppointment.durationMinutes &&
          occupied.cleanupMinutes === selectedAppointment.cleanupMinutes,
      )
    : -1;

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Agenda
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
            Agenda {view === "day" ? "diaria" : "semanal"}
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Visualizá el tiempo clínico y el acondicionamiento reservado de cada
            turno.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <AppointmentPanel
            autoOpen={autoOpenNewAppointment}
            appointmentOccupancy={appointmentOccupancy}
            availability={configuration.availability}
            created={created}
            currentTime={currentTime.toISOString()}
            defaultCleanupMinutes={configuration.defaultCleanupMinutes}
            defaultDurationMinutes={
              configuration.defaultAppointmentDurationMinutes
            }
            gridIntervalMinutes={configuration.gridIntervalMinutes}
            exceptionalBlocks={exceptionalBlocks}
            initialDate={initialDate}
            initialPatientId={initialPatientId}
            initialTime={initialTime}
            key={`${initialDate ?? ""}-${initialTime ?? ""}-${initialPatientId ?? ""}-${created}`}
            minimumDate={formatArgentinaDateInput(currentTime)}
            patients={patients}
            selectedDate={day.date}
            view={view}
            weekStartDate={week.startDate}
          />
          <ExceptionalBlocksPanel
            autoOpen={exceptionalBlockPanelOpen}
            blocks={exceptionalBlocks}
            created={exceptionalBlockCreated}
            deleted={exceptionalBlockDeleted}
            managementError={exceptionalBlockManagementError}
            selectedDate={day.date}
            view={view}
            weekStartDate={week.startDate}
          />
          <Link
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
            href="/app/configuracion#agenda"
          >
            <Settings2 aria-hidden="true" size={17} />
            Ajustar horarios
          </Link>
        </div>
      </header>

      {selectedAppointment ? (
        <AppointmentManagementPanel
          appointment={selectedAppointment}
          appointmentOccupancy={appointmentOccupancy.filter(
            (_, index) => index !== selectedOccupancyIndex,
          )}
          availability={configuration.availability}
          currentTime={currentTime.toISOString()}
          exceptionalBlocks={exceptionalBlocks}
          gridIntervalMinutes={configuration.gridIntervalMinutes}
          key={`${selectedAppointment.id}-${readOnlyAppointment ? "consulta" : "gestion"}`}
          minimumDate={formatArgentinaDateInput(currentTime)}
          readOnly={readOnlyAppointment}
          selectedDate={day.date}
          view={view}
          weekStartDate={week.startDate}
        />
      ) : null}

      {updated ||
      cancelled ||
      confirmed ||
      rescheduled ||
      closureStatus ||
      managementError ? (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm font-semibold ${managementError ? "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "border-[var(--color-border)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"}`}
          role={managementError ? "alert" : "status"}
        >
          {updated
            ? "El turno se actualizó correctamente."
            : rescheduled
              ? "El turno se reprogramó y el nuevo horario quedó pendiente de confirmación."
            : cancelled
              ? "El turno se canceló y el horario volvió a quedar disponible."
              : confirmed
                ? "El turno quedó confirmado correctamente."
                : closureStatus === "completed"
                  ? "El turno quedó registrado como atendido."
                  : closureStatus === "no_show"
                    ? "El turno quedó registrado como ausente."
                    : "No pudimos gestionar ese turno. Actualizá la agenda e intentá nuevamente."}
        </div>
      ) : null}

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <CalendarClock aria-hidden="true" className="mt-1 shrink-0 md:mt-0" size={18} />
        <p className="m-0 text-[0.78rem] leading-6">
          Prototipo académico: asociá únicamente pacientes ficticios y no
          ingreses información clínica en la agenda.
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
        aria-labelledby="agenda-calendar-title"
        className="mt-5 overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              {view === "day" ? "Día seleccionado" : "Semana seleccionada"}
            </p>
            <h2 className="m-0 text-xl" id="agenda-calendar-title">
              {view === "day"
                ? `${day.label}, ${weekTitleFormatter.format(firstDay)}`
                : `${weekTitleFormatter.format(firstDay)} — ${weekTitleFormatter.format(lastDay)}`}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <nav
              aria-label="Cambiar vista de agenda"
              className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-1"
            >
              <AgendaViewPreferenceLink
                ariaCurrent={view === "week" ? "page" : undefined}
                className={`flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold no-underline sm:flex-none ${view === "week" ? "bg-white text-[var(--color-brand-dark)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-brand-dark)]"}`}
                href={buildAgendaPath({
                  weekStartDate: week.startDate,
                  view: "week",
                  params: view === "day" ? { fecha: day.date } : undefined,
                })}
                view="week"
              >
                Vista semanal
              </AgendaViewPreferenceLink>
              <AgendaViewPreferenceLink
                ariaCurrent={view === "day" ? "page" : undefined}
                className={`flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold no-underline sm:flex-none ${view === "day" ? "bg-white text-[var(--color-brand-dark)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-brand-dark)]"}`}
                href={buildAgendaPath({
                  weekStartDate: week.startDate,
                  view: "day",
                  selectedDate: day.date,
                })}
                view="day"
              >
                Vista diaria
              </AgendaViewPreferenceLink>
              <AgendaViewPreferenceLink
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold text-[var(--color-muted)] no-underline hover:text-[var(--color-brand-dark)] sm:flex-none"
                href={buildAgendaPath({
                  view: "month",
                  selectedDate: day.date,
                })}
                view="month"
              >
                Vista mensual
              </AgendaViewPreferenceLink>
            </nav>
            <nav
              aria-label={view === "day" ? "Navegar días" : "Navegar semanas"}
              className="flex flex-wrap gap-2"
            >
              <Link
                aria-label={
                  view === "day" ? "Día anterior" : "Semana anterior"
                }
                className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={
                  view === "day"
                    ? buildAgendaPath({
                        weekStartDate: day.previousDate,
                        view,
                        selectedDate: day.previousDate,
                      })
                    : buildAgendaPath({
                        weekStartDate: week.previousStartDate,
                        view,
                      })
                }
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </Link>
              <Link
                className="flex min-h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={buildAgendaPath({
                  weekStartDate:
                    view === "day" ? currentDay.date : currentWeekStart,
                  view,
                  selectedDate: currentDay.date,
                })}
              >
                Hoy
              </Link>
              <Link
                aria-label={
                  view === "day" ? "Día siguiente" : "Semana siguiente"
                }
                className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
                href={
                  view === "day"
                    ? buildAgendaPath({
                        weekStartDate: day.nextDate,
                        view,
                        selectedDate: day.nextDate,
                      })
                    : buildAgendaPath({
                        weekStartDate: week.nextStartDate,
                        view,
                      })
                }
              >
                <ChevronRight aria-hidden="true" size={18} />
              </Link>
            </nav>
          </div>
        </div>

        {!hasCalendarAvailability ? (
          <div className="px-5 py-10 text-center">
            <CalendarClock
              aria-hidden="true"
              className="mx-auto text-[var(--color-brand)]"
              size={28}
            />
            <h3 className="mt-3 mb-0 text-base">
              No hay horarios configurados{" "}
              {view === "day" ? "para este día" : "en esta semana"}
            </h3>
            <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
              Podés elegir otro período o ajustar tus horarios habituales.
            </p>
          </div>
        ) : (
          <div className={view === "day" ? "" : "overflow-x-auto"}>
            <div className={view === "day" ? "min-w-0" : "min-w-[64rem]"}>
              <div
                className={`grid border-b border-[var(--color-border)] bg-[var(--color-brand-subtle)] ${calendarGridClassName}`}
              >
                <div aria-hidden="true" />
                {visibleDays.map((day) => (
                  <div
                    className="border-l border-[var(--color-border)] px-3 py-3 text-center"
                    key={day.date}
                  >
                    <strong className="block text-sm">{day.label}</strong>
                    <span className="mt-1 block text-xs text-[var(--color-muted)]">
                      {shortDateFormatter.format(
                        new Date(`${day.date}T12:00:00-03:00`),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className={`grid ${calendarGridClassName}`}>
              <svg
                aria-hidden="true"
                className="block w-full"
                height={calendarHeight}
                width="100%"
              >
                {hourMarkers.map((minutes) => {
                  const y = (minutes - calendarStart) * pixelsPerMinute;

                  return (
                    <text
                      className="fill-[var(--color-muted)] text-[0.68rem] font-semibold"
                      key={minutes}
                      textAnchor="end"
                      x="60"
                      y={Math.min(y + 4, calendarHeight - 4)}
                    >
                      {formatTime(minutes)}
                    </text>
                  );
                })}
              </svg>

              {visibleDays.map((day) => {
                const dayAvailability = configuration.availability.filter(
                  (block) => block.dayOfWeek === day.dayOfWeek,
                );
                const dayAppointments = appointments.filter(
                  (appointment) =>
                    formatArgentinaDateInput(new Date(appointment.startsAt)) ===
                    day.date,
                );
                const availableSlots = getAvailableAppointmentSlots({
                  date: day.date,
                  availability: configuration.availability,
                  appointments: appointmentOccupancy,
                  exceptionalBlocks,
                  durationMinutes:
                    configuration.defaultAppointmentDurationMinutes,
                  cleanupMinutes: configuration.defaultCleanupMinutes,
                  gridIntervalMinutes: configuration.gridIntervalMinutes,
                  now: currentTime,
                });
                const dayExceptionalBlocks = exceptionalBlocks.flatMap(
                  (block) => {
                    const segment = getExceptionalBlockSegmentForDate(
                      block,
                      day.date,
                    );

                    if (!segment) {
                      return [];
                    }

                    const startMinutes = Math.max(
                      segment.startMinutes,
                      calendarStart,
                    );
                    const endMinutes = Math.min(
                      segment.endMinutes,
                      calendarEnd,
                    );

                    return startMinutes < endMinutes
                      ? [{ block, startMinutes, endMinutes }]
                      : [];
                  },
                );

                return (
                  <svg
                    aria-label={`${day.label} ${day.date}`}
                    className="block w-full border-l border-[var(--color-border)] bg-[var(--color-brand-subtle)]"
                    height={calendarHeight}
                    key={day.date}
                    width="100%"
                  >
                    {dayAvailability.map((block) => {
                      const start = timeToMinutes(block.startTime);
                      const end = timeToMinutes(block.endTime);

                      return (
                        <rect
                          aria-hidden="true"
                          className="fill-white"
                          height={(end - start) * pixelsPerMinute}
                          key={`${block.startTime}-${block.endTime}`}
                          width="100%"
                          x="0"
                          y={(start - calendarStart) * pixelsPerMinute}
                        />
                      );
                    })}

                    {hourMarkers.map((minutes) => {
                      const y = (minutes - calendarStart) * pixelsPerMinute;

                      return (
                        <line
                          aria-hidden="true"
                          className="stroke-[var(--color-border)]"
                          key={minutes}
                          x1="0"
                          x2="100%"
                          y1={y}
                          y2={y}
                        />
                      );
                    })}

                    {dayExceptionalBlocks.map(
                      ({ block, startMinutes, endMinutes }) => {
                        const category = exceptionalBlockCategories.find(
                          ({ value }) => value === block.category,
                        );
                        const label = category?.label ?? "Bloqueo";
                        const y =
                          (startMinutes - calendarStart) * pixelsPerMinute;
                        const height =
                          (endMinutes - startMinutes) * pixelsPerMinute;

                        return (
                          <g
                            aria-label={`No disponible: ${label}. ${formatTime(startMinutes)} a ${formatTime(endMinutes)}.`}
                            key={block.id}
                            role="img"
                          >
                            <rect
                              className="pointer-events-none fill-[var(--color-neutral-soft)] stroke-[var(--color-muted)]"
                              height={height}
                              rx="7"
                              width="calc(100% - 10px)"
                              x="5"
                              y={y}
                            />
                            <foreignObject
                              className="pointer-events-none"
                              height={height}
                              width="calc(100% - 14px)"
                              x="7"
                              y={y}
                            >
                              <div className="h-full overflow-hidden px-2 py-2 text-[var(--color-foreground)]">
                                <strong className="block truncate text-xs">
                                  No disponible
                                </strong>
                                <span className="mt-0.5 block truncate text-[0.66rem] font-semibold">
                                  {label}
                                </span>
                              </div>
                            </foreignObject>
                          </g>
                        );
                      },
                    )}

                    {availableSlots.map((time) => {
                      const minutes = timeToMinutes(time);

                      return (
                        <Link
                          aria-label={`Crear turno el ${day.date} a las ${time}`}
                          href={buildAgendaPath({
                            weekStartDate: week.startDate,
                            view,
                            selectedDate: day.date,
                            params: {
                              nuevo: "1",
                              ...(view === "week" ? { fecha: day.date } : {}),
                              hora: time,
                            },
                          })}
                          key={time}
                        >
                          <rect
                            className="cursor-pointer fill-transparent stroke-transparent hover:fill-[var(--color-brand-soft)] hover:stroke-[var(--color-brand)] focus:fill-[var(--color-brand-soft)] focus:stroke-[var(--color-brand)]"
                            height={
                              configuration.gridIntervalMinutes *
                              pixelsPerMinute
                            }
                            rx="4"
                            width="calc(100% - 8px)"
                            x="4"
                            y={(minutes - calendarStart) * pixelsPerMinute}
                          />
                        </Link>
                      );
                    })}

                    {dayAppointments.map((appointment) => {
                      const parts = getArgentinaDateTimeParts(
                        new Date(appointment.startsAt),
                      );
                      const start = parts.hour * 60 + parts.minute;
                      const clinicalEnd = start + appointment.durationMinutes;
                      const occupiedMinutes =
                        appointment.durationMinutes +
                        appointment.cleanupMinutes;

                      const y =
                        (start - calendarStart) * pixelsPerMinute;
                      const occupiedHeight =
                        occupiedMinutes * pixelsPerMinute;
                      const cleanupHeight =
                        appointment.cleanupMinutes * pixelsPerMinute;
                      const appointmentReadOnly =
                        readOnlyAppointment ||
                        isHistoricalAppointment(appointment.status) ||
                        (appointment.status === "pending_confirmation" &&
                          !isPendingAppointmentManageable(
                            appointment,
                            currentTime,
                          ));

                      return (
                        <Link
                          aria-label={`${isHistoricalAppointment(appointment.status) ? "Ver historial de" : appointmentReadOnly || appointment.status === "confirmed" ? "Ver" : "Gestionar"} turno de ${appointment.patientLastName}, ${appointment.patientFirstName}`}
                          href={buildAgendaPath({
                            weekStartDate: week.startDate,
                            view,
                            selectedDate: day.date,
                            params: {
                              turno: appointment.id,
                              ...(appointmentReadOnly
                                ? { consulta: "1" }
                                : {}),
                            },
                          })}
                          key={appointment.id}
                        >
                          <g
                            aria-label={`${appointment.patientLastName}, ${appointment.patientFirstName}. ${formatTime(start)} a ${formatTime(clinicalEnd)}. Acondicionamiento hasta ${formatTime(start + occupiedMinutes)}.`}
                            role="img"
                          >
                            <rect
                              className={
                                appointment.status === "confirmed"
                                  ? "cursor-pointer fill-[var(--color-brand)] stroke-[var(--color-brand-dark)]"
                                  : appointment.status === "completed"
                                    ? "cursor-pointer fill-[var(--color-brand-subtle)] stroke-[var(--color-brand-dark)]"
                                    : appointment.status === "no_show"
                                      ? "cursor-pointer fill-[var(--color-warning-soft)] stroke-[var(--color-warning-foreground)]"
                                  : "cursor-pointer fill-[var(--color-brand-soft)] stroke-[var(--color-brand)]"
                              }
                              height={occupiedHeight}
                              rx="8"
                              width="calc(100% - 12px)"
                              x="6"
                              y={y}
                            />
                            {appointment.cleanupMinutes > 0 ? (
                              <rect
                                className="pointer-events-none fill-[rgb(20_125_115/18%)]"
                                height={cleanupHeight}
                                width="calc(100% - 14px)"
                                x="7"
                                y={y + occupiedHeight - cleanupHeight}
                              />
                            ) : null}
                            <foreignObject
                              className="pointer-events-none"
                              height={occupiedHeight}
                              width="calc(100% - 16px)"
                              x="8"
                              y={y}
                            >
                              <div
                                className={`h-full overflow-hidden px-2 py-2 ${appointment.status === "confirmed" ? "text-white" : appointment.status === "no_show" ? "text-[var(--color-warning-foreground)]" : "text-[var(--color-brand-dark)]"}`}
                              >
                                <strong className="block truncate text-xs">
                                  {appointment.patientLastName},{" "}
                                  {appointment.patientFirstName}
                                </strong>
                                <span className="mt-0.5 block truncate text-[0.66rem] font-semibold">
                                  {formatTime(start)}–{formatTime(clinicalEnd)} ·{" "}
                                  {getAppointmentSpecialtyLabel(
                                    appointment.specialty,
                                  )}
                                </span>
                                <span className="mt-0.5 block truncate text-[0.62rem] font-bold">
                                  {getAppointmentStatusLabel(appointment.status)}
                                </span>
                              </div>
                            </foreignObject>
                          </g>
                        </Link>
                      );
                    })}
                  </svg>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="mt-5">
        <section
          aria-labelledby="upcoming-appointments-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
        >
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Turnos {view === "day" ? "del día" : "de la semana"}
          </p>
          <h2 className="m-0 text-xl" id="upcoming-appointments-title">
            Agenda {view === "day" ? "del día" : "de la semana"}
          </h2>

          {visibleAppointments.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
              <CalendarClock
                aria-hidden="true"
                className="mx-auto text-[var(--color-brand)]"
                size={28}
              />
              <h3 className="mt-3 mb-0 text-base">
                No hay turnos{" "}
                {view === "day" ? "en este día" : "en esta semana"}
              </h3>
              <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                Elegí un espacio libre de la grilla o usá “Nuevo turno” para
                cargar el primero.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {visibleAppointments.map((appointment) => {
                const appointmentReadOnly =
                  readOnlyAppointment ||
                  isHistoricalAppointment(appointment.status) ||
                  (appointment.status === "pending_confirmation" &&
                    !isPendingAppointmentManageable(appointment, currentTime));

                return (
                  <article
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4"
                    key={appointment.id}
                  >
                  <p className="m-0 text-xs font-bold text-[var(--color-brand-dark)]">
                    {dateFormatter.format(new Date(appointment.startsAt))}
                  </p>
                  <h3 className="mt-2 mb-0 text-base">
                    {appointment.patientLastName},{" "}
                    {appointment.patientFirstName}
                  </h3>
                  <p className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                    {getAppointmentSpecialtyLabel(appointment.specialty)} ·{" "}
                    {appointment.durationMinutes} min +{" "}
                    {appointment.cleanupMinutes} min de acondicionamiento
                  </p>
                  <span className="mt-3 inline-flex rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[var(--color-brand-dark)]">
                    {getAppointmentStatusLabel(appointment.status)}
                  </span>
                  <Link
                    className="mt-3 flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-xs font-bold text-[var(--color-brand-dark)] no-underline"
                    href={buildAgendaPath({
                      weekStartDate: week.startDate,
                      view,
                      selectedDate:
                        view === "day"
                          ? day.date
                          : formatArgentinaDateInput(
                              new Date(appointment.startsAt),
                            ),
                      params: {
                        turno: appointment.id,
                        ...(appointmentReadOnly ? { consulta: "1" } : {}),
                      },
                    })}
                  >
                    {isHistoricalAppointment(appointment.status)
                      ? "Ver historial"
                      : appointmentReadOnly || appointment.status === "confirmed"
                        ? "Ver turno"
                        : "Gestionar turno"}
                  </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
