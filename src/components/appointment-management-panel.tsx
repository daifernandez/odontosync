"use client";

import { CalendarClock, CheckCircle2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { AgendaContextFields } from "@/components/agenda-context-fields";
import {
  buildAgendaPath,
  type AgendaView,
} from "@/modules/agenda/domain/weekly-schedule";
import {
  cancelAppointmentAction,
  closeAppointmentAction,
  confirmAppointmentAction,
  rescheduleAppointmentAction,
  updateAppointmentAction,
} from "@/modules/appointments/actions";
import {
  appointmentFormState,
  appointmentRescheduleState,
  appointmentSpecialties,
  formatArgentinaDateInput,
  getArgentinaDateTimeParts,
  getAppointmentSpecialtyLabel,
  isPendingAppointmentAwaitingOutcome,
  isPendingAppointmentManageable,
  type Appointment,
} from "@/modules/appointments/domain/appointment";
import {
  getAvailableAppointmentSlots,
  type AppointmentOccupancy,
  type ExceptionalBlockOccupancy,
} from "@/modules/appointments/domain/availability";
import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

export function AppointmentManagementPanel({
  appointment,
  appointmentOccupancy,
  availability,
  currentTime,
  exceptionalBlocks,
  gridIntervalMinutes,
  minimumDate,
  readOnly = false,
  selectedDate,
  view = "week",
  weekStartDate,
}: Readonly<{
  appointment: Appointment;
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  currentTime: string;
  exceptionalBlocks: ExceptionalBlockOccupancy[];
  gridIntervalMinutes: number;
  minimumDate: string;
  readOnly?: boolean;
  selectedDate?: string;
  view?: AgendaView;
  weekStartDate: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const now = new Date(currentTime);
  const isPendingManageable =
    isPendingAppointmentManageable(appointment, now) && !readOnly;
  const pendingAwaitsOutcome = isPendingAppointmentAwaitingOutcome(
    appointment,
    now,
  );
  const canRecordPendingOutcome = pendingAwaitsOutcome && !readOnly;
  const isConfirmed = appointment.status === "confirmed" && !readOnly;
  const initialDate = formatArgentinaDateInput(new Date(appointment.startsAt));
  const initialParts = getArgentinaDateTimeParts(new Date(appointment.startsAt));
  const initialTime = `${String(initialParts.hour).padStart(2, "0")}:${String(initialParts.minute).padStart(2, "0")}`;
  const [state, action] = useActionState(
    updateAppointmentAction,
    appointmentFormState,
  );
  const [rescheduleState, rescheduleAction] = useActionState(
    rescheduleAppointmentAction,
    appointmentRescheduleState,
  );
  const [date, setDate] = useState(initialDate);
  const [startsAt, setStartsAt] = useState(
    isConfirmed ? "" : `${initialDate}T${initialTime}`,
  );
  const [durationMinutes, setDurationMinutes] = useState(
    String(appointment.durationMinutes),
  );
  const [cleanupMinutes, setCleanupMinutes] = useState(
    String(appointment.cleanupMinutes),
  );
  const [confirmCancellation, setConfirmCancellation] = useState(false);
  const specialtyOptions =
    appointment.specialty === "general"
      ? [
          {
            value: "general" as const,
            label: "Odontología general (turno existente)",
          },
          ...appointmentSpecialties,
        ]
      : appointmentSpecialties;
  const availableSlots = getAvailableAppointmentSlots({
    date,
    availability,
    appointments: appointmentOccupancy,
    exceptionalBlocks,
    durationMinutes: Number(durationMinutes),
    cleanupMinutes: Number(cleanupMinutes),
    gridIntervalMinutes,
    now,
  });
  const rescheduleSlots = getAvailableAppointmentSlots({
    date,
    availability,
    appointments: [],
    exceptionalBlocks,
    durationMinutes: appointment.durationMinutes,
    cleanupMinutes: appointment.cleanupMinutes,
    gridIntervalMinutes,
    now,
  }).filter((time) => `${date}T${time}` !== `${initialDate}T${initialTime}`);
  const overlapRequiresConfirmation =
    rescheduleState.status === "overlap" &&
    rescheduleState.values?.startsAt === startsAt;
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(appointment.startsAt));
  const canCancel =
    isConfirmed &&
    new Date(appointment.startsAt).getTime() > now.getTime();
  const canClose =
    (isConfirmed || canRecordPendingOutcome) &&
    new Date(appointment.occupiedUntil).getTime() <= now.getTime();
  const canReschedule = canCancel;
  const statusTitle =
    appointment.status === "pending_confirmation"
      ? pendingAwaitsOutcome
        ? "Pendiente de cierre"
        : isPendingManageable
          ? "Turno pendiente"
          : "Turno en curso"
      : appointment.status === "completed"
        ? "Turno atendido"
      : appointment.status === "no_show"
          ? "Paciente ausente"
          : appointment.status === "cancelled"
            ? "Turno cancelado"
            : appointment.status === "rescheduled"
              ? "Turno reprogramado"
          : "Turno confirmado";
  const StatusIcon =
    appointment.status === "no_show" ? CalendarClock : CheckCircle2;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closePanel() {
    dialogRef.current?.close();
  }

  const cancellationSection = (
    <section className="mt-6 border-t border-[var(--color-border)] pt-6">
      <h3 className="m-0 text-base">Cancelar turno</h3>
      <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
        El horario se liberará, pero el registro no se eliminará.
      </p>
      {!confirmCancellation ? (
        <button
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700"
          onClick={() => setConfirmCancellation(true)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={17} />
          Quiero cancelar el turno
        </button>
      ) : (
        <form
          action={cancelAppointmentAction}
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <input name="appointmentId" type="hidden" value={appointment.id} />
          <AgendaContextFields
            selectedDate={selectedDate ?? weekStartDate}
            view={view}
            weekStartDate={weekStartDate}
          />
          <p className="m-0 text-sm font-semibold text-red-800">
            ¿Confirmás que este paciente canceló el turno?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="min-h-11 cursor-pointer rounded-xl border-0 bg-red-700 px-4 text-sm font-bold text-white"
              type="submit"
            >
              Sí, cancelar turno
            </button>
            <button
              className="min-h-11 cursor-pointer rounded-xl border border-red-200 bg-white px-4 text-sm font-bold"
              onClick={() => setConfirmCancellation(false)}
              type="button"
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </section>
  );

  return (
    <dialog
      aria-labelledby="manage-appointment-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-xl overflow-hidden border-0 bg-white p-0 text-[var(--color-foreground)] shadow-[-1rem_0_3rem_rgb(24_51_48/18%)] backdrop:bg-[rgb(24_51_48/45%)]"
      onClose={() =>
        router.replace(
          buildAgendaPath({ weekStartDate, view, selectedDate }),
          { scroll: false },
        )
      }
      ref={dialogRef}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 md:px-7">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Gestión del turno
            </p>
            <h2 className="m-0 text-2xl" id="manage-appointment-title">
              {appointment.patientLastName}, {appointment.patientFirstName}
            </h2>
            <p className="mt-2 mb-0 text-sm text-[var(--color-muted)]">
              {isPendingManageable
                ? "Modificá, confirmá o cancelá el turno sin eliminar el registro."
                : canRecordPendingOutcome
                  ? "Registrá qué ocurrió para incorporar el turno al historial."
                : appointment.status === "pending_confirmation"
                  ? pendingAwaitsOutcome
                    ? "Consultá este turno pendiente de cierre en modo de solo lectura."
                    : "Consultá este turno en curso en modo de solo lectura."
                : isConfirmed
                  ? canClose
                    ? "Consultá los datos y registrá el resultado del turno."
                    : "Consultá los datos del turno confirmado."
                  : "Consultá este registro histórico del turno."}
            </p>
          </div>
          <button
            aria-label="Cerrar gestión del turno"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-border)] bg-white"
            onClick={closePanel}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          {!isPendingManageable ? (
            <section aria-labelledby="appointment-status-title">
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${appointment.status === "no_show" ? "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "border-[var(--color-border)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"}`}
              >
                <StatusIcon aria-hidden="true" className="shrink-0" size={20} />
                <h3 className="m-0 text-base" id="appointment-status-title">
                  {statusTitle}
                </h3>
              </div>
              <dl className="mt-5 grid gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4 text-sm">
                <div>
                  <dt className="font-semibold text-[var(--color-muted)]">
                    Fecha y horario
                  </dt>
                  <dd
                    className="mt-1 ml-0 font-bold"
                    suppressHydrationWarning
                  >
                    {formattedDate}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--color-muted)]">
                    Área odontológica
                  </dt>
                  <dd className="mt-1 ml-0 font-bold">
                    {getAppointmentSpecialtyLabel(appointment.specialty)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--color-muted)]">
                    Duración reservada
                  </dt>
                  <dd className="mt-1 ml-0 font-bold">
                    {appointment.durationMinutes} min + {appointment.cleanupMinutes} min de acondicionamiento
                  </dd>
                </div>
              </dl>

              {isConfirmed || canRecordPendingOutcome ? (
                <>
                  {canClose ? (
                    <details className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-4">
                      <summary className="cursor-pointer text-sm font-bold text-[var(--color-brand-dark)]">
                        {canRecordPendingOutcome
                          ? "Registrar resultado"
                          : "Cerrar turno"}
                      </summary>
                      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        <p className="m-0 text-sm leading-6 text-[var(--color-muted)]">
                          Esta decisión no se puede deshacer. Elegí el resultado
                          administrativo que corresponda.
                        </p>
                        <div
                          className={`mt-3 grid gap-2 ${canRecordPendingOutcome ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
                        >
                          <form action={closeAppointmentAction}>
                            <input
                              name="appointmentId"
                              type="hidden"
                              value={appointment.id}
                            />
                            <AgendaContextFields
                              selectedDate={selectedDate ?? weekStartDate}
                              view={view}
                              weekStartDate={weekStartDate}
                            />
                            <input
                              name="closureStatus"
                              type="hidden"
                              value="completed"
                            />
                            <SubmitButton pendingLabel="Registrando atención…">
                              Marcar como atendido
                            </SubmitButton>
                          </form>
                          <form action={closeAppointmentAction}>
                            <input
                              name="appointmentId"
                              type="hidden"
                              value={appointment.id}
                            />
                            <AgendaContextFields
                              selectedDate={selectedDate ?? weekStartDate}
                              view={view}
                              weekStartDate={weekStartDate}
                            />
                            <input
                              name="closureStatus"
                              type="hidden"
                              value="no_show"
                            />
                            <SubmitButton pendingLabel="Registrando ausencia…">
                              Marcar como ausente
                            </SubmitButton>
                          </form>
                          {canRecordPendingOutcome ? (
                            <form action={closeAppointmentAction}>
                              <input
                                name="appointmentId"
                                type="hidden"
                                value={appointment.id}
                              />
                              <AgendaContextFields
                                selectedDate={selectedDate ?? weekStartDate}
                                view={view}
                                weekStartDate={weekStartDate}
                              />
                              <input
                                name="closureStatus"
                                type="hidden"
                                value="cancelled"
                              />
                              <SubmitButton pendingLabel="Registrando cancelación…">
                                Registrar cancelación
                              </SubmitButton>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  ) : (
                    <p className="mt-5 mb-0 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
                      Podrás cerrarlo cuando finalice todo el horario reservado,
                      incluido el acondicionamiento.
                    </p>
                  )}
                  {canReschedule ? (
                    <details className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-4">
                      <summary className="cursor-pointer text-sm font-bold text-[var(--color-brand-dark)]">
                        Reprogramar turno
                      </summary>
                      <form
                        action={rescheduleAction}
                        className="mt-4 border-t border-[var(--color-border)] pt-4"
                        noValidate
                      >
                        <input
                          name="appointmentId"
                          type="hidden"
                          value={appointment.id}
                        />
                        <AgendaContextFields
                          selectedDate={selectedDate ?? weekStartDate}
                          view={view}
                          weekStartDate={weekStartDate}
                        />
                        <p className="m-0 text-sm leading-6 text-[var(--color-muted)]">
                          Elegí la nueva fecha y el nuevo horario. El turno
                          actual quedará como reprogramado y se creará otro
                          pendiente, sin cambiar sus demás datos.
                        </p>

                        {rescheduleState.message ? (
                          <p
                            className="mt-4 mb-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
                            role="alert"
                          >
                            {rescheduleState.message}
                          </p>
                        ) : null}

                        <label className="mt-4 block text-sm font-semibold">
                          Nueva fecha
                          <input
                            className={inputClassName}
                            min={minimumDate}
                            onInput={(event) => {
                              setDate(event.currentTarget.value);
                              setStartsAt("");
                            }}
                            type="date"
                            value={date}
                          />
                        </label>

                        <fieldset
                          aria-describedby={`reschedule-slots-help${rescheduleState.fieldErrors.startsAt ? " reschedule-slots-error" : ""}`}
                          aria-invalid={
                            rescheduleState.fieldErrors.startsAt
                              ? "true"
                              : undefined
                          }
                          className="mt-4 border-0 p-0"
                        >
                          <legend className="text-sm font-semibold">
                            Nuevo horario
                          </legend>
                          <p
                            className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]"
                            id="reschedule-slots-help"
                          >
                            Los horarios ocupados requieren una confirmación
                            adicional antes de guardar.
                          </p>
                          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {rescheduleSlots.map((time) => {
                              const value = `${date}T${time}`;
                              const isOccupied = !availableSlots.includes(time);

                              return (
                                <label className="cursor-pointer" key={time}>
                                  <input
                                    checked={startsAt === value}
                                    className="peer sr-only"
                                    name="startsAt"
                                    onChange={(event) =>
                                      setStartsAt(event.target.value)
                                    }
                                    type="radio"
                                    value={value}
                                  />
                                  <span
                                    className={`flex min-h-11 flex-col items-center justify-center rounded-xl border bg-white text-sm font-bold peer-checked:border-[var(--color-brand)] peer-checked:bg-[var(--color-brand-soft)] ${isOccupied ? "border-[var(--color-warning-border)] text-[var(--color-warning-foreground)]" : "border-[var(--color-border)]"}`}
                                  >
                                    {time}
                                    {isOccupied ? (
                                      <small className="text-[0.62rem] font-semibold">
                                        Ocupado
                                      </small>
                                    ) : null}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          {rescheduleSlots.length === 0 ? (
                            <p className="mt-3 mb-0 text-sm text-[var(--color-muted)]">
                              No hay otros horarios configurados para esta fecha.
                            </p>
                          ) : null}
                          {rescheduleState.fieldErrors.startsAt ? (
                            <p
                              className="mt-2 mb-0 text-xs text-red-700"
                              id="reschedule-slots-error"
                            >
                              {rescheduleState.fieldErrors.startsAt}
                            </p>
                          ) : null}
                        </fieldset>

                        {overlapRequiresConfirmation ? (
                          <input
                            name="overlapConfirmed"
                            type="hidden"
                            value="true"
                          />
                        ) : null}
                        <SubmitButton
                          pendingLabel={
                            overlapRequiresConfirmation
                              ? "Confirmando superposición…"
                              : "Reprogramando turno…"
                          }
                        >
                          {overlapRequiresConfirmation
                            ? "Confirmar superposición y reprogramar"
                            : "Reprogramar turno"}
                        </SubmitButton>
                      </form>
                    </details>
                  ) : null}
                  {canCancel ? cancellationSection : null}
                </>
              ) : (
                <p className="mt-5 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                  {appointment.status === "pending_confirmation"
                    ? "Podrás registrar el resultado cuando finalice todo el horario reservado, incluido el acondicionamiento."
                    : "Este estado forma parte del historial y no admite cambios."}
                </p>
              )}
            </section>
          ) : (
            <>
          <form action={action} className="flex flex-col gap-4" noValidate>
            <input name="appointmentId" type="hidden" value={appointment.id} />
            <AgendaContextFields
              selectedDate={selectedDate ?? weekStartDate}
              view={view}
              weekStartDate={weekStartDate}
            />

            {state.message ? (
              <p
                className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}

            <label className="text-sm font-semibold">
              Área odontológica
              <select
                className={inputClassName}
                defaultValue={appointment.specialty}
                name="specialty"
              >
                {specialtyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Duración estimada
                <input
                  className={inputClassName}
                  max={1440}
                  min={1}
                  name="durationMinutes"
                  onChange={(event) => {
                    setDurationMinutes(event.target.value);
                    setStartsAt("");
                  }}
                  type="number"
                  value={durationMinutes}
                />
              </label>
              <label className="text-sm font-semibold">
                Acondicionamiento
                <input
                  className={inputClassName}
                  max={1440}
                  min={0}
                  name="cleanupMinutes"
                  onChange={(event) => {
                    setCleanupMinutes(event.target.value);
                    setStartsAt("");
                  }}
                  type="number"
                  value={cleanupMinutes}
                />
              </label>
            </div>

            <label className="text-sm font-semibold">
              Fecha
              <input
                className={inputClassName}
                min={minimumDate}
                onInput={(event) => {
                  setDate(event.currentTarget.value);
                  setStartsAt("");
                }}
                type="date"
                value={date}
              />
            </label>

            <fieldset className="border-0 p-0">
              <legend className="text-sm font-semibold">
                Horarios disponibles
              </legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((time) => {
                  const value = `${date}T${time}`;

                  return (
                    <label className="cursor-pointer" key={time}>
                      <input
                        checked={startsAt === value}
                        className="peer sr-only"
                        name="startsAt"
                        onChange={(event) => setStartsAt(event.target.value)}
                        type="radio"
                        value={value}
                      />
                      <span className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-sm font-bold peer-checked:border-[var(--color-brand)] peer-checked:bg-[var(--color-brand-soft)]">
                        {time}
                      </span>
                    </label>
                  );
                })}
              </div>
              {availableSlots.length === 0 ? (
                <p className="mt-3 mb-0 text-sm text-[var(--color-muted)]">
                  No hay horarios disponibles para esta duración y fecha.
                </p>
              ) : null}
            </fieldset>

            <SubmitButton pendingLabel="Guardando cambios…">
              Guardar cambios
            </SubmitButton>
          </form>

          <section className="mt-6 border-t border-[var(--color-border)] pt-6">
            <h3 className="m-0 text-base">Confirmar turno</h3>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
              Al confirmar, el horario seguirá reservado y el turno pasará a
              modo de lectura.
            </p>
            <form action={confirmAppointmentAction} className="mt-4">
              <input
                name="appointmentId"
                type="hidden"
                value={appointment.id}
              />
              <AgendaContextFields
                selectedDate={selectedDate ?? weekStartDate}
                view={view}
                weekStartDate={weekStartDate}
              />
              <SubmitButton pendingLabel="Confirmando turno…">
                Confirmar turno
              </SubmitButton>
            </form>
          </section>

            {cancellationSection}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
