import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintableInstructionView } from "@/components/printable-instruction-view";
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
      <div className="instruction-screen-only mx-auto mb-4 max-w-[30rem] md:mb-5 md:max-w-[60rem]">
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
      </div>

      <PrintableInstructionView
        profile={
          profile ?? {
            fullName: "Profesional odontológico",
            licenseNumber: null,
            licenseJurisdiction: null,
            clinicName: null,
            officeAddress: null,
            contactPhone: null,
            contactEmail: null,
            additionalInformation: null,
          }
        }
        template={template}
      />
    </main>
  );
}
