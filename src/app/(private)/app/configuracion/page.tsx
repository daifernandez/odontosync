import { CalendarClock, ChevronRight, Clock3, FileText, UserRound } from "lucide-react";
import Link from "next/link";

import { defaultInitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export default async function ConfigurationPage() {
  const configuration =
    (await getInitialConfiguration()) ?? defaultInitialConfiguration;
  const hasDocumentData = Boolean(
    configuration.clinicName ||
      configuration.officeAddress ||
      configuration.contactPhone ||
      configuration.contactEmail ||
      configuration.additionalInformation,
  );

  const sections = [
    {
      href: "/app/configuracion/perfil",
      title: "Cuenta y perfil",
      description: "Foto, nombre profesional y matrícula.",
      status: configuration.fullName ? "Completo" : "Pendiente",
      icon: UserRound,
    },
    {
      href: "/app/configuracion/documentos",
      title: "Datos para pacientes",
      description: "Información reutilizable en indicaciones.",
      status: hasDocumentData ? "Completo" : "Opcional",
      icon: FileText,
    },
    {
      href: "/app/configuracion/agenda",
      title: "Preferencias de agenda",
      description: "Duración habitual, grilla y acondicionamiento.",
      status: "Completo",
      icon: CalendarClock,
    },
    {
      href: "/app/configuracion/horarios",
      title: "Horarios habituales",
      description: "Días y bloques semanales de atención.",
      status: configuration.availability.length > 0 ? "Completo" : "Pendiente",
      icon: Clock3,
    },
  ] as const;
  const completed = sections.filter((section) => section.status !== "Pendiente").length;

  return (
    <section aria-labelledby="configuration-summary-title">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-2xl tracking-[-0.03em]" id="configuration-summary-title">
            <span className="lg:hidden">Configuración</span>
            <span className="hidden lg:inline">Resumen</span>
          </h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            <span className="lg:hidden">Administrá tu cuenta y tus preferencias desde un solo lugar.</span>
            <span className="hidden lg:inline">Entrá en una sección para revisar o actualizar sus datos.</span>
          </p>
        </div>
        <p className="m-0 w-fit rounded-full bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-dark)] sm:bg-transparent sm:p-0 sm:text-sm">
          {completed} de 4 secciones completas
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map(({ href, title, description, status, icon: Icon }) => (
          <Link
            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-foreground)] no-underline shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 sm:flex sm:min-h-36 sm:flex-col sm:items-stretch sm:p-5"
            href={href}
            key={href}
          >
            <div className="contents sm:flex sm:items-start sm:justify-between sm:gap-4">
              <span className="col-start-1 row-span-2 row-start-1 grid size-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] sm:row-auto">
                <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <span className={`col-start-3 row-start-1 justify-self-end rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Pendiente" ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "bg-[var(--color-brand-subtle)] text-[var(--color-brand-dark)]"}`}>
                {status}
              </span>
            </div>
            <h3 className="col-start-2 row-start-1 m-0 min-w-0 text-sm leading-5 sm:mt-4 sm:mb-1 sm:text-base">{title}</h3>
            <p className="col-span-2 col-start-2 m-0 flex min-w-0 items-end gap-2 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
              <span className="flex-1">{description}</span>
              <ChevronRight aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-0.5" size={18} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
