"use client";

import { ChevronDown, Copy, Plus, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { configurationCardClassName } from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveAvailabilityAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  type AvailabilityBlock,
} from "@/modules/initial-configuration/domain/initial-configuration";

const days = [
  { value: 1, label: "Lunes", plural: "lunes" },
  { value: 2, label: "Martes", plural: "martes" },
  { value: 3, label: "Miércoles", plural: "miércoles" },
  { value: 4, label: "Jueves", plural: "jueves" },
  { value: 5, label: "Viernes", plural: "viernes" },
  { value: 6, label: "Sábado", plural: "sábados" },
  { value: 7, label: "Domingo", plural: "domingos" },
] as const;

const timeInputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function findDayErrors(availability: AvailabilityBlock[]) {
  const errors = new Map<number, string>();

  for (const day of days) {
    const blocks = availability
      .filter((block) => block.dayOfWeek === day.value)
      .sort((left, right) => minutes(left.startTime) - minutes(right.startTime));

    if (blocks.some((block) => minutes(block.startTime) >= minutes(block.endTime))) {
      errors.set(day.value, `Revisá el horario del ${day.plural}.`);
      continue;
    }

    for (let index = 1; index < blocks.length; index += 1) {
      if (minutes(blocks[index].startTime) < minutes(blocks[index - 1].endTime)) {
        errors.set(day.value, `Los horarios del ${day.plural} se superponen.`);
        break;
      }
    }
  }

  return errors;
}

