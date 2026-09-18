import type { Metadata } from "next";

import { ConfigurationNavigation } from "@/components/configuration-navigation";

export const metadata: Metadata = {
  title: "Configuración | OdontoSync",
  description: "Configurá tu perfil y tus preferencias de agenda.",
};

export default function ConfigurationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-8 md:py-10">
      <header className="mb-7 hidden lg:block">
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">Tu espacio</p>
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">Configuración</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Administrá tu cuenta, la información de tus documentos y la forma en que organizás la agenda.
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <ConfigurationNavigation />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
