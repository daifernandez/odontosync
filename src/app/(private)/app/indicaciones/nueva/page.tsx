import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { InstructionTemplateForm } from "@/components/instruction-template-form";
import { getProfile } from "@/modules/initial-configuration/repository";

export const metadata: Metadata = {
  title: "Nueva plantilla | OdontoSync",
  description: "Creá una indicación profesional reutilizable.",
};

export default async function NewInstructionPage() {
  const profile = await getProfile();

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
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
          Nueva plantilla
        </h1>
        <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
          Completá el contenido y revisá cómo quedará impreso.
        </p>
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
      />
    </main>
  );
}
