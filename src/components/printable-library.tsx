import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

import { printableDefinitions } from "@/modules/printables/domain/printable";

export function PrintableLibrary() {
  return (
    <main className="mx-auto w-full max-w-[90rem] px-3 py-5 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="relative overflow-hidden rounded-[1.5rem] bg-[#17332f] px-4 py-5 text-white shadow-[0_1.25rem_3rem_rgb(21_48_45/14%)] md:rounded-[1.75rem] md:px-8 md:py-8">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 size-60 rounded-full border-[2.5rem] border-[rgb(36_155_145/18%)]"
        />
        <div className="relative max-w-2xl">
          <p className="mb-1 text-[0.62rem] font-bold tracking-[0.14em] text-[#8ed5cf] uppercase md:mb-2 md:text-[0.68rem]">
            Biblioteca profesional
          </p>
          <h1 className="m-0 text-[1.55rem] leading-[1.08] tracking-[-0.05em] md:text-[clamp(1.8rem,3vw,2.75rem)] md:leading-[1.05]">
            Imprimibles para completar a mano.
          </h1>
          <p className="mt-2 mb-0 max-w-xl text-xs leading-5 text-[#d6e7e4] md:mt-3 md:text-sm md:leading-6">
            Revisá la plantilla y preparala para imprimir o guardar como PDF.
          </p>
        </div>
      </header>

      <aside className="mt-5 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)]">
        <p className="m-0 text-[0.78rem] leading-6">
          <strong>
            Plantilla académica vacía.
          </strong>{" "}
          No ingresa ni guarda datos. Requiere validación profesional y jurídica
          antes de cualquier uso real.
        </p>
      </aside>

      <section
        aria-label="Papelería disponible"
        className="mt-5 grid gap-4 md:grid-cols-2"
      >
        {printableDefinitions.map((printable) => {
          return (
            <Link
              className="group flex min-h-44 flex-col rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-[var(--color-foreground)] no-underline shadow-[var(--shadow-card)] transition-colors hover:border-[#9bc8c2] hover:bg-[var(--color-brand-subtle)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] md:p-6"
              href={`/app/imprimibles/${printable.id}`}
              key={printable.id}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <FileText aria-hidden="true" size={21} />
              </span>
              <h2 className="mt-5 mb-0 text-xl tracking-[-0.035em]">
                {printable.title}
              </h2>
              <p className="mt-2 mb-5 text-sm leading-6 text-[var(--color-muted)]">
                {printable.description}
              </p>
              <span className="mt-auto inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-brand-dark)]">
                Ver e imprimir
                <ArrowRight aria-hidden="true" size={17} />
              </span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
