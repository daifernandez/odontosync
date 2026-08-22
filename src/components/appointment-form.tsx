"use client";

import { CalendarCheck, Check, Clock3, UserRound } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
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

type AppointmentPatientOption = Pick<
  Patient,
  "id" | "firstName" | "lastName"
>;

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

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
  created,
  currentTime,
  exceptionalBlocks,
  patients,
  defaultDurationMinutes,
  defaultCleanupMinutes,
  gridIntervalMinutes,
  initialDate = "",
  initialTime = "",
  minimumDate,
  onClose,
  weekStartDate,
}: Readonly<{
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  created: boolean;
  currentTime: string;
  exceptionalBlocks: ExceptionalBlockOccupancy[];
  patients: AppointmentPatientOption[];
  defaultDurationMinutes: number;
  defaultCleanupMinutes: number;
  gridIntervalMinutes: number;
  initialDate?: string;
  initialTime?: string;
  minimumDate: string;
  onClose: () => void;
  weekStartDate?: string;
}>) {
  const [state, action] = useActionState(
    createAppointmentAction,
    appointmentFormState,
  );
  const patientSelectRef = useRef<HTMLSelectElement>(null);
  const [patientId, setPatientId] = useState("");
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
  const [specialty, setSpecialty] = useState("general");
  const selectedPatient = patients.find((patient) => patient.id === patientId);
  const selectedSpecialty = appointmentSpecialties.find(
    (option) => option.value === specialty,
  );
  const availableSlots = date
    ? getAvailableAppointmentSlots({
        date,
        availability,
        appointments: appointmentOccupancy,
        exceptionalBlocks,
        durationMinutes: Number(durationMinutes),
        cleanupMinutes: Number(cleanupMinutes),
        gridIntervalMinutes,
        now: new Date(currentTime),
      })
    : [];
  const formattedStart = startsAt
    ? `${startsAt.slice(8, 10)}/${startsAt.slice(5, 7)}/${startsAt.slice(0, 4)} a las ${startsAt.slice(11, 16)}`
    : "Fecha y hora pendientes";
  const formKey = state.values
    ? JSON.stringify(state.values)
    : "new-appointment";

  return (
    <form
      action={action}
      className="flex flex-col gap-5"
      key={formKey}
      noValidate
    >
      {weekStartDate ? (
        <input name="weekStartDate" type="hidden" value={weekStartDate} />
      ) : null}
      {created && state.status === "idle" ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-4 text-[var(--color-brand-dark)]">
          <p
            className="m-0 flex items-center gap-2 text-sm font-bold"
            role="status"
          >
            <Check aria-hidden="true" size={18} />
            El turno pendiente se guardó correctamente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="min-h-10 cursor-pointer rounded-xl border border-[var(--color-border)] bg-white px-3 text-xs font-bold text-[var(--color-brand-dark)]"
              onClick={onClose}
              type="button"
            >
              Ver en la agenda
            </button>
            <button
              className="min-h-10 cursor-pointer rounded-xl border-0 bg-transparent px-3 text-xs font-bold text-[var(--color-brand-dark)]"
              onClick={() => patientSelectRef.current?.focus()}
              type="button"
            >
              Cargar otro turno
            </button>
          </div>
        </div>
      ) : null}

      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section aria-labelledby="appointment-patient-title">
        <p className="m-0 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
          <UserRound aria-hidden="true" size={16} />
          Paso 1
        </p>
        <h3 className="mt-2 mb-0 text-base" id="appointment-patient-title">
          Elegí el paciente
        </h3>
        <label className="text-sm font-semibold">
          <span className="sr-only">Paciente ficticio</span>
          <select
            aria-describedby={
              state.fieldErrors.patientId ? "appointment-patient-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.patientId)}
            className={inputClassName}
            defaultValue={state.values?.patientId ?? ""}
            name="patientId"
            onChange={(event) => setPatientId(event.target.value)}
            ref={patientSelectRef}
          >
            <option disabled value="">
              Elegí un paciente
            </option>
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
      </section>

      <section
        aria-labelledby="appointment-details-title"
        className="border-t border-[var(--color-border)] pt-5"
      >
        <p className="m-0 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
          <CalendarCheck aria-hidden="true" size={16} />
          Paso 2
        </p>
        <h3 className="mt-2 mb-0 text-base" id="appointment-details-title">
          Definí la práctica y el tiempo
        </h3>

        <label className="mt-4 block text-sm font-semibold">
          Área odontológica
          <select
            aria-describedby={
              state.fieldErrors.specialty
                ? "appointment-specialty-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.specialty)}
            className={inputClassName}
            defaultValue={state.values?.specialty ?? "general"}
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Duración estimada
            <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
              Podés ajustarla para este paciente
            </span>
            <input
              aria-describedby={
                state.fieldErrors.durationMinutes
                  ? "appointment-duration-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.durationMinutes)}
              className={inputClassName}
              max={1440}
              min={1}
              defaultValue={
                state.values?.durationMinutes ?? defaultDurationMinutes
              }
              name="durationMinutes"
              onChange={(event) => {
                setDurationMinutes(event.target.value);
                setStartsAt("");
              }}
              type="number"
            />
            <FieldError
              id="appointment-duration-error"
              message={state.fieldErrors.durationMinutes}
            />
          </label>

          <label className="text-sm font-semibold">
            Acondicionamiento
            <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
              Margen posterior
            </span>
            <input
              aria-describedby={
                state.fieldErrors.cleanupMinutes
                  ? "appointment-cleanup-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.cleanupMinutes)}
              className={inputClassName}
              max={1440}
              min={0}
              defaultValue={
                state.values?.cleanupMinutes ?? defaultCleanupMinutes
              }
              name="cleanupMinutes"
              onChange={(event) => {
                setCleanupMinutes(event.target.value);
                setStartsAt("");
              }}
              type="number"
            />
            <FieldError
              id="appointment-cleanup-error"
              message={state.fieldErrors.cleanupMinutes}
            />
          </label>
        </div>
      </section>

      <section
        aria-labelledby="appointment-time-title"
        className="border-t border-[var(--color-border)] pt-5"
      >
        <p className="m-0 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
          <Clock3 aria-hidden="true" size={16} />
          Paso 3
        </p>
        <h3 className="mt-2 mb-0 text-base" id="appointment-time-title">
          Definí el horario
        </h3>
        <label className="mt-4 block text-sm font-semibold">
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

        <fieldset
          aria-describedby={
            state.fieldErrors.startsAt ? "appointment-start-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.startsAt)}
          className="mt-4 border-0 p-0"
        >
          <legend className="text-sm font-semibold">Horarios disponibles</legend>
          {!date ? (
            <p className="mt-2 mb-0 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              Elegí una fecha para ver los horarios libres.
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="mt-2 mb-0 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              No hay horarios disponibles para esta fecha con la duración
              elegida. Probá otro día.
            </p>
          ) : (
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
                    <span className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-2 text-sm font-bold text-[var(--color-brand-dark)] transition-colors peer-checked:border-[var(--color-brand)] peer-checked:bg-[var(--color-brand-soft)] peer-focus-visible:ring-3 peer-focus-visible:ring-[rgb(20_125_115/18%)]">
                      {time}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <FieldError
            id="appointment-start-error"
            message={state.fieldErrors.startsAt}
          />
        </fieldset>
      </section>

      <section
        aria-labelledby="appointment-summary-title"
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4"
      >
        <p className="m-0 text-xs font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
          Resumen
        </p>
        <h3 className="mt-2 mb-0 text-base" id="appointment-summary-title">
          Revisá antes de confirmar
        </h3>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-[var(--color-muted)]">Paciente</dt>
          <dd className="m-0 text-right font-semibold">
            {selectedPatient
              ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
              : "Sin elegir"}
          </dd>
          <dt className="text-[var(--color-muted)]">Horario</dt>
          <dd className="m-0 text-right font-semibold">{formattedStart}</dd>
          <dt className="text-[var(--color-muted)]">Área</dt>
          <dd className="m-0 text-right font-semibold">
            {selectedSpecialty?.label}
          </dd>
          <dt className="text-[var(--color-muted)]">Tiempo reservado</dt>
          <dd className="m-0 text-right font-semibold">
            {durationMinutes || "0"} min + {cleanupMinutes || "0"} min
          </dd>
        </dl>
      </section>

      <SubmitButton pendingLabel="Guardando…">
        Confirmar turno pendiente
      </SubmitButton>
    </form>
  );
}
