"use client";

import { CalendarClock, Clock3 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  ConfigurationFieldError,
  configurationCardClassName,
  configurationInputClassName,
} from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveAgendaPreferencesAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  gridIntervalOptions,
  type AgendaPreferences,
} from "@/modules/initial-configuration/domain/initial-configuration";

const durationOptions = [15, 30, 45, 60] as const;
const cleanupOptions = [0, 5, 10, 15] as const;

function formatTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseMinutes(value: string, minimum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= 1440
    ? parsed
    : null;
}

function StepHeading({
  description,
  number,
  title,
}: Readonly<{ description: string; number: number; title: string }>) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand-dark)]">
        {number}
      </span>
      <div>
        <h3 className="m-0 text-base">{title}</h3>
        <p className="mt-1 mb-0 text-sm leading-5 text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function optionClassName(selected: boolean) {
  return `min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-bold transition-colors ${
    selected
      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] ring-1 ring-[var(--color-brand)]"
      : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-dark)]"
  }`;
}

function MinuteInput({
  describedBy,
  invalid,
  label,
  minimum,
  name,
  onChange,
  value,
}: Readonly<{
  describedBy?: string;
  invalid: boolean;
  label: string;
  minimum: number;
  name: string;
  onChange: (value: string) => void;
  value: string;
}>) {
  return (
    <label className="block max-w-48 text-xs font-bold text-[var(--color-muted)]">
      {label}
      <span className="relative mt-2 block">
        <input
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-label={label}
          className={`${configurationInputClassName} mt-0 pr-14`}
          max={1440}
          min={minimum}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-[var(--color-muted)]">
          min
        </span>
      </span>
    </label>
  );
}

