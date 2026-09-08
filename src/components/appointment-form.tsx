"use client";

import { useActionState, useState } from "react";

import { preserveFormValues } from "@/components/preserve-form-values";
import { SubmitButton } from "@/components/auth/submit-button";
import { AgendaContextFields } from "@/components/agenda-context-fields";
import type { AgendaView } from "@/modules/agenda/domain/weekly-schedule";
import { createAppointmentAction } from "@/modules/appointments/actions";
import {
  appointmentFormState,
  appointmentSpecialties,
} from "@/modules/appointments/domain/appointment";
import {
  getAvailableAppointmentSlots,
  type AppointmentOccupancy,
  type ExceptionalBlockOccupancy,
} from "@/modules/appointments/domain/availability";
import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";
import type { Patient } from "@/modules/patients/domain/patient";

type AppointmentPatientOption = Pick<Patient, "id" | "firstName" | "lastName">;
const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-base text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="mt-2 block text-xs font-normal text-red-700" id={id}>
      {message}
    </span>
  ) : null;
}

export function AppointmentForm({
  appointmentOccupancy,
  availability,
  currentTime,
  exceptionalBlocks,
  initialPatientId = "",
  patients,
  defaultDurationMinutes,
  defaultCleanupMinutes,
  gridIntervalMinutes,
  initialDate = "",
  initialTime = "",
  minimumDate,
  selectedDate,
  view = "week",
  weekStartDate,
}: Readonly<{
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  currentTime: string;
  exceptionalBlocks: ExceptionalBlockOccupancy[];
  initialPatientId?: string;
  patients: AppointmentPatientOption[];
  defaultDurationMinutes: number;
  defaultCleanupMinutes: number;
  gridIntervalMinutes: number;
  initialDate?: string;
  initialTime?: string;
  minimumDate: string;
  selectedDate?: string;
  view?: AgendaView;
  weekStartDate?: string;
}>) {
  const [state, action] = useActionState(
    createAppointmentAction,
    appointmentFormState,
  );
  const [patientId, setPatientId] = useState(initialPatientId);
  const [date, setDate] = useState(initialDate);
  const [startsAt, setStartsAt] = useState(
    initialDate && initialTime ? `${initialDate}T${initialTime}` : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    String(defaultDurationMinutes),
  );
  const [cleanupMinutes, setCleanupMinutes] = useState(
    String(defaultCleanupMinutes),
  );
  const [specialty, setSpecialty] = useState("restorative");
  const selectedPatient = patients.find((patient) => patient.id === patientId);
  const availableSlots = getAvailableAppointmentSlots({
    date,
    availability,
    appointments: appointmentOccupancy,
    exceptionalBlocks,
    durationMinutes: Number(durationMinutes),
    cleanupMinutes: Number(cleanupMinutes),
    gridIntervalMinutes,
    now: new Date(currentTime),
  });
  const validStartsAt =
    startsAt.startsWith(`${date}T`) &&
    availableSlots.includes(startsAt.slice(11, 16))
      ? startsAt
      : "";
  const invalidSelection = Boolean(startsAt && !validStartsAt);
  const formattedStart = validStartsAt
    ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} a las ${validStartsAt.slice(11, 16)}`
    : "Fecha y hora pendientes";
  const occupiedEnd = validStartsAt
    ? new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(
        new Date(
          new Date(`${validStartsAt}:00-03:00`).getTime() +
            (Number(durationMinutes) + Number(cleanupMinutes)) * 60_000,
        ),
      )
    : "";

  return (
    <form
      action={action}
      className="flex flex-col gap-4"
      ref={preserveFormValues}
      noValidate
    >
      {weekStartDate ? (
        <AgendaContextFields
          selectedDate={selectedDate ?? weekStartDate}
          view={view}
          weekStartDate={weekStartDate}
        />
      ) : null}
      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <section
        aria-label="Horario elegido"
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] p-4"
      >
        <p className="m-0 text-sm font-bold">{formattedStart}</p>
        <p className="mt-1 mb-0 text-xs leading-5 text-[var(--color-muted)]">
          {occupiedEnd ? `Reservado hasta ${occupiedEnd} · ` : ""}
          {durationMinutes || "0"} min + {cleanupMinutes || "0"} min de
          acondicionamiento
        </p>
      </section>
      <label className="text-sm font-semibold">
        Paciente ficticio
        <select
          aria-describedby={
            state.fieldErrors.patientId
              ? "appointment-patient-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.patientId)}
          className={inputClassName}
          value={patientId}
          name="patientId"
          onChange={(event) => setPatientId(event.target.value)}
        >
          <option value="">Elegí un paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.lastName}, {patient.firstName}
            </option>
          ))}
        </select>
        <FieldError
          id="appointment-patient-error"
          message={state.fieldErrors.patientId}
        />
      </label>
      <label className="text-sm font-semibold">
        Área odontológica
        <select
          aria-describedby={
            state.fieldErrors.specialty
              ? "appointment-specialty-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.specialty)}
          className={inputClassName}
          value={specialty}
          name="specialty"
          onChange={(event) => setSpecialty(event.target.value)}
        >
          {appointmentSpecialties.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError
          id="appointment-specialty-error"
          message={state.fieldErrors.specialty}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">
          Duración estimada <span className="text-xs font-normal">(min)</span>
          <input
            aria-describedby={
              state.fieldErrors.durationMinutes
                ? "appointment-duration-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.durationMinutes)}
            className={inputClassName}
            min={1}
            max={1440}
            value={durationMinutes}
            name="durationMinutes"
            onChange={(event) => setDurationMinutes(event.target.value)}
            type="number"
          />
          <FieldError
            id="appointment-duration-error"
            message={state.fieldErrors.durationMinutes}
          />
        </label>
        <label className="text-sm font-semibold">
          Acondicionamiento <span className="text-xs font-normal">(min)</span>
          <input
            aria-describedby={
              state.fieldErrors.cleanupMinutes
                ? "appointment-cleanup-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.cleanupMinutes)}
            className={inputClassName}
            min={0}
            max={1440}
            value={cleanupMinutes}
            name="cleanupMinutes"
            onChange={(event) => setCleanupMinutes(event.target.value)}
            type="number"
          />
          <FieldError
            id="appointment-cleanup-error"
            message={state.fieldErrors.cleanupMinutes}
          />
        </label>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={
          invalidSelection
            ? "rounded-xl bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-foreground)]"
            : "sr-only"
        }
      >
        {invalidSelection
          ? `El horario ${startsAt.slice(11, 16)} ya no está disponible para la duración y el acondicionamiento elegidos. Elegí otro horario.`
          : ""}
      </div>
      <details
        className="border-t border-[var(--color-border)] pt-2"
        open={!validStartsAt || Boolean(state.fieldErrors.startsAt)}
      >
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--color-brand-dark)]">
          Cambiar fecha u horario
        </summary>
        <label className="block text-sm font-semibold">
          Fecha
          <input
            className={inputClassName}
            min={minimumDate}
            onChange={(event) => {
              setDate(event.target.value);
              setStartsAt("");
            }}
            type="date"
            value={date}
          />
        </label>
        <fieldset
          aria-describedby={
            state.fieldErrors.startsAt ? "appointment-start-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.startsAt)}
          className="mt-4 border-0 p-0"
        >
          <legend className="text-sm font-semibold">
            Horarios disponibles
          </legend>
          {!date ? (
            <p className="text-sm text-[var(--color-muted)]">
              Elegí una fecha para ver los horarios libres.
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No hay horarios disponibles para esta fecha con la duración
              elegida. Probá otro día.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availableSlots.map((time) => (
                <label className="cursor-pointer" key={time}>
                  <input
                    checked={validStartsAt === `${date}T${time}`}
                    className="peer sr-only"
                    name="startsAt"
                    onChange={(event) => setStartsAt(event.target.value)}
                    type="radio"
                    value={`${date}T${time}`}
                  />
                  <span className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-2 text-sm font-bold text-[var(--color-brand-dark)] peer-checked:border-[var(--color-brand)] peer-checked:bg-[var(--color-brand-soft)] peer-focus-visible:ring-3 peer-focus-visible:ring-[var(--color-brand)]">
                    {time}
                  </span>
                </label>
              ))}
            </div>
          )}
          <FieldError
            id="appointment-start-error"
            message={state.fieldErrors.startsAt}
          />
        </fieldset>
      </details>
      <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-white pt-3 pb-2">
        <p className="m-0 text-xs leading-5 text-[var(--color-muted)]">
          {selectedPatient
            ? `${selectedPatient.lastName}, ${selectedPatient.firstName} · `
            : ""}
          Se guardará <strong>pendiente de confirmación</strong>.
        </p>
        <SubmitButton pendingLabel="Guardando…">
          Guardar turno pendiente
        </SubmitButton>
      </div>
    </form>
  );
}
