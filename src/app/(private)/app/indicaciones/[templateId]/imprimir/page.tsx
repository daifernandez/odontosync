import { ArrowLeft, FilePenLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InstructionDocument } from "@/components/instruction-document";
import { PrintInstructionButton } from "@/components/print-instruction-button";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/modules/initial-configuration/repository";
import { validateInstructionTemplateId } from "@/modules/instructions/domain/instruction-template";
import { getInstructionTemplate } from "@/modules/instructions/repository";

export const metadata: Metadata = {
  title: "Vista imprimible | OdontoSync",
  description: "Revisá e imprimí una indicación profesional.",
};

type PrintableInstructionPageProps = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{
    creada?: string | string[];
    actualizada?: string | string[];
  }>;
};

function readSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function PrintableInstructionPage({
  params,
  searchParams,
}: PrintableInstructionPageProps) {
  const [{ templateId: templateIdValue }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const templateId = validateInstructionTemplateId(templateIdValue);

  if (!templateId) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    notFound();
  }

  const [template, profile] = await Promise.all([
    getInstructionTemplate(templateId, userId),
    getProfile(),
  ]);

  if (!template) {
    notFound();
  }

  const feedback =
    readSearchParam(query.creada) === "1"
      ? "La indicación quedó guardada. Esta es su vista imprimible."
      : readSearchParam(query.actualizada) === "1"
        ? "Los cambios quedaron guardados y ya aparecen en la vista imprimible."
        : null;

  return (
    <main className="px-3 py-5 md:px-8 md:py-10">
      <div className="instruction-screen-only mx-auto max-w-[30rem] md:max-w-[60rem] mb-4 md:mb-5">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:underline sm:text-sm"
          href="/app/indicaciones"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver a la biblioteca
        </Link>

        {feedback ? (
          <p
            className="mt-3 mb-0 w-fit max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-2.5 text-xs leading-5 font-semibold text-[var(--color-brand-dark)] md:mt-4 md:px-4 md:py-3 md:text-sm"
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2.5 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] min-[30rem]:grid min-[30rem]:grid-cols-[auto_minmax(0,1fr)] min-[30rem]:items-center min-[30rem]:gap-3 md:mt-4 md:flex md:items-center md:justify-between md:rounded-[var(--radius-large)] md:p-4">
          <div>
            <p className="m-0 text-[0.62rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase md:text-[0.68rem]">
              Vista final
            </p>
            <p className="mt-1 mb-0 hidden text-[0.72rem] leading-[1.1rem] text-[var(--color-muted)] md:block md:text-xs md:leading-5">
              Revisá la hoja y luego elegí imprimir o guardar como PDF desde tu
              navegador.
            </p>
          </div>
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 md:flex md:flex-row">
            <Link
              className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-2 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)] md:px-4 md:text-sm"
              href={`/app/indicaciones/${template.id}/editar`}
            >
              <FilePenLine aria-hidden="true" size={17} />
              Editar
            </Link>
            <PrintInstructionButton />
          </div>
        </div>
      </div>

      <div className="instruction-print-root mx-auto max-w-[30rem] md:max-w-[60rem]">
        <InstructionDocument
          profile={
            profile ?? {
              fullName: "Profesional odontológico",
              licenseNumber: null,
              licenseJurisdiction: null,
            }
          }
          template={template}
        />
      </div>
    </main>
  );
}
