"use client";

import {
  Copy,
  Ellipsis,
  FilePenLine,
  Printer,
  RotateCcw,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  instructionListStyles,
  instructionTemplateManagementState,
  instructionSpecialties,
  type InstructionTemplate,
} from "@/modules/instructions/domain/instruction-template";
import {
  deleteInstructionTemplateAction,
  duplicateInstructionTemplateAction,
} from "@/modules/instructions/actions";

type SpecialtyFilter = "all" | InstructionTemplate["specialty"];

const combiningMarksPattern = /\p{M}/gu;

const updatedAtFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(combiningMarksPattern, "")
    .toLocaleLowerCase("es");
}

export function filterInstructionTemplates(
  templates: InstructionTemplate[],
  query: string,
  specialty: SpecialtyFilter,
) {
  const normalizedQuery = normalizeSearchText(query.trim());

  return templates.filter((template) => {
    if (specialty !== "all" && template.specialty !== specialty) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      template.title,
      template.introduction ?? "",
      ...template.points,
    ].join(" ");

    return normalizeSearchText(searchableText).includes(normalizedQuery);
  });
}

function groupInstructionTemplates(templates: InstructionTemplate[]) {
  return instructionSpecialties.flatMap((specialty) => {
    const specialtyTemplates = templates.filter(
      (template) => template.specialty === specialty.value,
    );

    return specialtyTemplates.length > 0
      ? [{ ...specialty, templates: specialtyTemplates }]
      : [];
  });
}

function ManagementSubmitButton({
  children,
  destructive = false,
  pendingLabel,
}: Readonly<{
  children: React.ReactNode;
  destructive?: boolean;
  pendingLabel: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className={
        destructive
          ? "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-red-700 px-4 text-xs font-bold text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-70"
          : "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-left text-xs font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-brand-soft)] disabled:cursor-wait disabled:opacity-70"
      }
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function InstructionTemplateManagement({
  onDeleted,
  template,
}: Readonly<{
  onDeleted: (templateId: string, title: string) => void;
  template: InstructionTemplate;
}>) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handledDeletion = useRef(false);
  const [duplicateState, duplicateAction] = useActionState(
    duplicateInstructionTemplateAction.bind(null, template.id),
    instructionTemplateManagementState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteInstructionTemplateAction.bind(null, template.id),
    instructionTemplateManagementState,
  );

  useEffect(() => {
    if (deleteState.status === "success" && !handledDeletion.current) {
      handledDeletion.current = true;
      dialogRef.current?.close();
      onDeleted(template.id, template.title);
    }
  }, [deleteState.status, onDeleted, template.id, template.title]);

  function openDeleteConfirmation() {
    detailsRef.current?.removeAttribute("open");
    dialogRef.current?.showModal();
  }

  function closeDeleteConfirmation() {
    dialogRef.current?.close();
  }

  return (
    <>
      <details className="relative" ref={detailsRef}>
        <summary
          aria-label={`Más acciones para ${template.title}`}
          className="grid min-h-11 cursor-pointer list-none place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] [&::-webkit-details-marker]:hidden"
        >
          <Ellipsis aria-hidden="true" size={18} />
        </summary>
        <div className="absolute right-0 bottom-[calc(100%+0.5rem)] z-20 w-52 rounded-xl border border-[var(--color-border)] bg-white p-1.5 shadow-[0_1rem_2.5rem_rgb(24_51_48/18%)]">
          <form action={duplicateAction}>
            <ManagementSubmitButton pendingLabel="Duplicando…">
              <Copy aria-hidden="true" size={15} />
              Duplicar
            </ManagementSubmitButton>
          </form>
          <button
            className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-left text-xs font-semibold text-red-700 hover:bg-red-50"
            onClick={openDeleteConfirmation}
            type="button"
          >
            <Trash2 aria-hidden="true" size={15} />
            Eliminar
          </button>
          {duplicateState.status === "error" ? (
            <p
              className="m-1 rounded-lg bg-[var(--color-warning-soft)] px-2.5 py-2 text-[0.7rem] leading-4 text-[var(--color-warning-foreground)]"
              role="alert"
            >
              {duplicateState.message}
            </p>
          ) : null}
        </div>
      </details>

      <dialog
        aria-labelledby={`delete-template-${template.id}-title`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-0 text-[var(--color-foreground)] shadow-[0_1.5rem_4rem_rgb(24_51_48/22%)] backdrop:bg-[rgb(24_51_48/45%)]"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDeleteConfirmation();
          }
        }}
        ref={dialogRef}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.68rem] font-bold tracking-[0.12em] text-red-700 uppercase">
                Eliminar plantilla
              </p>
              <h2
                className="m-0 text-xl tracking-[-0.03em]"
                id={`delete-template-${template.id}-title`}
              >
                ¿Eliminar esta plantilla?
              </h2>
            </div>
            <button
              aria-label="Cerrar confirmación"
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
              onClick={closeDeleteConfirmation}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <p className="mt-4 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Vas a eliminar <strong>“{template.title}”</strong>. Esta acción no
            se puede deshacer.
          </p>
          {deleteState.status === "error" ? (
            <p
              className="mt-4 mb-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2.5 text-xs leading-5 text-[var(--color-warning-foreground)]"
              role="alert"
            >
              {deleteState.message}
            </p>
          ) : null}
          <form action={deleteAction} className="mt-5 flex gap-2">
            <button
              className="min-h-11 flex-1 cursor-pointer rounded-xl border border-[var(--color-border)] bg-white px-4 text-xs font-bold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)]"
              onClick={closeDeleteConfirmation}
              type="button"
            >
              Cancelar
            </button>
            <ManagementSubmitButton destructive pendingLabel="Eliminando…">
              <Trash2 aria-hidden="true" size={15} />
              Sí, eliminar
            </ManagementSubmitButton>
          </form>
        </div>
      </dialog>
    </>
  );
}

