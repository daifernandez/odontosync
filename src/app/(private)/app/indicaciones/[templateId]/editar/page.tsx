import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InstructionTemplateForm } from "@/components/instruction-template-form";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/modules/initial-configuration/repository";
import { validateInstructionTemplateId } from "@/modules/instructions/domain/instruction-template";
import { getInstructionTemplate } from "@/modules/instructions/repository";

export const metadata: Metadata = {
  title: "Editar indicación | OdontoSync",
  description: "Actualizá una indicación profesional reutilizable.",
};

type EditInstructionPageProps = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ duplicada?: string | string[] }>;
};

export default async function EditInstructionPage({
  params,
  searchParams,
}: EditInstructionPageProps) {
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

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-10">
      <Link
        className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:underline"
        href="/app/indicaciones"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Volver a la biblioteca
      </Link>

      {query.duplicada === "1" ? (
        <p
          className="mt-3 mb-0 w-fit max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-2.5 text-xs leading-5 font-semibold text-[var(--color-brand-dark)] md:mt-4 md:px-4 md:py-3 md:text-sm"
          role="status"
        >
          Creamos una copia independiente. Podés editarla sin modificar la
          original.
        </p>
      ) : null}

      <header className="mt-4">
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          Editar plantilla
        </p>
        <h1 className="m-0 max-w-3xl text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em] [overflow-wrap:anywhere]">
          {template.title}
        </h1>
      </header>

      <InstructionTemplateForm
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
