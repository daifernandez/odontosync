"use client";

import {
  CalendarClock,
  ChevronDown,
  Clock3,
  FileText,
  LayoutGrid,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app/configuracion", label: "Resumen", icon: LayoutGrid },
  { href: "/app/configuracion/perfil", label: "Cuenta y perfil", icon: UserRound },
  {
    href: "/app/configuracion/documentos",
    label: "Datos para pacientes",
    icon: FileText,
  },
  {
    href: "/app/configuracion/agenda",
    label: "Preferencias de agenda",
    icon: CalendarClock,
  },
  {
    href: "/app/configuracion/horarios",
    label: "Horarios habituales",
    icon: Clock3,
  },
] as const;

export function ConfigurationNavigation() {
  const pathname = usePathname();
  const currentItem =
    items.find(
      ({ href }) =>
        pathname === href ||
        (href !== "/app/configuracion" && pathname.startsWith(`${href}/`)),
    ) ?? items[0];
  const CurrentIcon = currentItem.icon;

  return (
    <nav
      aria-label="Secciones de configuración"
      className="xl:sticky xl:top-6 xl:self-start"
    >
      <details className="group xl:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[var(--color-foreground)] shadow-[var(--shadow-card)] [&::-webkit-details-marker]:hidden">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
            <CurrentIcon aria-hidden="true" size={18} strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-[0.1em] text-[var(--color-muted)] uppercase">
              Sección
            </span>
            <span className="block truncate text-sm font-semibold">
              {currentItem.label}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="shrink-0 text-[var(--color-muted)] transition-transform group-open:rotate-180"
            size={18}
          />
        </summary>
        <div className="mt-2 grid gap-1 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/app/configuracion" &&
                pathname.startsWith(`${href}/`));

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold no-underline transition-colors ${
                  isActive
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
                }`}
                href={href}
                key={href}
                onClick={(event) =>
                  event.currentTarget.closest("details")?.removeAttribute("open")
                }
              >
                <Icon aria-hidden="true" className="shrink-0" size={18} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </details>

      <div className="hidden gap-2 xl:flex xl:flex-col xl:rounded-[var(--radius-large)] xl:border xl:border-[var(--color-border)] xl:bg-[var(--color-surface)] xl:p-3 xl:shadow-[var(--shadow-card)]">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/app/configuracion" && pathname.startsWith(`${href}/`));

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold no-underline transition-colors ${
                isActive
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
              }`}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="shrink-0" size={18} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
