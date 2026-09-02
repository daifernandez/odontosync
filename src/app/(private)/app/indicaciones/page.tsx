import { ArrowRight, BookOpenText, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InstructionTemplateLibrary } from "@/components/instruction-template-library";
import { createClient } from "@/lib/supabase/server";
import { listInstructionTemplates } from "@/modules/instructions/repository";

export const metadata: Metadata = {
  title: "Indicaciones | OdontoSync",
  description: "Creá y reutilizá tus indicaciones profesionales imprimibles.",
};

export default async function InstructionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    redirect("/ingresar");
  }

  const templates = await listInstructionTemplates(userId);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-3 py-5 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="relative overflow-hidden rounded-[1.5rem] bg-[#17332f] px-4 py-4 text-white shadow-[0_1.25rem_3rem_rgb(21_48_45/14%)] md:rounded-[1.75rem] md:px-8 md:py-7">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 size-60 rounded-full border-[2.5rem] border-[rgb(36_155_145/18%)]"
        />
        <div className="relative flex flex-col gap-3 md:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-[0.62rem] font-bold tracking-[0.14em] text-[#8ed5cf] uppercase md:mb-2 md:text-[0.68rem]">
              Biblioteca profesional
            </p>
            <h1 className="m-0 max-w-2xl text-[1.55rem] leading-[1.08] tracking-[-0.05em] md:text-[clamp(1.8rem,3vw,2.75rem)] md:leading-[1.05]">
              Tus indicaciones, listas para usar.
            </h1>
            <p className="mt-2 mb-0 line-clamp-2 max-w-2xl text-xs leading-5 text-[#d6e7e4] md:mt-3 md:line-clamp-none md:text-sm md:leading-6">
              Organizalas por especialidad, ajustá el contenido y prepará una
              hoja clara para imprimir cuando la necesites.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#37aea4] px-3 text-xs font-bold text-[#102b28] no-underline shadow-[0_0.6rem_1.5rem_rgb(0_0_0/16%)] transition-colors hover:bg-[#72cfc7] md:px-4 md:text-sm"
            href="/app/indicaciones/nueva"
          >
            <Plus aria-hidden="true" size={18} />
            Nueva indicación
          </Link>
        </div>
      </header>

      {templates.length === 0 ? (
        <section className="mt-6 grid min-h-72 place-items-center rounded-[var(--radius-large)] border border-dashed border-[var(--color-border)] bg-white px-4 py-8 text-center shadow-[var(--shadow-card)] sm:min-h-[25rem] sm:px-6 sm:py-12">
          <div className="max-w-md">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] sm:size-14 sm:rounded-2xl">
              <BookOpenText aria-hidden="true" size={25} />
            </span>
            <h2 className="mt-4 mb-0 text-xl tracking-[-0.035em] sm:mt-5 sm:text-2xl">
              Tu biblioteca empieza en blanco
            </h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)] sm:mt-3">
              Creá la primera indicación con tus propias palabras. Después
              podrás editarla y volver a imprimirla cuando quieras.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 text-sm font-bold text-white no-underline hover:bg-[var(--color-brand-dark)] sm:mt-6"
              href="/app/indicaciones/nueva"
            >
              Crear primera indicación
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      ) : (
        <InstructionTemplateLibrary templates={templates} />
      )}
    </main>
  );
}