export function AgendaPreferencesForm({
  initialPreferences,
}: Readonly<{ initialPreferences: AgendaPreferences }>) {
  const [state, action] = useActionState(
    saveAgendaPreferencesAction,
    configurationFormState,
  );
  const { isDirty, markDirty } = useUnsavedChanges(state);
  const [gridInterval, setGridInterval] = useState(
    String(initialPreferences.gridIntervalMinutes),
  );
  const [duration, setDuration] = useState(
    String(initialPreferences.defaultAppointmentDurationMinutes),
  );
  const [cleanup, setCleanup] = useState(
    String(initialPreferences.defaultCleanupMinutes),
  );
  const durationMinutes = parseMinutes(duration, 1);
  const cleanupMinutes = parseMinutes(cleanup, 0);
  const appointmentEndsAt =
    durationMinutes === null ? null : 9 * 60 + durationMinutes;
  const nextAppointmentAt =
    appointmentEndsAt === null || cleanupMinutes === null
      ? null
      : appointmentEndsAt + cleanupMinutes;

  function chooseGridInterval(minutes: number) {
    setGridInterval(String(minutes));
    markDirty();
  }

  function chooseDuration(minutes: number) {
    setDuration(String(minutes));
    markDirty();
  }

  function chooseCleanup(minutes: number) {
    setCleanup(String(minutes));
    markDirty();
  }

  return (
    <form
      action={action}
      className={configurationCardClassName}
      noValidate
      onChange={markDirty}
    >
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 sm:flex sm:gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
          <CalendarClock aria-hidden="true" size={20} strokeWidth={1.8} />
        </span>
        <div className="contents sm:block">
          <h2 className="m-0 text-xl">Cómo se organiza un turno</h2>
          <p className="col-span-2 m-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:mt-1.5">
            Elegí una base para agilizar la carga. Cada turno se puede ajustar después.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start">
        <div>
          <section aria-labelledby="grid-step-title">
            <div id="grid-step-title">
              <StepHeading
                description="Determina cada cuánto aparece una línea horaria en la agenda."
                number={1}
                title="Divisiones de la agenda"
              />
            </div>
            <input name="gridIntervalMinutes" type="hidden" value={gridInterval} />
            <div
              aria-label="Intervalo de la grilla"
              className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"
              role="group"
            >
              {gridIntervalOptions.map((minutes) => (
                <button
                  aria-label={`${minutes} minutos por división`}
                  aria-pressed={gridInterval === String(minutes)}
                  className={optionClassName(gridInterval === String(minutes))}
                  key={minutes}
                  onClick={() => chooseGridInterval(minutes)}
                  type="button"
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <ConfigurationFieldError
              id="agenda-grid-error"
              message={state.fieldErrors.gridIntervalMinutes}
            />
          </section>

          <section
            aria-labelledby="duration-step-title"
            className="mt-6 border-t border-[var(--color-border)] pt-6"
          >
            <div id="duration-step-title">
              <StepHeading
                description="Es el tiempo de atención que se completa al crear un turno."
                number={2}
                title="Duración habitual"
              />
            </div>
            <div
              aria-label="Duraciones habituales"
              className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              role="group"
            >
              {durationOptions.map((minutes) => (
                <button
                  aria-label={`${minutes} minutos`}
                  aria-pressed={duration === String(minutes)}
                  className={optionClassName(duration === String(minutes))}
                  key={minutes}
                  onClick={() => chooseDuration(minutes)}
                  type="button"
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <div className="mt-4">
              <MinuteInput
                describedBy={state.fieldErrors.defaultAppointmentDurationMinutes ? "agenda-duration-error" : undefined}
                invalid={Boolean(state.fieldErrors.defaultAppointmentDurationMinutes)}
                label="Duración personalizada"
                minimum={1}
                name="defaultAppointmentDurationMinutes"
                onChange={setDuration}
                value={duration}
              />
              <ConfigurationFieldError
                id="agenda-duration-error"
                message={state.fieldErrors.defaultAppointmentDurationMinutes}
              />
            </div>
          </section>

          <section
            aria-labelledby="cleanup-step-title"
            className="mt-6 border-t border-[var(--color-border)] pt-6"
          >
            <div id="cleanup-step-title">
              <StepHeading
                description="Reservá un margen para limpiar, preparar o registrar información."
                number={3}
                title="Tiempo después del turno"
              />
            </div>
            <div
              aria-label="Tiempo posterior al turno"
              className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              role="group"
            >
              {cleanupOptions.map((minutes) => (
                <button
                  aria-label={minutes === 0 ? "Sin tiempo posterior" : `${minutes} minutos posteriores`}
                  aria-pressed={cleanup === String(minutes)}
                  className={optionClassName(cleanup === String(minutes))}
                  key={minutes}
                  onClick={() => chooseCleanup(minutes)}
                  type="button"
                >
                  {minutes === 0 ? "Sin tiempo extra" : `${minutes} min`}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <MinuteInput
                describedBy={state.fieldErrors.defaultCleanupMinutes ? "agenda-cleanup-error" : undefined}
                invalid={Boolean(state.fieldErrors.defaultCleanupMinutes)}
                label="Tiempo posterior personalizado"
                minimum={0}
                name="defaultCleanupMinutes"
                onChange={setCleanup}
                value={cleanup}
              />
              <ConfigurationFieldError
                id="agenda-cleanup-error"
                message={state.fieldErrors.defaultCleanupMinutes}
              />
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="appointment-example-title"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 xl:sticky xl:top-6"
        >
          <p className="mb-1 text-[0.65rem] font-bold tracking-[0.1em] text-[var(--color-brand)] uppercase">
            Ejemplo en vivo
          </p>
          <h3 className="m-0 text-base" id="appointment-example-title">
            Un turno a las 09:00
          </h3>

          {appointmentEndsAt !== null && nextAppointmentAt !== null ? (
            <div className="mt-4" aria-live="polite">
              <div className="flex gap-3">
                <span className="mt-0.5 text-xs font-bold text-[var(--color-brand-dark)]">09:00</span>
                <div className="min-w-0 flex-1 rounded-xl bg-[var(--color-brand-soft)] p-3">
                  <p className="m-0 text-sm font-bold">Atención</p>
                  <p className="mt-1 mb-0 text-xs text-[var(--color-muted)]">
                    {durationMinutes} min · hasta {formatTime(appointmentEndsAt)}
                  </p>
                </div>
              </div>

              {cleanupMinutes !== null && cleanupMinutes > 0 ? (
                <div className="mt-2 flex gap-3">
                  <span className="mt-0.5 text-xs font-bold text-[var(--color-muted)]">
                    {formatTime(appointmentEndsAt)}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-dashed border-[var(--color-border)] bg-white p-3">
                    <p className="m-0 text-sm font-bold">Tiempo posterior</p>
                    <p className="mt-1 mb-0 text-xs text-[var(--color-muted)]">
                      {cleanupMinutes} min
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-white p-3 text-center">
                <Clock3 aria-hidden="true" className="mx-auto text-[var(--color-brand)]" size={18} />
                <p className="mt-2 mb-1 text-xs text-[var(--color-muted)]">
                  Próximo turno disponible
                </p>
                <p className="m-0 text-xl font-bold text-[var(--color-brand-dark)]">
                  {formatTime(nextAppointmentAt)}
                </p>
              </div>

              <p className="mt-3 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                La agenda se divide cada {gridInterval} min.
              </p>
            </div>
          ) : (
            <p className="mt-4 mb-0 rounded-xl border border-dashed border-[var(--color-border)] bg-white p-4 text-sm leading-5 text-[var(--color-muted)]">
              Ingresá valores válidos para ver el ejemplo.
            </p>
          )}
        </aside>
      </div>

      <ConfigurationSaveBar
        isDirty={isDirty}
        label="Guardar preferencias"
        state={state}
      />
    </form>
  );
}
