import type { Metadata } from "next";
import Link from "next/link";

import { InitialConfigurationForm } from "@/components/initial-configuration-form";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export const metadata: Metadata = {
  title: "Configuración | OdontoSync",
  description: "Configurá tu perfil y tus preferencias de agenda.",
};

export default async function ConfigurationPage() {
  const configuration = await getInitialConfiguration();
  const isInitialSetup =
    !configuration || configuration.availability.length === 0;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 md:px-8 md:py-12">
      <header className="mb-7">
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          {isInitialSetup ? "Configuración inicial" : "Configuración"}
        </p>
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
          {isInitialSetup ? "Prepará tu agenda" : "Ajustá tu espacio"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          {isInitialSetup
            ? "Estos valores se usarán como base para calcular horarios disponibles. Podrás modificarlos más adelante."
            : "Actualizá tu perfil profesional y la forma en que organizás la agenda."}
        </p>
      </header>

      <nav
        aria-label="Secciones de configuración"
        className="mb-5 flex flex-wrap gap-2"
      >
        <Link
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href="#perfil"
        >
          Perfil profesional
        </Link>
        <Link
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href="#agenda"
        >
          Configuración de agenda
        </Link>
      </nav>

      <InitialConfigurationForm
        initialConfiguration={
          configuration ?? {
            fullName: "",
            licenseNumber: null,
            licenseJurisdiction: null,
            gridIntervalMinutes: 15,
            defaultAppointmentDurationMinutes: 30,
            defaultCleanupMinutes: 5,
            availability: [],
          }
        }
        isInitialSetup={isInitialSetup}
      />
    </main>
  );
}
