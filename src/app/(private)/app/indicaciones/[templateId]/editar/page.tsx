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
};

export default async function EditInstructionPage({
  params,
}: EditInstructionPageProps) {
  const { templateId: templateIdValue } = await params;
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
          }
        }
        template={template}
      />
    </main>
  );
}
