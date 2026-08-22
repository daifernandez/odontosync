"use client";

import { CalendarOff, Clock3, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { SubmitButton } from "@/components/auth/submit-button";
import {
  createExceptionalBlockAction,
  deleteExceptionalBlockAction,
} from "@/modules/exceptional-blocks/actions";
import {
  type ExceptionalBlock,
  exceptionalBlockCategories,
  exceptionalBlockFormState,
} from "@/modules/exceptional-blocks/domain/exceptional-block";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";
const exceptionalBlockDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  dateStyle: "medium",
  timeStyle: "short",
});

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="mt-2 block text-xs font-normal text-red-700" id={id}>
      {message}
    </span>
  ) : null;
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-10 cursor-pointer rounded-xl border-0 bg-red-700 px-3 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Eliminando…" : "Confirmar eliminación"}
    </button>
  );
}

export function ExceptionalBlocksPanel({
  autoOpen,
  blocks,
  created,
  deleted,
  managementError,
  weekStartDate,
}: Readonly<{
  autoOpen: boolean;
  blocks: ExceptionalBlock[];
  created: boolean;
  deleted: boolean;
  managementError: boolean;
  weekStartDate: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, action] = useActionState(
    createExceptionalBlockAction,
    exceptionalBlockFormState,
  );
  useEffect(() => {
    const dialog = dialogRef.current;

    if (autoOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [autoOpen]);

  function closePanel() {
    dialogRef.current?.close();
  }

  function clearPanelQuery() {
    if (autoOpen) {
      router.replace(`/app/agenda?semana=${weekStartDate}`, { scroll: false });
    }
  }

  return (
    <>
      <button
        className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)] sm:w-auto"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <CalendarOff aria-hidden="true" size={17} />
        Bloquear horario
      </button>

      <dialog
        aria-labelledby="exceptional-blocks-title"
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-xl overflow-hidden border-0 bg-white p-0 text-[var(--color-foreground)] shadow-[-1rem_0_3rem_rgb(24_51_48/18%)] backdrop:bg-[rgb(24_51_48/45%)]"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePanel();
          }
        }}
        onClose={clearPanelQuery}
        ref={dialogRef}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 md:px-7">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Agenda
              </p>
              <h2 className="m-0 text-2xl" id="exceptional-blocks-title">
                Bloqueos excepcionales
              </h2>
              <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                Marcá vacaciones, feriados u otros períodos en los que no vas
                a atender.
              </p>
            </div>
            <button
              aria-label="Cerrar bloqueos excepcionales"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
              onClick={closePanel}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
            {created ? (
              <p
                className="m-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
                role="status"
              >
                El bloqueo se guardó correctamente.
              </p>
            ) : deleted ? (
              <p
                className="m-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
                role="status"
              >
                El bloqueo se eliminó y el período volvió a quedar disponible.
              </p>
            ) : managementError ? (
              <p
                className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning-foreground)]"
                role="alert"
              >
                No pudimos gestionar ese bloqueo. Actualizá la agenda e intentá
                nuevamente.
              </p>
            ) : null}

            <form action={action} className="mt-5 flex flex-col gap-4" noValidate>
              <input name="weekStartDate" type="hidden" value={weekStartDate} />

              {state.message ? (
                <p
                  className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
                  role="alert"
                >
                  {state.message}
                </p>
              ) : null}

              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[var(--color-brand)] uppercase">
                <Clock3 aria-hidden="true" size={16} />
                Nuevo período
              </div>

              <label className="text-sm font-semibold">
                Fecha y hora de inicio
                <input
                  aria-describedby={
                    state.fieldErrors.startsAt ? "block-start-error" : undefined
                  }
                  aria-invalid={Boolean(state.fieldErrors.startsAt)}
                  className={inputClassName}
                  defaultValue={state.values?.startsAt}
                  name="startsAt"
                  type="datetime-local"
                />
                <FieldError
                  id="block-start-error"
                  message={state.fieldErrors.startsAt}
                />
              </label>

              <label className="text-sm font-semibold">
                Fecha y hora de finalización
                <input
                  aria-describedby={
                    state.fieldErrors.endsAt ? "block-end-error" : undefined
                  }
                  aria-invalid={Boolean(state.fieldErrors.endsAt)}
                  className={inputClassName}
                  defaultValue={state.values?.endsAt}
                  name="endsAt"
                  type="datetime-local"
                />
                <FieldError
                  id="block-end-error"
                  message={state.fieldErrors.endsAt}
                />
              </label>

              <label className="text-sm font-semibold">
                Motivo
                <select
                  aria-describedby={
                    state.fieldErrors.category
                      ? "block-category-error"
                      : undefined
                  }
                  aria-invalid={Boolean(state.fieldErrors.category)}
                  className={inputClassName}
                  defaultValue={state.values?.category ?? "vacation"}
                  name="category"
                >
                  {exceptionalBlockCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="block-category-error"
                  message={state.fieldErrors.category}
                />
              </label>

              <p className="m-0 text-xs leading-5 text-[var(--color-muted)]">
                No se modificará ningún turno existente. Si el período coincide
                con un turno pendiente o confirmado, primero tendrás que
                cancelarlo o reprogramarlo.
              </p>

              <SubmitButton pendingLabel="Guardando bloqueo…">
                Guardar bloqueo
              </SubmitButton>
            </form>

            <section
              aria-labelledby="current-blocks-title"
              className="mt-7 border-t border-[var(--color-border)] pt-6"
            >
              <h3 className="m-0 text-lg" id="current-blocks-title">
                Bloqueos vigentes
              </h3>

              {blocks.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-8 text-center">
                  <CalendarOff
                    aria-hidden="true"
                    className="mx-auto text-[var(--color-brand)]"
                    size={26}
                  />
                  <h4 className="mt-3 mb-0 text-sm">
                    No hay bloqueos vigentes
                  </h4>
                  <p className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                    Los períodos futuros o en curso aparecerán acá.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {blocks.map((block) => {
                    const category = exceptionalBlockCategories.find(
                      ({ value }) => value === block.category,
                    );

                    return (
                      <article
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4"
                        key={block.id}
                      >
                        <strong className="text-sm">
                          {category?.label ?? "Bloqueo"}
                        </strong>
                        <p className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                          <time dateTime={block.startsAt}>
                            {exceptionalBlockDateFormatter.format(
                              new Date(block.startsAt),
                            )}
                          </time>{" "}
                          —{" "}
                          <time dateTime={block.endsAt}>
                            {exceptionalBlockDateFormatter.format(
                              new Date(block.endsAt),
                            )}
                          </time>
                        </p>

                        <details className="mt-3 border-t border-[var(--color-border)] pt-3">
                          <summary className="min-h-10 cursor-pointer list-none py-2 text-xs font-bold text-red-700">
                            Eliminar
                          </summary>
                          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3">
                            <p className="m-0 text-xs font-semibold text-red-900">
                              ¿Eliminar este bloqueo?
                            </p>
                            <p className="mt-1 mb-3 text-xs leading-5 text-red-800">
                              El período volverá a quedar disponible para nuevos
                              turnos.
                            </p>
                            <form action={deleteExceptionalBlockAction}>
                              <input
                                name="blockId"
                                type="hidden"
                                value={block.id}
                              />
                              <input
                                name="weekStartDate"
                                type="hidden"
                                value={weekStartDate}
                              />
                              <DeleteButton />
                            </form>
                          </div>
                        </details>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </dialog>
    </>
  );
}
