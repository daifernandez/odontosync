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
      status: configuration.fullName ? "Configurado" : "Pendiente",
      icon: UserRound,
    },
    {
      href: "/app/configuracion/documentos",
      title: "Datos para pacientes",
      description: "Información reutilizable en indicaciones.",
      status: hasDocumentData ? "Con datos" : "Sin datos · opcional",
      icon: FileText,
    },
    {
      href: "/app/configuracion/agenda",
      title: "Preferencias de agenda",
      description: "Duración habitual, grilla y acondicionamiento.",
      status: `${configuration.defaultAppointmentDurationMinutes} min por turno`,
      icon: CalendarClock,
    },
    {
      href: "/app/configuracion/horarios",
      title: "Horarios habituales",
      description: "Días y bloques semanales de atención.",
      status: configuration.availability.length > 0 ? `${new Set(configuration.availability.map(block => block.dayOfWeek)).size} días de atención` : "Pendiente",
      icon: Clock3,
    },
  ] as const;

  return (
    <section aria-labelledby="configuration-summary-title">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-2xl tracking-[-0.03em] sm:text-[1.75rem]" id="configuration-summary-title">
            <span className="xl:hidden">Configuración</span>
            <span className="hidden xl:inline">Resumen</span>
          </h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            <span className="xl:hidden">Administrá tu cuenta y tus preferencias desde un solo lugar.</span>
            <span className="hidden xl:inline">Entrá en una sección para revisar o actualizar sus datos.</span>
          </p>
        </div>

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
              <span className={`col-start-2 row-start-3 mt-1 justify-self-start sm:mt-0 sm:self-start rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Pendiente" ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]" : "bg-[var(--color-brand-subtle)] text-[var(--color-brand-dark)]"}`}>
                {status}
              </span>
            </div>
            <h3 className="col-start-2 row-start-1 m-0 min-w-0 text-base leading-6 sm:mt-4 sm:mb-1">{title}</h3>
            <p className="col-span-2 col-start-2 m-0 flex min-w-0 items-end gap-2 text-sm leading-6 text-[var(--color-muted)]">
              <span className="flex-1">{description}</span>
              <ChevronRight aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-0.5" size={18} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
