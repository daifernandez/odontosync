import Link from "next/link";

import { buildAgendaPath } from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  getAppointmentSpecialtyLabel,
  isPendingAppointmentAwaitingOutcome,
  isPendingAppointmentManageable,
  type Appointment,
} from "@/modules/appointments/domain/appointment";
import {
  getAvailableAppointmentWindows,
  getExceptionalBlockSegmentForDate,
  type AppointmentOccupancy,
} from "@/modules/appointments/domain/availability";
import {
  exceptionalBlockCategories,
  type ExceptionalBlock,
} from "@/modules/exceptional-blocks/domain/exceptional-block";
import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const linkClassName =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

export function DailyAgenda({
  date,
  weekStartDate,
  currentTime,
  appointments,
  appointmentOccupancy,
  availability,
  exceptionalBlocks,
  durationMinutes,
  cleanupMinutes,
  gridIntervalMinutes,
  preview = false,
  readOnly = false,
}: Readonly<{
  date: string;
  weekStartDate: string;
  currentTime: string;
  appointments: Appointment[];
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  exceptionalBlocks: ExceptionalBlock[];
  durationMinutes: number;
  cleanupMinutes: number;
  gridIntervalMinutes: number;
  preview?: boolean;
  readOnly?: boolean;
}>) {
  const now = new Date(currentTime);
  const windows = getAvailableAppointmentWindows({
    date,
    availability,
    appointments: appointmentOccupancy,
    exceptionalBlocks,
    durationMinutes,
    cleanupMinutes,
    gridIntervalMinutes,
    now,
  });
  const dayAppointments = appointments.filter(
    (appointment) =>
      formatArgentinaDateInput(new Date(appointment.startsAt)) === date &&
      appointment.status !== "cancelled" &&
      appointment.status !== "rescheduled",
  );
  const nextAppointmentId = dayAppointments
    .filter(
      (appointment) =>
        new Date(appointment.startsAt) > now &&
        (appointment.status === "confirmed" ||
          appointment.status === "pending_confirmation"),
    )
    .toSorted((left, right) => left.startsAt.localeCompare(right.startsAt))[0]
    ?.id;
  const blocks = exceptionalBlocks.flatMap((block) => {
    const segment = getExceptionalBlockSegmentForDate(block, date);
    return segment ? [{ block, segment }] : [];
  });
  const rows = [
    ...dayAppointments.map((appointment) => ({
      kind: "appointment" as const,
      time: timeFormatter.format(new Date(appointment.startsAt)),
      appointment,
    })),
    ...windows.map((window) => ({
      kind: "free" as const,
      time: window.startTime,
      window,
    })),
    ...blocks.map(({ block, segment }) => ({
      kind: "block" as const,
      time: `${String(Math.floor(segment.startMinutes / 60)).padStart(2, "0")}:${String(segment.startMinutes % 60).padStart(2, "0")}`,
      block,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const dayOfWeek = new Date(`${date}T12:00:00-03:00`).getUTCDay() || 7;
  const hasHours = availability.some((block) => block.dayOfWeek === dayOfWeek);

  return (
    <div className="p-4 md:p-5">
      {rows.length === 0 ? (
        <p className="m-0 py-4 text-sm text-[var(--color-muted)]">
          {hasHours
            ? "No hay turnos ni horarios disponibles para este día con la duración habitual. Probá otra fecha."
            : "No hay horarios configurados para este día. Podés elegir otra fecha o ajustar tus horarios."}
        </p>
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => {
          if (row.kind === "free") {
            const { window } = row;
            return (
              <article
                className="rounded-xl border border-dashed border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-3"
                key={`free-${row.time}`}
              >
                <h3 className="m-0 text-sm">
                  Libre · {window.startTime}–{window.endTime}
                </h3>
                <p className="mt-1 mb-0 text-xs text-[var(--color-muted)]">
                  Para {durationMinutes} min + {cleanupMinutes} min de
                  acondicionamiento
                </p>
                {!preview && !readOnly ? (
                  <>
                    <Link
                      className={`${linkClassName} mt-3`}
                      scroll={false}
                      href={buildAgendaPath({
                        weekStartDate,
                        view: "day",
                        selectedDate: date,
                        params: { nuevo: "1", hora: window.slots[0] },
                      })}
                    >
                      Reservar {window.slots[0]}
                    </Link>
                    {window.slots.length > 1 ? (
                      <details className="mt-1">
                        <summary className="flex min-h-11 cursor-pointer items-center text-xs font-semibold text-[var(--color-brand-dark)]">
                          Ver otros horarios de este hueco
                        </summary>
                        <div className="flex flex-wrap gap-2">
                          {window.slots.slice(1).map((time) => (
                            <Link
                              key={time}
                              className={linkClassName}
                              scroll={false}
                              href={buildAgendaPath({
                                weekStartDate,
                                view: "day",
                                selectedDate: date,
                                params: { nuevo: "1", hora: time },
                              })}
                            >
                              {time}
                            </Link>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </>
                ) : null}
              </article>
            );
          }
          if (row.kind === "block") {
            const category = exceptionalBlockCategories.find(
              (category) => category.value === row.block.category,
            )?.label;
            return (
              <article
                className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-3 text-[var(--color-warning-foreground)]"
                key={row.block.id}
              >
                <h3 className="m-0 text-sm">{row.time} · No disponible</h3>
                <p className="mt-1 mb-0 text-xs">{category}</p>
              </article>
            );
          }
          const { appointment } = row;
          const ended = new Date(appointment.occupiedUntil) <= now;
          const future = new Date(appointment.startsAt) > now;
          const awaitsOutcome = isPendingAppointmentAwaitingOutcome(
            appointment,
            now,
          );
          const historical =
            appointment.status === "completed" ||
            appointment.status === "no_show";
          const readonly =
            readOnly ||
            historical ||
            (appointment.status === "pending_confirmation" &&
              !isPendingAppointmentManageable(appointment, now) &&
              !awaitsOutcome);
          const status = awaitsOutcome
            ? "Pendiente de cierre"
            : appointment.status === "confirmed"
              ? "Confirmado"
              : appointment.status === "completed"
                ? "Atendido"
                : appointment.status === "no_show"
                  ? "Ausente"
                  : "Pendiente de confirmación";
          const action = readonly
            ? "Ver turno"
            : appointment.status === "confirmed" && future
              ? "Reprogramar"
              : ended
                ? "Registrar resultado"
                : "Gestionar turno";
          return (
            <article
              className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3"
              key={appointment.id}
            >
              <time
                className="text-sm font-bold"
                dateTime={appointment.startsAt}
              >
                {row.time}
              </time>
              <div className="min-w-0 border-l-3 border-[var(--color-brand)] pl-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="m-0 break-words text-base">
                    {appointment.patientLastName}, {appointment.patientFirstName}
                  </h3>
                  {appointment.id === nextAppointmentId ? (
                    <span className="text-[0.65rem] font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
                      Próximo turno
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 mb-0 text-xs text-[var(--color-muted)]">
                  {getAppointmentSpecialtyLabel(appointment.specialty)} ·{" "}
                  {appointment.durationMinutes} min
                </p>
                <p className="mt-1 mb-0 text-xs text-[var(--color-muted)]">
                  Acondicionamiento hasta{" "}
                  {timeFormatter.format(new Date(appointment.occupiedUntil))}
                </p>
                <span
                  className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-semibold ${appointment.status === "pending_confirmation" ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"}`}
                >
                  {status}
                </span>
                {!preview ? (
                  <div className="mt-2">
                    <Link
                      scroll={false}
                      className={linkClassName}
                      href={buildAgendaPath({
                        weekStartDate,
                        view: "day",
                        selectedDate: date,
                        params: {
                          turno: appointment.id,
                          ...(readonly ? { consulta: "1" } : {}),
                        },
                      })}
                    >
                      {action}
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      {rows.length > 0 && windows.length === 0 ? (
        <p className="mt-4 mb-0 text-sm text-[var(--color-muted)]">
          No hay huecos disponibles para la duración habitual. Podés elegir otro
          día.
        </p>
      ) : null}
    </div>
  );
}
