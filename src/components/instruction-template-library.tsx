"use client";

import {
  FilePenLine,
  Printer,
  RotateCcw,
  Search,
  SearchX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  instructionListStyles,
  instructionSpecialties,
  type InstructionTemplate,
} from "@/modules/instructions/domain/instruction-template";

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

export function InstructionTemplateLibrary({
  templates,
}: {
  templates: InstructionTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<SpecialtyFilter>("all");
  const filteredTemplates = filterInstructionTemplates(
    templates,
    query,
    specialty,
  );
  const groups = groupInstructionTemplates(filteredTemplates);
  const hasActiveFilters = query.trim().length > 0 || specialty !== "all";

  function clearFilters() {
    setQuery("");
    setSpecialty("all");
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
                      <div className="col-span-2 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 sm:pt-4 lg:col-span-1 lg:w-72 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
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