export function InstructionTemplateLibrary({
  templates,
}: {
  templates: InstructionTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<SpecialtyFilter>("all");
  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>([]);
  const [managementFeedback, setManagementFeedback] = useState<string>();
  const visibleTemplates = templates.filter(
    (template) => !deletedTemplateIds.includes(template.id),
  );
  const filteredTemplates = filterInstructionTemplates(
    visibleTemplates,
    query,
    specialty,
  );
  const groups = groupInstructionTemplates(filteredTemplates);
  const hasActiveFilters = query.trim().length > 0 || specialty !== "all";

  function clearFilters() {
    setQuery("");
    setSpecialty("all");
  }

  function handleDeleted(templateId: string, title: string) {
    setDeletedTemplateIds((currentIds) => [...currentIds, templateId]);
    setManagementFeedback(`Eliminaste “${title}”.`);
  }

  return (
    <div className="mt-4 md:mt-6">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-8">
        <label
          className="relative flex min-h-11 min-w-0 items-center border-b border-[var(--color-border)] transition-colors focus-within:border-[var(--color-brand)]"
          htmlFor="instruction-search"
        >
          <span className="sr-only">Buscar indicaciones</span>
          <Search
            aria-hidden="true"
            className="ml-1 shrink-0 text-[var(--color-muted)]"
            size={17}
          />
          <input
            className="min-h-11 min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-sm outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            id="instruction-search"
            maxLength={120}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar indicaciones"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Limpiar búsqueda"
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-dark)]"
              onClick={() => setQuery("")}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
        </label>

        <label
          className="flex min-h-11 min-w-0 items-center gap-2 border-b border-[var(--color-border)] px-1 transition-colors focus-within:border-[var(--color-brand)] md:min-w-64"
          htmlFor="instruction-specialty-filter"
        >
          <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
            Especialidad
          </span>
          <span aria-hidden="true" className="text-[var(--color-border)]">
            ·
          </span>
          <select
            className="min-h-11 min-w-0 flex-1 cursor-pointer border-0 bg-transparent pr-1 text-sm font-semibold text-[var(--color-foreground)] outline-none"
            id="instruction-specialty-filter"
            onChange={(event) =>
              setSpecialty(event.target.value as SpecialtyFilter)
            }
            value={specialty}
          >
            <option value="all">Todas</option>
            {instructionSpecialties.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasActiveFilters ? (
        <p aria-atomic="true" aria-live="polite" className="sr-only">
          {filteredTemplates.length}{" "}
          {filteredTemplates.length === 1 ? "resultado" : "resultados"}
        </p>
      ) : null}

      {hasActiveFilters && groups.length > 0 ? (
        <div className="mt-2 flex min-h-7 items-center justify-end px-1">
          <button
            aria-label="Restablecer filtros"
            className="relative inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full border border-[rgb(219_230_228/70%)] bg-white/70 px-2 text-xs! font-semibold text-[var(--color-brand-dark)] transition-colors after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-[''] hover:border-[#9bcac5] hover:bg-[var(--color-brand-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] sm:min-h-9 sm:gap-1.5 sm:px-3"
            onClick={clearFilters}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={10} />
            Restablecer<span className="hidden sm:inline"> filtros</span>
          </button>
        </div>
      ) : null}

      {managementFeedback ? (
        <p
          className="mt-4 mb-0 w-fit max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-2.5 text-xs font-semibold text-[var(--color-brand-dark)]"
          role="status"
        >
          {managementFeedback}
        </p>
      ) : null}

      {groups.length === 0 ? (
        <section
          aria-labelledby="no-instruction-results-title"
          className="mt-5 grid min-h-52 place-items-center rounded-[var(--radius-large)] border border-dashed border-[var(--color-border)] bg-white px-4 py-8 text-center shadow-[var(--shadow-card)] sm:min-h-64 sm:px-6 sm:py-10"
        >
          <div className="max-w-sm">
            <span className="mx-auto grid size-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] sm:size-12 sm:rounded-2xl">
              <SearchX aria-hidden="true" size={21} />
            </span>
            <h2
              className="mt-3 mb-0 text-lg tracking-[-0.03em] sm:mt-4 sm:text-xl"
              id="no-instruction-results-title"
            >
              No encontramos indicaciones
            </h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
              Probá con otras palabras o elegí otra especialidad.
            </p>
            <button
              className="mt-4 min-h-11 cursor-pointer rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] sm:mt-5"
              onClick={clearFilters}
              type="button"
            >
              Limpiar filtros
            </button>
          </div>
        </section>
      ) : (
        <div className="mt-8 flex min-w-0 flex-col gap-7 md:mt-14 md:gap-9">
          {groups.map((group) => (
            <section
              aria-labelledby={`${group.value}-title`}
              id={group.value}
              key={group.value}
            >
              <div className="mb-2 flex items-center justify-between gap-4 px-1 sm:mb-3">
                <h2
                  className="m-0 text-lg sm:text-xl"
                  id={`${group.value}-title`}
                >
                  {group.label}
                </h2>
                <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--color-brand-dark)] sm:px-2.5 sm:py-1 sm:text-xs">
                  {group.templates.length}{" "}
                  {group.templates.length === 1 ? "plantilla" : "plantillas"}
                </span>
              </div>

              <div className="grid gap-3">
                {group.templates.map((template) => {
                  const listStyle = instructionListStyles.find(
                    ({ value }) => value === template.listStyle,
                  );
                  const preview = template.introduction ?? template.points[0];

                  return (
                    <article
                      className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[#9bcac5] sm:gap-4 sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center"
                      key={template.id}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand-dark)] sm:size-11 sm:rounded-xl">
                        {listStyle?.sample ?? "•"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="m-0 text-base leading-5 tracking-[-0.025em] [overflow-wrap:anywhere] sm:text-lg sm:leading-6">
                            {template.title}
                          </h3>
                          <span className="hidden text-[0.66rem] text-[var(--color-muted)] sm:inline">
                            Editada{" "}
                            {updatedAtFormatter.format(
                              new Date(template.updatedAt),
                            )}
                          </span>
                        </div>
                        <p className="mt-1.5 mb-0 line-clamp-1 text-[0.8rem] leading-5 text-[var(--color-muted)] sm:mt-2 sm:line-clamp-2 sm:text-sm">
                          {preview}
                        </p>
                        <p className="mt-1.5 mb-0 text-[0.7rem] font-semibold text-[var(--color-brand-dark)] sm:mt-2 sm:text-xs">
                          {template.points.length}{" "}
                          {template.points.length === 1
                            ? "indicación"
                            : "indicaciones"}
                          {listStyle ? ` · ${listStyle.label}` : ""}
                        </p>
                      </div>
                      <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 border-t border-[var(--color-border)] pt-3 sm:pt-4 lg:col-span-1 lg:w-80 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                        <Link
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                          href={`/app/indicaciones/${template.id}/editar`}
                        >
                          <FilePenLine aria-hidden="true" size={15} />
                          Editar
                        </Link>
                        <Link
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-foreground)] text-xs font-bold text-white no-underline hover:bg-[var(--color-brand-dark)]"
                          href={`/app/indicaciones/${template.id}/imprimir`}
                        >
                          <Printer aria-hidden="true" size={15} />
                          Ver e imprimir
                        </Link>
                        <InstructionTemplateManagement
                          onDeleted={handleDeleted}
                          template={template}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
