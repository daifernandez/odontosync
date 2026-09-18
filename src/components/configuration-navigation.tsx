"use client";

import {
  CalendarClock,
  Clock3,
  FileText,
  LayoutGrid,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/app/configuracion",
    tabLabel: "Resumen",
    icon: LayoutGrid,
  },
  {
    href: "/app/configuracion/perfil",
    tabLabel: "Perfil",
    icon: UserRound,
  },
  {
    href: "/app/configuracion/documentos",
    tabLabel: "Consultorio",
    icon: FileText,
  },
  {
    href: "/app/configuracion/agenda",
    tabLabel: "Agenda",
    icon: CalendarClock,
  },
  {
    href: "/app/configuracion/horarios",
    tabLabel: "Horarios",
    icon: Clock3,
  },
] as const;

export function ConfigurationNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de configuración" className="min-w-0">
      <div className="grid grid-cols-5 gap-0 border-b border-[var(--color-border)] pb-2 sm:flex sm:items-end sm:gap-1 sm:pb-0">
        {items.map(({ href, tabLabel, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/app/configuracion" && pathname.startsWith(`${href}/`));

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={tabLabel}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border-b-2 border-transparent px-0 font-semibold whitespace-nowrap no-underline transition-colors sm:-mb-px sm:min-h-12 sm:flex-row sm:gap-2 sm:rounded-none sm:px-3 ${
                isActive
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] sm:border-[var(--color-brand)] sm:bg-transparent"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] sm:hover:border-[var(--color-brand-soft)] sm:hover:bg-transparent"
              }`}
              href={href}
              key={href}
              title={tabLabel}
            >
              <Icon aria-hidden="true" className="shrink-0" size={18} strokeWidth={1.8} />
              <span className="text-[0.625rem] leading-none sm:text-sm sm:leading-normal">
                {tabLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
