"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { createAppointmentAction } from "@/modules/appointments/actions";
import {
  appointmentFormState,
  appointmentSpecialties,
} from "@/modules/appointments/domain/appointment";
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
  created,
  patients,
  defaultDurationMinutes,
  defaultCleanupMinutes,
}: Readonly<{
  created: boolean;
  patients: AppointmentPatientOption[];
  defaultDurationMinutes: number;
  defaultCleanupMinutes: number;
}>) {
  const [state, action] = useActionState(
    createAppointmentAction,
    appointmentFormState,
  );

  return (
    <form action={action} className="mt-5 flex flex-col gap-4" noValidate>
      {created && state.status === "idle" ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
          role="status"
        >
          El turno pendiente se guardó correctamente.
        </p>
      ) : null}

      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <label className="text-sm font-semibold">
        Paciente ficticio
        <select
          aria-describedby={
            state.fieldErrors.patientId ? "appointment-patient-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.patientId)}
          className={inputClassName}
          defaultValue=""
          name="patientId"
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

      <label className="text-sm font-semibold">
        Fecha y hora
        <input
          aria-describedby={
            state.fieldErrors.startsAt ? "appointment-start-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.startsAt)}
          className={inputClassName}
          name="startsAt"
          type="datetime-local"
        />
        <FieldError
          id="appointment-start-error"
          message={state.fieldErrors.startsAt}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Duración
          <input
            aria-describedby={
              state.fieldErrors.durationMinutes
                ? "appointment-duration-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.durationMinutes)}
            className={inputClassName}
            defaultValue={defaultDurationMinutes}
            max={1440}
            min={1}
            name="durationMinutes"
            type="number"
          />
          <FieldError
            id="appointment-duration-error"
            message={state.fieldErrors.durationMinutes}
          />
        </label>

        <label className="text-sm font-semibold">
          Acondicionamiento
          <input
            aria-describedby={
              state.fieldErrors.cleanupMinutes
                ? "appointment-cleanup-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.cleanupMinutes)}
            className={inputClassName}
            defaultValue={defaultCleanupMinutes}
            max={1440}
            min={0}
            name="cleanupMinutes"
            type="number"
          />
          <FieldError
            id="appointment-cleanup-error"
            message={state.fieldErrors.cleanupMinutes}
          />
        </label>
      </div>

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
          defaultValue="general"
          name="specialty"
        >
          {appointmentSpecialties.map((specialty) => (
            <option key={specialty.value} value={specialty.value}>
              {specialty.label}
            </option>
          ))}
        </select>
        <FieldError
          id="appointment-specialty-error"
          message={state.fieldErrors.specialty}
        />
      </label>

      <SubmitButton pendingLabel="Guardando…">
        Guardar turno pendiente
      </SubmitButton>
    </form>
  );
}