export function WeeklyAvailabilityForm({
  initialAvailability,
}: Readonly<{ initialAvailability: AvailabilityBlock[] }>) {
  const [state, action] = useActionState(
    saveAvailabilityAction,
    configurationFormState,
  );
  const { isDirty, markDirty } = useUnsavedChanges(state);
  const [availability, setAvailability] = useState(initialAvailability);
  const [copyTargets, setCopyTargets] = useState<Record<number, number>>({});
  const dayErrors = useMemo(() => findDayErrors(availability), [availability]);
  const activeDayCount = new Set(
    availability.map((block) => block.dayOfWeek),
  ).size;

  function replaceAvailability(next: AvailabilityBlock[]) {
    setAvailability(next);
    markDirty();
  }

  function toggleDay(dayOfWeek: number, active: boolean) {
    if (active) {
      replaceAvailability([
        ...availability,
        { dayOfWeek, startTime: "09:00", endTime: "13:00" },
      ]);
      return;
    }

    replaceAvailability(
      availability.filter((block) => block.dayOfWeek !== dayOfWeek),
    );
  }

  function updateBlock(
    dayOfWeek: number,
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    let currentIndex = -1;
    replaceAvailability(
      availability.map((block) => {
        if (block.dayOfWeek !== dayOfWeek) {
          return block;
        }

        currentIndex += 1;
        return currentIndex === index ? { ...block, [field]: value } : block;
      }),
    );
  }

  function removeBlock(dayOfWeek: number, index: number) {
    let currentIndex = -1;
    replaceAvailability(
      availability.filter((block) => {
        if (block.dayOfWeek !== dayOfWeek) {
          return true;
        }

        currentIndex += 1;
        return currentIndex !== index;
      }),
    );
  }

  function copyDay(sourceDay: number) {
    const targetDay = copyTargets[sourceDay] ?? days.find((day) => day.value !== sourceDay)?.value;

    if (!targetDay) {
      return;
    }

    const sourceBlocks = availability
      .filter((block) => block.dayOfWeek === sourceDay)
      .map((block) => ({ ...block, dayOfWeek: targetDay }));
    replaceAvailability([
      ...availability.filter((block) => block.dayOfWeek !== targetDay),
      ...sourceBlocks,
    ]);
  }

  return (
    <form action={action} className={configurationCardClassName} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="m-0 text-xl">Tu semana de atención</h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Activá cada día y organizá uno o más bloques de trabajo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-dark)]">
            {activeDayCount} {activeDayCount === 1 ? "día activo" : "días activos"}
          </span>
          <span className="rounded-full bg-[var(--color-page)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]">
            {availability.length} {availability.length === 1 ? "bloque" : "bloques"}
          </span>
        </div>
      </div>

      <input name="availability" readOnly type="hidden" value={JSON.stringify(availability)} />

      <div className="mt-6 flex flex-col gap-3">
        {days.map((day) => {
          const blocks = availability.filter((block) => block.dayOfWeek === day.value);
          const active = blocks.length > 0;
          const copyOptions = days.filter((candidate) => candidate.value !== day.value);
          const copyTarget = copyTargets[day.value] ?? copyOptions[0].value;
          const dayError = dayErrors.get(day.value);

          return (
            <div
              aria-label={day.label}
              className={`overflow-hidden rounded-2xl border ${
                active
                  ? "border-[var(--color-border)] bg-[var(--color-brand-subtle)]"
                  : "border-[var(--color-border)] bg-white"
              }`}
              key={day.value}
              role="group"
            >
              <label className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-2.5">
                <input
                  aria-label={`Atiendo los ${day.plural}`}
                  checked={active}
                  className="peer sr-only"
                  onChange={(event) => toggleDay(day.value, event.target.checked)}
                  type="checkbox"
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 shrink-0 rounded-full bg-[var(--color-border)] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-brand)] peer-checked:bg-[var(--color-brand)] peer-checked:[&>span]:translate-x-5"
                >
                  <span className="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">Atiendo los {day.plural}</span>
                  <span aria-hidden="true" className="block font-bold">{day.label}</span>
                  <span className="block text-xs text-[var(--color-muted)]">
                    {active
                      ? `${blocks.length} ${blocks.length === 1 ? "bloque" : "bloques"}`
                      : "No atiendo"}
                  </span>
                </span>
              </label>

              {active ? (
                <div className="border-t border-[var(--color-border)] bg-[rgb(255_255_255/72%)] px-3 py-4 sm:px-4">
                  <div className="flex flex-col gap-3">
                    {blocks.map((block, index) => (
                      <div
                        className="rounded-xl border border-[var(--color-border)] bg-white p-3"
                        key={`${day.value}-${index}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="m-0 text-xs font-bold text-[var(--color-brand-dark)]">
                            Bloque {index + 1}
                          </p>
                          <button
                            aria-label={`Eliminar bloque ${index + 1} del ${day.plural}`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-0 bg-transparent px-2 text-xs font-semibold text-[var(--color-muted)] hover:bg-[var(--color-warning-soft)] hover:text-red-700"
                            onClick={() => removeBlock(day.value, index)}
                            type="button"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                            Eliminar
                          </button>
                        </div>
                        <div className="mt-2 grid gap-2 min-[380px]:grid-cols-2">
                          <label className="min-w-0 text-xs font-bold text-[var(--color-muted)]">
                            Desde
                            <input
                              className={timeInputClassName}
                              onChange={(event) => updateBlock(day.value, index, "startTime", event.target.value)}
                              type="time"
                              value={block.startTime}
                            />
                          </label>
                          <label className="min-w-0 text-xs font-bold text-[var(--color-muted)]">
                            Hasta
                            <input
                              className={timeInputClassName}
                              onChange={(event) => updateBlock(day.value, index, "endTime", event.target.value)}
                              type="time"
                              value={block.endTime}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-brand)] bg-white px-3 text-sm font-semibold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)] sm:w-fit"
                    onClick={() =>
                      replaceAvailability([
                        ...availability,
                        { dayOfWeek: day.value, startTime: "14:00", endTime: "18:00" },
                      ])
                    }
                    type="button"
                  >
                    <Plus aria-hidden="true" size={16} />
                    Agregar bloque
                  </button>

                  <details className="group mt-4 border-t border-[var(--color-border)] pt-3">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-muted)] [&::-webkit-details-marker]:hidden">
                      <Copy aria-hidden="true" size={16} />
                      <span className="flex-1">Copiar estos horarios</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                        size={16}
                      />
                    </summary>
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <select
                        aria-label={`Copiar horarios de ${day.label} a`}
                        className="min-h-11 min-w-0 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm"
                        onChange={(event) =>
                          setCopyTargets((current) => ({
                            ...current,
                            [day.value]: Number(event.target.value),
                          }))
                        }
                        value={copyTarget}
                      >
                        {copyOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-brand-dark)]"
                        onClick={() => copyDay(day.value)}
                        type="button"
                      >
                        <Copy aria-hidden="true" size={16} />
                        Copiar
                      </button>
                    </div>
                  </details>

                  {dayError ? (
                    <p className="mt-3 mb-0 text-sm font-semibold text-red-700" role="alert">{dayError}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {state.fieldErrors.availability && dayErrors.size === 0 ? (
        <p className="mt-4 mb-0 text-sm font-semibold text-red-700" role="alert">
          {state.fieldErrors.availability}
        </p>
      ) : null}

      <ConfigurationSaveBar
        disabled={dayErrors.size > 0 || availability.length === 0}
        isDirty={isDirty}
        label="Guardar horarios"
        state={state}
      />
    </form>
  );
}
