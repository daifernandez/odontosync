"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import {
  InstructionProfessionalFooter,
  InstructionProfessionalHeader,
  type InstructionProfessionalProfile,
} from "@/components/instruction-document";
import { saveInitialConfigurationAction } from "@/modules/initial-configuration/actions";
import {
  type AvailabilityBlock,
  type InitialConfiguration,
  gridIntervalOptions,
  initialConfigurationFormState,
} from "@/modules/initial-configuration/domain/initial-configuration";

const days = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
] as const;

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

const cardClassName =
  "rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-7";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="mt-2 block text-xs text-red-700" id={id}>
      {message}
    </span>
  ) : null;
}

export function InitialConfigurationForm({
  initialConfiguration,
  isInitialSetup,
}: Readonly<{
  initialConfiguration: InitialConfiguration;
  isInitialSetup: boolean;
}>) {
  const [state, action] = useActionState(
    saveInitialConfigurationAction,
    initialConfigurationFormState,
  );
  const [availability, setAvailability] = useState(
    initialConfiguration.availability,
  );
  const [professionalProfile, setProfessionalProfile] =
    useState<InstructionProfessionalProfile>({
      fullName: initialConfiguration.fullName,
      licenseNumber: initialConfiguration.licenseNumber,
      licenseJurisdiction: initialConfiguration.licenseJurisdiction,
      clinicName: initialConfiguration.clinicName,
      officeAddress: initialConfiguration.officeAddress,
      contactPhone: initialConfiguration.contactPhone,
      contactEmail: initialConfiguration.contactEmail,
      additionalInformation: initialConfiguration.additionalInformation,
    });

  function updateProfessionalProfile(
    field: keyof InstructionProfessionalProfile,
    value: string,
  ) {
    setProfessionalProfile((current) => ({ ...current, [field]: value }));
  }

  function updateAvailability(
    index: number,
    field: keyof AvailabilityBlock,
    value: string,
  ) {
    setAvailability((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index
          ? {
              ...block,
              [field]: field === "dayOfWeek" ? Number(value) : value,
            }
          : block,
      ),
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section
        className={`${cardClassName} scroll-mt-5`}
        aria-labelledby="profile-title"
        id="perfil"
      >
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          {isInitialSetup ? "Paso 1" : "Perfil"}
        </p>
        <h2 className="m-0 text-xl" id="profile-title">
          Perfil profesional
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          La matrícula es opcional y no implica una verificación profesional.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold md:col-span-2">
            Nombre completo
            <input
              aria-describedby={
                state.fieldErrors.fullName
                  ? "configuration-full-name-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.fullName)}
              autoComplete="name"
              className={inputClassName}
              maxLength={120}
              name="fullName"
              onChange={(event) =>
                updateProfessionalProfile("fullName", event.target.value)
              }
              type="text"
              value={professionalProfile.fullName}
            />
            <FieldError
              id="configuration-full-name-error"
              message={state.fieldErrors.fullName}
            />
          </label>

          <label className="text-sm font-semibold">
            Matrícula{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (opcional)
            </span>
            <input
              aria-describedby={
                state.fieldErrors.licenseNumber
                  ? "configuration-license-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.licenseNumber)}
              className={inputClassName}
              maxLength={50}
              name="licenseNumber"
              onChange={(event) =>
                updateProfessionalProfile("licenseNumber", event.target.value)
              }
              type="text"
              value={professionalProfile.licenseNumber ?? ""}
            />
            <FieldError
              id="configuration-license-error"
              message={state.fieldErrors.licenseNumber}
            />
          </label>

          <label className="text-sm font-semibold">
            Jurisdicción{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (opcional)
            </span>
            <input
              aria-describedby={
                state.fieldErrors.licenseJurisdiction
                  ? "configuration-jurisdiction-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.licenseJurisdiction)}
              className={inputClassName}
              maxLength={100}
              name="licenseJurisdiction"
              onChange={(event) =>
                updateProfessionalProfile(
                  "licenseJurisdiction",
                  event.target.value,
                )
              }
              placeholder="Ej. Provincia de Buenos Aires"
              type="text"
              value={professionalProfile.licenseJurisdiction ?? ""}
            />
            <FieldError
              id="configuration-jurisdiction-error"
              message={state.fieldErrors.licenseJurisdiction}
            />
          </label>
        </div>
      </section>

      <section
        className={`${cardClassName} scroll-mt-5`}
        aria-labelledby="documents-profile-title"
        id="documentos"
      >
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          Documentos
        </p>
        <h2 className="m-0 text-xl" id="documents-profile-title">
          Datos para tus pacientes
        </h2>
        <p className="mt-2 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Completá únicamente la información que quieras reutilizar. Podrás
          decidir si incluirla antes de cada impresión.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.82fr)] lg:items-start">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">
              Clínica o consultorio{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
              <input
                aria-describedby={
                  state.fieldErrors.clinicName
                    ? "configuration-clinic-name-error"
                    : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.clinicName)}
                autoComplete="organization"
                className={inputClassName}
                maxLength={120}
                name="clinicName"
                onChange={(event) =>
                  updateProfessionalProfile("clinicName", event.target.value)
                }
                type="text"
                value={professionalProfile.clinicName ?? ""}
              />
              <FieldError
                id="configuration-clinic-name-error"
                message={state.fieldErrors.clinicName}
              />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Dirección{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
              <input
                aria-describedby={
                  state.fieldErrors.officeAddress
                    ? "configuration-office-address-error"
                    : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.officeAddress)}
                autoComplete="street-address"
                className={inputClassName}
                maxLength={160}
                name="officeAddress"
                onChange={(event) =>
                  updateProfessionalProfile(
                    "officeAddress",
                    event.target.value,
                  )
                }
                type="text"
                value={professionalProfile.officeAddress ?? ""}
              />
              <FieldError
                id="configuration-office-address-error"
                message={state.fieldErrors.officeAddress}
              />
            </label>

            <label className="text-sm font-semibold">
              Teléfono{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
              <input
                aria-describedby={
                  state.fieldErrors.contactPhone
                    ? "configuration-contact-phone-error"
                    : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.contactPhone)}
                autoComplete="tel"
                className={inputClassName}
                maxLength={50}
                name="contactPhone"
                onChange={(event) =>
                  updateProfessionalProfile("contactPhone", event.target.value)
                }
                type="tel"
                value={professionalProfile.contactPhone ?? ""}
              />
              <FieldError
                id="configuration-contact-phone-error"
                message={state.fieldErrors.contactPhone}
              />
            </label>

            <label className="text-sm font-semibold">
              Email{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
              <input
                aria-describedby={
                  state.fieldErrors.contactEmail
                    ? "configuration-contact-email-error"
                    : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.contactEmail)}
                autoComplete="email"
                className={inputClassName}
                maxLength={254}
                name="contactEmail"
                onChange={(event) =>
                  updateProfessionalProfile("contactEmail", event.target.value)
                }
                type="email"
                value={professionalProfile.contactEmail ?? ""}
              />
              <FieldError
                id="configuration-contact-email-error"
                message={state.fieldErrors.contactEmail}
              />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Información adicional{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
              <input
                aria-describedby={
                  state.fieldErrors.additionalInformation
                    ? "configuration-additional-information-error"
                    : "configuration-additional-information-help"
                }
                aria-invalid={Boolean(state.fieldErrors.additionalInformation)}
                className={inputClassName}
                maxLength={160}
                name="additionalInformation"
                onChange={(event) =>
                  updateProfessionalProfile(
                    "additionalInformation",
                    event.target.value,
                  )
                }
                placeholder="Ej. Atención con turno previo"
                type="text"
                value={professionalProfile.additionalInformation ?? ""}
              />
              <span
                className="mt-2 block text-xs font-normal text-[var(--color-muted)]"
                id="configuration-additional-information-help"
              >
                Usá una frase breve que resulte útil para el paciente.
              </span>
              <FieldError
                id="configuration-additional-information-error"
                message={state.fieldErrors.additionalInformation}
              />
            </label>
          </div>

          <div className="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-page)] p-3 md:p-4">
            <p className="m-0 text-[0.65rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Vista previa de tus datos
            </p>
            <div className="mt-3 rounded-xl bg-white p-4 shadow-[var(--shadow-card)]">
              <InstructionProfessionalHeader
                profile={professionalProfile}
                showProfessionalData
              />
              <div aria-hidden="true" className="h-20" />
              <InstructionProfessionalFooter
                profile={professionalProfile}
                showProfessionalData
              />
            </div>
            <p
              className="mt-3 mb-0 text-xs leading-5 text-[var(--color-muted)]"
            >
              Podrás decidir si incluirlos antes de cada impresión.
            </p>
          </div>
        </div>
      </section>

      <section
        className={`${cardClassName} scroll-mt-5`}
        aria-labelledby="agenda-settings-title"
        id="agenda"
      >
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          {isInitialSetup ? "Paso 2" : "Agenda"}
        </p>
        <h2 className="m-0 text-xl" id="agenda-settings-title">
          Preferencias de agenda
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className="text-sm font-semibold">
            Intervalo de grilla
            <select
              aria-describedby={
                state.fieldErrors.gridIntervalMinutes
                  ? "configuration-grid-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.gridIntervalMinutes)}
              className={inputClassName}
              defaultValue={initialConfiguration.gridIntervalMinutes}
              name="gridIntervalMinutes"
            >
              {gridIntervalOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutos
                </option>
              ))}
            </select>
            <FieldError
              id="configuration-grid-error"
              message={state.fieldErrors.gridIntervalMinutes}
            />
          </label>

          <label className="text-sm font-semibold">
            Duración habitual
            <input
              aria-describedby={
                state.fieldErrors.defaultAppointmentDurationMinutes
                  ? "configuration-duration-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors.defaultAppointmentDurationMinutes,
              )}
              className={inputClassName}
              defaultValue={
                initialConfiguration.defaultAppointmentDurationMinutes
              }
              max={1440}
              min={1}
              name="defaultAppointmentDurationMinutes"
              type="number"
            />
            <FieldError
              id="configuration-duration-error"
              message={state.fieldErrors.defaultAppointmentDurationMinutes}
            />
          </label>

          <label className="text-sm font-semibold">
            Acondicionamiento posterior
            <input
              aria-describedby={
                state.fieldErrors.defaultCleanupMinutes
                  ? "configuration-cleanup-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.defaultCleanupMinutes)}
              className={inputClassName}
              defaultValue={initialConfiguration.defaultCleanupMinutes}
              max={1440}
              min={0}
              name="defaultCleanupMinutes"
              type="number"
            />
            <FieldError
              id="configuration-cleanup-error"
              message={state.fieldErrors.defaultCleanupMinutes}
            />
          </label>
        </div>
      </section>

      <section className={cardClassName} aria-labelledby="availability-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              {isInitialSetup ? "Paso 3" : "Agenda"}
            </p>
            <h2 className="m-0 text-xl" id="availability-title">
              Horarios habituales
            </h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
              Podés agregar más de un bloque para el mismo día.
            </p>
          </div>
          <button
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)]"
            onClick={() =>
              setAvailability((current) => [
                ...current,
                { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
              ])
            }
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
            Agregar bloque
          </button>
        </div>

        <input
          name="availability"
          readOnly
          type="hidden"
          value={JSON.stringify(availability)}
        />

        <div
          aria-describedby={
            state.fieldErrors.availability
              ? "configuration-availability-error"
              : undefined
          }
          className="mt-5 flex flex-col gap-3"
          role="group"
        >
          {availability.length === 0 ? (
            <p className="m-0 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-5 text-center text-sm text-[var(--color-muted)]">
              Agregá al menos un bloque de atención.
            </p>
          ) : null}

          {availability.map((block, index) => (
            <div
              className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-3 sm:grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.7fr)_minmax(7rem,0.7fr)_auto] sm:items-end"
              key={`${index}-${block.dayOfWeek}`}
            >
              <label className="text-xs font-bold text-[var(--color-muted)]">
                Día
                <select
                  className={inputClassName}
                  onChange={(event) =>
                    updateAvailability(index, "dayOfWeek", event.target.value)
                  }
                  value={block.dayOfWeek}
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[var(--color-muted)]">
                Desde
                <input
                  className={inputClassName}
                  onChange={(event) =>
                    updateAvailability(index, "startTime", event.target.value)
                  }
                  type="time"
                  value={block.startTime}
                />
              </label>
              <label className="text-xs font-bold text-[var(--color-muted)]">
                Hasta
                <input
                  className={inputClassName}
                  onChange={(event) =>
                    updateAvailability(index, "endTime", event.target.value)
                  }
                  type="time"
                  value={block.endTime}
                />
              </label>
              <button
                aria-label={`Eliminar bloque ${index + 1}`}
                className="grid size-11 cursor-pointer place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:text-red-700"
                onClick={() =>
                  setAvailability((current) =>
                    current.filter((_, blockIndex) => blockIndex !== index),
                  )
                }
                type="button"
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </div>
          ))}
        </div>

        <FieldError
          id="configuration-availability-error"
          message={state.fieldErrors.availability}
        />
      </section>

      <div className="self-end sm:min-w-64">
        <SubmitButton pendingLabel="Guardando…">
          Guardar configuración
        </SubmitButton>
      </div>
    </form>
  );
}
