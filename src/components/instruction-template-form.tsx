"use client";

import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import {
  InstructionDocument,
  type InstructionProfessionalProfile,
} from "@/components/instruction-document";
import {
  createInstructionTemplateAction,
  updateInstructionTemplateAction,
} from "@/modules/instructions/actions";
import type { AppointmentSpecialty } from "@/modules/appointments/domain/appointment";
import {
  instructionListStyles,
  instructionSpecialties,
  instructionTemplateFormState,
  type InstructionListStyle,
  type InstructionTemplate,
} from "@/modules/instructions/domain/instruction-template";

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="mt-2 block text-xs font-normal text-red-700" id={id}>
      {message}
    </span>
  ) : null;
}

type InstructionTemplateFormProps = {
  profile: InstructionProfessionalProfile;
  template?: InstructionTemplate;
};

export function InstructionTemplateForm({
  profile,
  template,
}: InstructionTemplateFormProps) {
  const formAction = template
    ? updateInstructionTemplateAction.bind(null, template.id)
    : createInstructionTemplateAction;
  const [state, action] = useActionState(
    formAction,
    instructionTemplateFormState,
  );
  const [title, setTitle] = useState(template?.title ?? "");
  const [specialty, setSpecialty] = useState<AppointmentSpecialty>(
    template?.specialty ?? "general",
  );
  const [introduction, setIntroduction] = useState(
    template?.introduction ?? "",
  );
  const [listStyle, setListStyle] = useState<InstructionListStyle>(
    template?.listStyle ?? "numbered",
  );
  const [points, setPoints] = useState(template?.points ?? [""]);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const selectedListStyle = instructionListStyles.find(
    (style) => style.value === listStyle,
  )!;

  function updatePoint(index: number, value: string) {
    setPoints((current) =>
      current.map((point, pointIndex) =>
        pointIndex === index ? value : point,
      ),
    );
  }

  function movePoint(index: number, direction: -1 | 1) {
    setPoints((current) => {
      const destination = index + direction;

      if (destination < 0 || destination >= current.length) {
        return current;
      }

      const reordered = [...current];
      [reordered[index], reordered[destination]] = [
        reordered[destination],
        reordered[index],
      ];
      return reordered;
    });
  }

  function removePoint(index: number) {
    setPoints((current) =>
      current.length === 1
        ? current
        : current.filter((_, pointIndex) => pointIndex !== index),
    );
  }

  return (
    <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,34rem)_minmax(34rem,1fr)]">
      <div
        aria-label="Alternar entre edición y vista previa"
        className="grid grid-cols-2 rounded-xl bg-[var(--color-brand-subtle)] p-1 xl:hidden"
        role="group"
      >
        <button
          aria-pressed={mobileView === "edit"}
          className={`min-h-11 rounded-lg border-0 px-4 text-sm font-semibold ${mobileView === "edit" ? "bg-white text-[var(--color-brand-dark)] shadow-sm" : "bg-transparent text-[var(--color-muted)]"}`}
          onClick={() => setMobileView("edit")}
          type="button"
        >
          Editar
        </button>
        <button
          aria-pressed={mobileView === "preview"}
          className={`min-h-11 rounded-lg border-0 px-4 text-sm font-semibold ${mobileView === "preview" ? "bg-white text-[var(--color-brand-dark)] shadow-sm" : "bg-transparent text-[var(--color-muted)]"}`}
          onClick={() => setMobileView("preview")}
          type="button"
        >
          Vista previa
        </button>
      </div>

      <form
        action={action}
        className={`${mobileView === "edit" ? "block" : "hidden"} rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-7 xl:block`}
        noValidate
      >
        {state.message ? (
          <p
            className="mb-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-5">
          <label className="text-sm font-semibold">
            Especialidad
            <select
              aria-describedby={
                state.fieldErrors.specialty
                  ? "instruction-specialty-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.specialty)}
              className={fieldClassName}
              name="specialty"
              onChange={(event) =>
                setSpecialty(event.target.value as AppointmentSpecialty)
              }
              value={specialty}
            >
              {instructionSpecialties.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError
              id="instruction-specialty-error"
              message={state.fieldErrors.specialty}
            />
          </label>

          <label className="text-sm font-semibold">
            Título
            <input
              aria-describedby={
                state.fieldErrors.title ? "instruction-title-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.title)}
              autoComplete="off"
              className={fieldClassName}
              maxLength={120}
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Cuidados después de una extracción"
              type="text"
              value={title}
            />
            <FieldError
              id="instruction-title-error"
              message={state.fieldErrors.title}
            />
          </label>

          <label className="text-sm font-semibold">
            Introducción{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (opcional)
            </span>
            <textarea
              aria-describedby={
                state.fieldErrors.introduction
                  ? "instruction-introduction-error"
                  : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.introduction)}
              className={`${fieldClassName} min-h-28 resize-y py-3 leading-6`}
              maxLength={2000}
              name="introduction"
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="Un breve mensaje antes de la lista…"
              value={introduction}
            />
            <FieldError
              id="instruction-introduction-error"
              message={state.fieldErrors.introduction}
            />
          </label>
        </div>

        <fieldset className="mt-7 border-0 p-0">
          <legend className="text-sm font-semibold">Estilo de lista</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.25fr]">
            {instructionListStyles.map((style) => (
              <label className="min-w-0 cursor-pointer" key={style.value}>
                <input
                  checked={listStyle === style.value}
                  className="peer sr-only"
                  name="listStyle"
                  onChange={() => setListStyle(style.value)}
                  type="radio"
                  value={style.value}
                />
                <span className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-2 text-[0.7rem] font-semibold text-[var(--color-muted)] transition-colors peer-checked:border-[var(--color-brand)] peer-checked:bg-[var(--color-brand-soft)] peer-checked:text-[var(--color-brand-dark)] peer-focus-visible:ring-3 peer-focus-visible:ring-[rgb(20_125_115/18%)]">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--color-brand-subtle)] text-[0.62rem] font-bold">
                    {style.sample}
                  </span>
                  <span className="text-center leading-4">
                    {style.value === "odontosync"
                      ? "OdontoSync"
                      : style.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div
            aria-label="Ejemplo del estilo seleccionado"
            className="mt-2 flex min-h-11 items-center gap-2.5 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs text-[var(--color-foreground)]"
          >
            <span className="sr-only">Así se verá en la hoja: </span>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[0.68rem] font-bold text-[var(--color-brand-dark)]">
              {selectedListStyle.sample}
            </span>
            <span>Cepillá suavemente la zona tratada.</span>
          </div>
          <FieldError
            id="instruction-list-style-error"
            message={state.fieldErrors.listStyle}
          />
        </fieldset>

        <fieldset className="mt-7 border-0 p-0">
          <legend className="text-sm font-semibold">Indicaciones</legend>
          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              <p className="mt-1 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                Podés escribir textos extensos y cambiar su orden.
              </p>
            </div>
            <span className="text-[0.68rem] font-bold text-[var(--color-muted)]">
              {points.length}/20
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {points.map((point, index) => (
              <div
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-3"
                key={index}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.68rem] font-bold tracking-[0.08em] text-[var(--color-brand-dark)] uppercase">
                    Punto {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      aria-label={`Subir punto ${index + 1}`}
                      className="grid size-9 place-items-center rounded-lg border-0 bg-white text-[var(--color-muted)] hover:text-[var(--color-brand-dark)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={index === 0}
                      onClick={() => movePoint(index, -1)}
                      type="button"
                    >
                      <ArrowUp aria-hidden="true" size={16} />
                    </button>
                    <button
                      aria-label={`Bajar punto ${index + 1}`}
                      className="grid size-9 place-items-center rounded-lg border-0 bg-white text-[var(--color-muted)] hover:text-[var(--color-brand-dark)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={index === points.length - 1}
                      onClick={() => movePoint(index, 1)}
                      type="button"
                    >
                      <ArrowDown aria-hidden="true" size={16} />
                    </button>
                    <button
                      aria-label={`Quitar punto ${index + 1}`}
                      className="grid size-9 place-items-center rounded-lg border-0 bg-white text-[var(--color-muted)] hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={points.length === 1}
                      onClick={() => removePoint(index)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
                <textarea
                  aria-label={`Texto del punto ${index + 1}`}
                  className={`${fieldClassName} min-h-28 resize-y bg-white py-3 leading-6`}
                  maxLength={1000}
                  name="points"
                  onChange={(event) => updatePoint(index, event.target.value)}
                  placeholder="Escribí la indicación con el detalle necesario…"
                  value={point}
                />
              </div>
            ))}
          </div>

          <button
            className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-brand)] bg-transparent px-4 text-sm font-bold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={points.length >= 20}
            onClick={() => setPoints((current) => [...current, ""])}
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
            Agregar otra indicación
          </button>
          <FieldError
            id="instruction-points-error"
            message={state.fieldErrors.points}
          />
        </fieldset>

        <div className="mt-7 border-t border-[var(--color-border)] pt-5">
          <SubmitButton pendingLabel="Guardando indicación…">
            Guardar y ver imprimible
          </SubmitButton>
          <Link
            className="mt-3 flex min-h-11 items-center justify-center rounded-xl text-sm font-bold text-[var(--color-muted)] no-underline hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
            href="/app/indicaciones"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <section
        aria-labelledby="live-preview-title"
        className={`${mobileView === "preview" ? "block" : "hidden"} xl:sticky xl:top-6 xl:block`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Papel A4
            </p>
            <h2 className="mt-1 mb-0 text-base" id="live-preview-title">
              Vista previa en vivo
            </h2>
          </div>
          <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-[0.68rem] font-semibold text-[var(--color-muted)]">
            Se actualiza mientras escribís
          </span>
        </div>
        <div className="overflow-hidden rounded-[1.7rem] border border-[var(--color-border)] bg-[#dfeae8] p-2 sm:p-5">
          <InstructionDocument
            compact
            profile={profile}
            template={{
              title,
              specialty,
              introduction: introduction || null,
              listStyle,
              points,
            }}
          />
        </div>
      </section>
    </div>
  );
}
