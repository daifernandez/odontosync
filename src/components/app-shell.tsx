"use client";

import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SmilePlus,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Inicio", icon: LayoutDashboard, active: true },
  { label: "Agenda", icon: CalendarDays },
  { label: "Pacientes", icon: UsersRound },
  { label: "Imprimibles", icon: FileText },
  { label: "Indicaciones", icon: ClipboardList },
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <button
        aria-label="Cerrar menú"
        className={`fixed inset-0 z-30 border-0 bg-[rgb(21_48_45/36%)] md:hidden ${
          isMobileOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsMobileOpen(false)}
        type="button"
      />

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(19rem,88vw)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[1rem_0_3rem_rgb(21_48_45/16%)] transition-[width,transform] duration-200 md:visible md:translate-x-0 md:shadow-none ${
          isMobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        } ${isCollapsed ? "md:w-22" : "md:w-70"}`}
      >
        <div
          className={`flex min-h-12 items-center gap-3 px-2 ${
            isCollapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <div
            className="grid size-11 shrink-0 place-items-center rounded-[0.9rem] bg-[var(--color-brand)] text-white"
            aria-hidden="true"
          >
            <SmilePlus size={24} strokeWidth={1.8} />
          </div>
          <div
            className={`flex min-w-0 flex-col whitespace-nowrap ${
              isCollapsed ? "md:hidden" : ""
            }`}
          >
            <strong className="text-base tracking-[-0.02em]">OdontoSync</strong>
            <span className="mt-0.5 text-[0.72rem] text-[var(--color-muted)]">
              Gestión odontológica
            </span>
          </div>
          <button
            aria-label="Cerrar menú"
            className="ml-auto grid size-10 place-items-center rounded-xl border-0 bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-brand-soft)] md:hidden"
            onClick={() => setIsMobileOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          <p
            className={`mb-2 px-3 text-[0.66rem] font-bold tracking-[0.12em] text-[var(--color-muted)] uppercase ${
              isCollapsed ? "md:hidden" : ""
            }`}
          >
            Consultorio
          </p>
          {navigation.map(({ label, icon: Icon, active }) => (
            <button
              aria-current={active ? "page" : undefined}
              className={`flex h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl border-0 px-3 text-left transition-colors ${
                active
                  ? "bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-dark)]"
                  : "bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
              } ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
              key={label}
              title={isCollapsed ? label : undefined}
              type="button"
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span
                className={`overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "md:hidden" : ""
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
          <button
            className={`flex h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl border-0 bg-transparent px-3 text-left text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] ${
              isCollapsed ? "md:justify-center md:px-0" : ""
            }`}
            title={isCollapsed ? "Configuración" : undefined}
            type="button"
          >
            <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
            <span
              className={`overflow-hidden whitespace-nowrap ${
                isCollapsed ? "md:hidden" : ""
              }`}
            >
              Configuración
            </span>
          </button>

          <div
            className={`mt-1 flex items-center gap-3 px-2.5 py-2.5 ${
              isCollapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <span
              className="grid size-9.5 shrink-0 place-items-center rounded-full bg-[var(--color-foreground)] text-[0.68rem] font-bold text-white"
              aria-hidden="true"
            >
              DD
            </span>
            <span
              className={`flex min-w-0 flex-col whitespace-nowrap ${
                isCollapsed ? "md:hidden" : ""
              }`}
            >
              <strong className="overflow-hidden text-[0.82rem] text-ellipsis">
                Dra. Demo
              </strong>
              <small className="mt-0.5 text-[0.72rem] text-[var(--color-muted)]">
                Cuenta individual
              </small>
            </span>
          </div>

          <button
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
            className={`mt-1 hidden h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl border border-[var(--color-border)] bg-transparent px-3 text-left text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] md:flex ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            onClick={() => setIsCollapsed((current) => !current)}
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
            type="button"
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" size={19} />
            ) : (
              <PanelLeftClose aria-hidden="true" size={19} />
            )}
            <span
              className={`overflow-hidden whitespace-nowrap ${
                isCollapsed ? "hidden" : ""
              }`}
            >
              Contraer menú
            </span>
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[margin] duration-200 ${
          isCollapsed ? "md:ml-22" : "md:ml-70"
        }`}
      >
        <header className="flex h-17 items-center justify-between border-b border-[var(--color-border)] bg-[rgb(255_255_255/92%)] px-4 md:hidden">
          <button
            aria-label="Abrir menú"
            className="grid size-10 place-items-center rounded-xl border-0 bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-brand-soft)]"
            onClick={() => setIsMobileOpen(true)}
            type="button"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2.5 text-sm">
            <span
              className="grid size-9 place-items-center rounded-xl bg-[var(--color-brand)] text-white"
              aria-hidden="true"
            >
              <SmilePlus size={19} strokeWidth={1.8} />
            </span>
            <strong>OdontoSync</strong>
          </div>
          <span
            className="grid size-8.5 place-items-center rounded-full bg-[var(--color-foreground)] text-[0.68rem] font-bold text-white"
            aria-label="Dra. Demo"
          >
            DD
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
