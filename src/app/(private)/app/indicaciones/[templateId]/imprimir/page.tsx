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
    <main className="px-4 py-7 md:px-8 md:py-10">
      <div className="instruction-screen-only mx-auto mb-5 max-w-[60rem]">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:underline"
          href="/app/indicaciones"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver a la biblioteca
        </Link>

        {feedback ? (
          <p
            className="mt-4 mb-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Vista final
            </p>
            <p className="mt-1 mb-0 text-xs leading-5 text-[var(--color-muted)]">
              Revisá la hoja y luego elegí imprimir o guardar como PDF desde tu
              navegador.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
              href={`/app/indicaciones/${template.id}/editar`}
            >
              <FilePenLine aria-hidden="true" size={17} />
              Editar
            </Link>
            <PrintInstructionButton />
          </div>
        </div>
      </div>

      <div className="instruction-print-root mx-auto max-w-[60rem]">
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
