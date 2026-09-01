import {
  ArrowRight,
  BookOpenText,
  FilePenLine,
  Plus,
  Printer,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  instructionListStyles,
  instructionSpecialties,
  type InstructionTemplate,
} from "@/modules/instructions/domain/instruction-template";
import { listInstructionTemplates } from "@/modules/instructions/repository";

export const metadata: Metadata = {
  title: "Indicaciones | OdontoSync",
  description: "Creá y reutilizá tus indicaciones profesionales imprimibles.",
};

const updatedAtFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

function groupTemplates(templates: InstructionTemplate[]) {
  return instructionSpecialties.flatMap((specialty) => {
    const specialtyTemplates = templates.filter(
      (template) => template.specialty === specialty.value,
    );

    return specialtyTemplates.length > 0
      ? [{ ...specialty, templates: specialtyTemplates }]
      : [];
  });
}

export default async function InstructionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    redirect("/ingresar");
  }

  const templates = await listInstructionTemplates(userId);
  const groups = groupTemplates(templates);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#17332f] px-5 py-7 text-white shadow-[0_1.5rem_4rem_rgb(21_48_45/16%)] md:px-9 md:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full border-[3rem] border-[rgb(36_155_145/20%)]"
        />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[0.7rem] font-bold tracking-[0.14em] text-[#8ed5cf] uppercase">
              Biblioteca profesional
            </p>
            <h1 className="m-0 max-w-2xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.055em]">
              Tus indicaciones, listas para usar.
            </h1>
            <p className="mt-4 mb-0 max-w-xl text-sm leading-6 text-[#d6e7e4]">
              Organizalas por especialidad, ajustá el contenido y prepará una
              hoja clara para imprimir cuando la necesites.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#37aea4] px-5 text-sm font-bold text-[#102b28] no-underline shadow-[0_0.7rem_2rem_rgb(0_0_0/18%)] transition-colors hover:bg-[#72cfc7]"
            href="/app/indicaciones/nueva"
          >
            <Plus aria-hidden="true" size={18} />
            Nueva indicación
          </Link>
        </div>
      </header>

      {templates.length === 0 ? (
        <section className="mt-6 grid min-h-[25rem] place-items-center rounded-[var(--radius-large)] border border-dashed border-[var(--color-border)] bg-white px-6 py-12 text-center shadow-[var(--shadow-card)]">
          <div className="max-w-md">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
              <BookOpenText aria-hidden="true" size={27} />
            </span>
            <h2 className="mt-5 mb-0 text-2xl tracking-[-0.035em]">
              Tu biblioteca empieza en blanco
            </h2>
            <p className="mt-3 mb-0 text-sm leading-6 text-[var(--color-muted)]">
              Creá la primera indicación con tus propias palabras. Después
              podrás editarla y volver a imprimirla cuando quieras.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 text-sm font-bold text-white no-underline hover:bg-[var(--color-brand-dark)]"
              href="/app/indicaciones/nueva"
            >
              Crear primera indicación
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-6">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Especialidades
            </p>
            <nav aria-label="Especialidades con indicaciones" className="mt-3">
              <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 lg:flex-col lg:overflow-visible">
                {groups.map((group) => (
                  <li className="shrink-0" key={group.value}>
                    <Link
                      className="flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 text-xs font-semibold text-[var(--color-muted)] no-underline hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-dark)]"
                      href={`#${group.value}`}
                    >
                      {group.label}
                      <span className="grid min-w-6 place-items-center rounded-full bg-[var(--color-neutral-soft)] px-1.5 py-1 text-[0.62rem]">
                        {group.templates.length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-col gap-8">
            {groups.map((group) => (
              <section aria-labelledby={`${group.value}-title`} id={group.value} key={group.value}>
                <div className="mb-3 flex items-end justify-between gap-4 px-1">
                  <div>
                    <p className="m-0 text-[0.66rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                      Especialidad
                    </p>
                    <h2 className="mt-1 mb-0 text-xl" id={`${group.value}-title`}>
                      {group.label}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-muted)]">
                    {group.templates.length}{" "}
                    {group.templates.length === 1 ? "plantilla" : "plantillas"}
                  </span>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {group.templates.map((template) => {
                    const listStyle = instructionListStyles.find(
                      ({ value }) => value === template.listStyle,
                    );

                    return (
                      <article
                        className="group rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[#9bcac5]"
                        key={template.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand-dark)]">
                            {listStyle?.sample ?? "•"}
                          </span>
                          <span className="text-[0.66rem] text-[var(--color-muted)]">
                            Editada{" "}
                            {updatedAtFormatter.format(new Date(template.updatedAt))}
                          </span>
                        </div>
                        <h3 className="mt-5 mb-0 text-lg leading-6 tracking-[-0.025em] [overflow-wrap:anywhere]">
                          {template.title}
                        </h3>
                        <p className="mt-2 mb-0 text-xs text-[var(--color-muted)]">
                          {template.points.length}{" "}
                          {template.points.length === 1 ? "indicación" : "indicaciones"}
                          {listStyle ? ` · ${listStyle.label}` : ""}
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-4">
                          <Link
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                            href={`/app/indicaciones/${template.id}/editar`}
                          >
                            <FilePenLine aria-hidden="true" size={15} />
                            Editar
                          </Link>
                          <Link
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-foreground)] text-xs font-bold text-white no-underline hover:bg-[var(--color-brand-dark)]"
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
        </div>
      )}
    </main>
  );
}
