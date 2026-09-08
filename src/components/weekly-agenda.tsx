import {
  CalendarClock,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import {
  AgendaPageHeader,
  AgendaPrototypeNotice,
  AgendaViewToolbar,
} from "@/components/agenda-page-shell";
import { AppointmentManagementPanel } from "@/components/appointment-management-panel";
import { AppointmentPanel } from "@/components/appointment-panel";
import { AppointmentTimeline } from "@/components/appointment-timeline";
import { DailyAgenda } from "@/components/daily-agenda";
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
  isPendingAppointmentAwaitingOutcome,
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

const pixelsPerMinute = 1.2;

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function getAppointmentStatusLabel(appointment: Appointment, now: Date) {
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
  const calendarAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "rescheduled",
  );
  const dayAppointments = visibleAppointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "rescheduled",
  );
  const confirmedDayAppointments = dayAppointments.filter(
    (appointment) => appointment.status === "confirmed",
  ).length;
  const pendingDayAppointments = dayAppointments.filter(
    (appointment) => appointment.status === "pending_confirmation",
  ).length;
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
  const isCurrentDay = day.date === currentDay.date;
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

  const dailyAgendaProps = {
    date: day.date,
    weekStartDate: week.startDate,
    currentTime: currentTime.toISOString(),
    appointments: visibleAppointments,
    appointmentOccupancy,
    availability: configuration.availability,
    exceptionalBlocks,
    durationMinutes: configuration.defaultAppointmentDurationMinutes,
    cleanupMinutes: configuration.defaultCleanupMinutes,
    gridIntervalMinutes: configuration.gridIntervalMinutes,
    readOnly: readOnlyAppointment,
  };
  const dayContext =
    view === "day" ? (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)]">
        <h3 className="px-5 pt-5 text-base">
          Jornada · {day.label} {shortDateFormatter.format(firstDay)}
        </h3>
        <DailyAgenda {...dailyAgendaProps} preview />
      </div>
    ) : undefined;

  return (
    <main className="@container/daily-agenda mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <AgendaPageHeader
        actions={
          <>
            <AppointmentPanel
              context={dayContext}
              autoOpen={autoOpenNewAppointment}
              appointmentOccupancy={appointmentOccupancy}
              availability={configuration.availability}
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
          </>
        }
      />

      <AgendaViewToolbar
        currentHref={buildAgendaPath({
          weekStartDate: view === "day" ? currentDay.date : currentWeekStart,
          view,
          selectedDate: currentDay.date,
        })}
        dayHref={buildAgendaPath({
          weekStartDate: week.startDate,
          view: "day",
          selectedDate: day.date,
        })}
        monthHref={buildAgendaPath({
          view: "month",
          selectedDate: day.date,
        })}
        nextHref={
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
        nextLabel={view === "day" ? "Día siguiente" : "Semana siguiente"}
        previousHref={
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
        previousLabel={
          view === "day" ? "Día anterior" : "Semana anterior"
        }
        view={view}
        weekHref={buildAgendaPath({
          weekStartDate: week.startDate,
          view: "week",
          params: view === "day" ? { fecha: day.date } : undefined,
        })}
      />

      {selectedAppointment ? (
        <AppointmentManagementPanel
          context={dayContext}
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

      {created ||
      updated ||
      cancelled ||
      confirmed ||
      rescheduled ||
      closureStatus ||
      managementError ? (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm font-semibold ${managementError ? "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "border-[var(--color-border)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"}`}
          role={managementError ? "alert" : "status"}
        >
          {created
            ? "El turno pendiente se guardó correctamente."
            : updated
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
                        : closureStatus === "cancelled"
                          ? "El turno quedó registrado como cancelado."
                          : "No pudimos gestionar ese turno. Actualizá la agenda e intentá nuevamente."}
        </div>
      ) : null}

      <AgendaPrototypeNotice />

      <section
        aria-labelledby="agenda-calendar-title"
        className="mt-5 overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      >
        <div className="border-b border-[var(--color-border)] p-4 @sm/daily-agenda:p-6">
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            {view === "day" ? "Día seleccionado" : "Semana seleccionada"}
          </p>
          <h2 className="m-0 text-xl" id="agenda-calendar-title">
            {view === "day"
              ? `${day.label}, ${weekTitleFormatter.format(firstDay)}`
              : `${weekTitleFormatter.format(firstDay)} — ${weekTitleFormatter.format(lastDay)}`}
          </h2>
          {view === "day" ? (
            <p className="mt-3 mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
              <strong className="text-[var(--color-foreground)]">
                {dayAppointments.length}{" "}
                {dayAppointments.length === 1 ? "turno" : "turnos"}{" "}
                {isCurrentDay ? "hoy" : "en este día"}
              </strong>
              <span aria-hidden="true">·</span>
              <span>
                {confirmedDayAppointments}{" "}
                {confirmedDayAppointments === 1
                  ? "confirmado"
                  : "confirmados"}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {pendingDayAppointments}{" "}
                {pendingDayAppointments === 1 ? "pendiente" : "pendientes"}{" "}
                de confirmación
              </span>
            </p>
          ) : null}
        </div>

        {view === "day" ? (
          <DailyAgenda {...dailyAgendaProps} />
        ) : !hasCalendarAvailability ? (
          <div className="px-5 py-10 text-center">
            <CalendarClock
              aria-hidden="true"
              className="mx-auto text-[var(--color-brand)]"
              size={28}
            />
            <h3 className="mt-3 mb-0 text-base">
              No hay horarios configurados en esta semana
            </h3>
            <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
              Podés elegir otro período o ajustar tus horarios habituales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[64rem]">
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
                const dayAppointments = calendarAppointments.filter(
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
                      const appointmentAwaitsOutcome =
                        isPendingAppointmentAwaitingOutcome(
                          appointment,
                          currentTime,
                        );
                      const appointmentReadOnly =
                        readOnlyAppointment ||
                        isHistoricalAppointment(appointment.status) ||
                        (appointment.status === "pending_confirmation" &&
                          !isPendingAppointmentManageable(
                            appointment,
                            currentTime,
                          ) &&
                          !appointmentAwaitsOutcome);

                      return (
                        <Link
                          aria-label={`${isHistoricalAppointment(appointment.status) ? "Ver historial de" : appointmentAwaitsOutcome ? "Registrar resultado de" : appointmentReadOnly || appointment.status === "confirmed" ? "Ver" : "Gestionar"} turno de ${appointment.patientLastName}, ${appointment.patientFirstName}`}
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
                                  {getAppointmentStatusLabel(
                                    appointment,
                                    currentTime,
                                  )}
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

      {view === "day" ? <details className="mt-5 rounded-xl border border-[var(--color-border)] bg-white p-4"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--color-brand-dark)]">Seguimiento y cambios de la jornada</summary>
        <AppointmentTimeline
          appointments={visibleAppointments}
          currentTime={currentTime.toISOString()}
          days={visibleDays.map(({ date, label }) => ({ date, label }))}
          readOnlyAppointment={readOnlyAppointment}
          selectedDate={day.date}
          view={view}
          weekStartDate={week.startDate}
        /></details> : (      <div className="mt-5">
        <AppointmentTimeline
          appointments={visibleAppointments}
          currentTime={currentTime.toISOString()}
          days={visibleDays.map(({ date, label }) => ({ date, label }))}
          readOnlyAppointment={readOnlyAppointment}
          selectedDate={day.date}
          view={view}
          weekStartDate={week.startDate}
        />
      </div>)}

    </main>
  );
}
