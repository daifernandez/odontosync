"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import {
  createPatientAction,
  setPatientActiveAction,
  updatePatientAction,
} from "@/modules/patients/actions";
import {
  type Patient,
  patientFormState,
} from "@/modules/patients/domain/patient";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="mt-2 block text-xs font-normal text-red-700" id={id}>
      {message}
    </span>
  ) : null;
}

export function PatientForm({ patient }: { patient?: Patient }) {
  const formAction = patient
    ? updatePatientAction.bind(null, patient.id)
    : createPatientAction;
  const [state, action] = useActionState(
    formAction,
    patientFormState,
  );

  return (
    <form action={action} className="mt-5 flex flex-col gap-4" noValidate>
      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Nombre
          <input
            aria-describedby={
              state.fieldErrors.firstName
                ? "patient-first-name-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.firstName)}
            autoComplete="off"
            className={inputClassName}
            defaultValue={patient?.firstName}
            maxLength={80}
            name="firstName"
            type="text"
          />
          <FieldError
            id="patient-first-name-error"
            message={state.fieldErrors.firstName}
          />
        </label>

        <label className="text-sm font-semibold">
          Apellido
          <input
            aria-describedby={
              state.fieldErrors.lastName
                ? "patient-last-name-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.lastName)}
            autoComplete="off"
            className={inputClassName}
            defaultValue={patient?.lastName}
            maxLength={80}
            name="lastName"
            type="text"
          />
          <FieldError
            id="patient-last-name-error"
            message={state.fieldErrors.lastName}
          />
        </label>
      </div>

      <label className="text-sm font-semibold">
        Teléfono{" "}
        <span className="font-normal text-[var(--color-muted)]">
          (opcional)
        </span>
        <input
          aria-describedby={
            state.fieldErrors.phone ? "patient-phone-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.phone)}
          autoComplete="off"
          className={inputClassName}
          defaultValue={patient?.phone ?? ""}
          inputMode="tel"
          maxLength={30}
          name="phone"
          type="tel"
        />
        <FieldError
          id="patient-phone-error"
          message={state.fieldErrors.phone}
        />
      </label>

      <label className="text-sm font-semibold">
        Correo electrónico{" "}
        <span className="font-normal text-[var(--color-muted)]">
          (opcional)
        </span>
        <input
          aria-describedby={
            state.fieldErrors.email ? "patient-email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="off"
          className={inputClassName}
          defaultValue={patient?.email ?? ""}
          maxLength={254}
          name="email"
          type="email"
        />
        <FieldError
          id="patient-email-error"
          message={state.fieldErrors.email}
        />
      </label>

      <SubmitButton pendingLabel="Guardando…">
        {patient ? "Guardar cambios" : "Guardar paciente ficticio"}
      </SubmitButton>
    </form>
  );
}

export function PatientStatusForm({ patient }: { patient: Patient }) {
  const [state, action] = useActionState(
    setPatientActiveAction.bind(null, patient.id, !patient.isActive),
    patientFormState,
  );

  return (
    <form action={action} className="mt-5">
      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pendingLabel={patient.isActive ? "Desactivando…" : "Reactivando…"}
      >
        {patient.isActive ? "Desactivar paciente" : "Reactivar paciente"}
      </SubmitButton>
    </form>
  );
}
