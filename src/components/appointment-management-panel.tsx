"use client";

import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import {
  cancelAppointmentAction,
  updateAppointmentAction,
} from "@/modules/appointments/actions";
import {
  appointmentFormState,
  appointmentSpecialties,
  formatArgentinaDateInput,
  getArgentinaDateTimeParts,
  type Appointment,
} from "@/modules/appointments/domain/appointment";
import {
  getAvailableAppointmentSlots,
  type AppointmentOccupancy,
} from "@/modules/appointments/domain/availability";
import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

export function AppointmentManagementPanel({
  appointment,
  appointmentOccupancy,
  availability,
  currentTime,
  gridIntervalMinutes,
  minimumDate,
  weekStartDate,
}: Readonly<{
  appointment: Appointment;
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  currentTime: string;
  gridIntervalMinutes: number;
  minimumDate: string;
  weekStartDate: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const initialDate = formatArgentinaDateInput(new Date(appointment.startsAt));
  const initialParts = getArgentinaDateTimeParts(new Date(appointment.startsAt));
  const initialTime = `${String(initialParts.hour).padStart(2, "0")}:${String(initialParts.minute).padStart(2, "0")}`;
  const [state, action] = useActionState(
    updateAppointmentAction,
    appointmentFormState,
  );
  const [date, setDate] = useState(initialDate);
  const [startsAt, setStartsAt] = useState(`${initialDate}T${initialTime}`);
  const [durationMinutes, setDurationMinutes] = useState(
    String(appointment.durationMinutes),
  );
  const [cleanupMinutes, setCleanupMinutes] = useState(
    String(appointment.cleanupMinutes),
  );
  const [confirmCancellation, setConfirmCancellation] = useState(false);
  const availableSlots = getAvailableAppointmentSlots({
    date,
    availability,
    appointments: appointmentOccupancy,
    durationMinutes: Number(durationMinutes),
    cleanupMinutes: Number(cleanupMinutes),
    gridIntervalMinutes,
    now: new Date(currentTime),
  });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closePanel() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      aria-labelledby="manage-appointment-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-xl overflow-hidden border-0 bg-white p-0 text-[var(--color-foreground)] shadow-[-1rem_0_3rem_rgb(24_51_48/18%)] backdrop:bg-[rgb(24_51_48/45%)]"
      onClose={() =>
        router.replace(`/app/agenda?semana=${weekStartDate}`, {
          scroll: false,
        })
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
              Modificá el horario o cancelá sin eliminar el registro.
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
          <form action={action} className="flex flex-col gap-4" noValidate>
            <input name="appointmentId" type="hidden" value={appointment.id} />
            <input name="weekStartDate" type="hidden" value={weekStartDate} />

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
                {appointmentSpecialties.map((option) => (
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
                <input
                  name="appointmentId"
                  type="hidden"
                  value={appointment.id}
                />
                <input
                  name="weekStartDate"
                  type="hidden"
                  value={weekStartDate}
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
        </div>
      </div>
    </dialog>
  );
}
