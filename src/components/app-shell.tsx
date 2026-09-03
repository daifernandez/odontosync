"use client";

import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/modules/auth/actions";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  demoHref?: string;
};

const navigation: NavigationItem[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/app", demoHref: "/demo" },
  {
    label: "Agenda",
    icon: CalendarDays,
    href: "/app/agenda",
    demoHref: "/demo/agenda",
  },
  {
    label: "Pacientes",
    icon: UsersRound,
    href: "/app/pacientes",
    demoHref: "/demo/pacientes",
  },
  {
    label: "Imprimibles",
    icon: FileText,
    href: "/app/imprimibles",
  },
  {
    label: "Indicaciones",
    icon: ClipboardList,
    href: "/app/indicaciones",
  },
];

function getInitials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function AppShell({
  children,
  mode = "authenticated",
  user,
}: Readonly<{
  children: ReactNode;
  mode?: "authenticated" | "demo";
  user: { fullName: string; email: string };
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const initials = getInitials(user.fullName);
  const isConfigurationActive = pathname.startsWith("/app/configuracion");
  const configurationClassName = `flex h-11.5 w-full items-center gap-3.5 rounded-xl border-0 px-3 text-left no-underline transition-colors ${
    mode === "demo"
      ? "cursor-not-allowed bg-transparent text-[var(--color-muted)] opacity-60"
      : isConfigurationActive
        ? "cursor-pointer bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-dark)]"
        : "cursor-pointer bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
  } ${isCollapsed ? "md:justify-center md:px-0" : ""}`;
  const configurationContent = (
    <>
      <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
      <span
        className={`overflow-hidden whitespace-nowrap ${
          isCollapsed ? "md:hidden" : ""
        }`}
      >
        Configuración
      </span>
      {mode === "demo" ? (
        <span
          className={`ml-auto text-[0.58rem] font-bold tracking-[0.05em] uppercase ${
            isCollapsed ? "md:hidden" : ""
          }`}
        >
          Próximamente
        </span>
      ) : null}
    </>
  );

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
          <BrandMark aria-hidden="true" className="size-11 shrink-0" />
          <div
            className={`flex min-w-0 flex-col whitespace-nowrap ${
              isCollapsed ? "md:hidden" : ""
            }`}
          >
            <strong className="text-base tracking-[-0.02em]">
              Odonto<span className="text-[var(--color-brand)]">Sync</span>
            </strong>
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
          {navigation.map(({ label, icon: Icon, href, demoHref }) => {
            const resolvedHref = mode === "demo" ? demoHref : href;
            const isActive = Boolean(
              resolvedHref &&
                (pathname === resolvedHref ||
                  (resolvedHref !== "/app" &&
                    resolvedHref !== "/demo" &&
                    pathname.startsWith(`${resolvedHref}/`))),
            );
            const className = `flex h-11.5 w-full items-center gap-3.5 rounded-xl border-0 px-3 text-left no-underline transition-colors ${
              !resolvedHref
                ? "cursor-not-allowed bg-transparent text-[var(--color-muted)] opacity-60"
                : isActive
                ? "bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-dark)]"
                : "cursor-pointer bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
            } ${isCollapsed ? "md:justify-center md:px-0" : ""}`;
            const content = (
              <>
                <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                <span
                  className={`overflow-hidden whitespace-nowrap ${
                    isCollapsed ? "md:hidden" : ""
                  }`}
                >
                  {label}
                </span>
                {!resolvedHref ? (
                  <span
                    className={`ml-auto text-[0.58rem] font-bold tracking-[0.05em] uppercase ${
                      isCollapsed ? "md:hidden" : ""
                    }`}
                  >
                    Próximamente
                  </span>
                ) : null}
              </>
            );

            return resolvedHref ? (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={className}
                href={resolvedHref}
                key={label}
                title={isCollapsed ? label : undefined}
              >
                {content}
              </Link>
            ) : (
              <button
                aria-disabled="true"
                className={className}
                disabled
                key={label}
                title={`${label}: próximamente`}
                type="button"
              >
                {content}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
          <div
            className={`flex items-center gap-3 px-2.5 py-2.5 ${
              isCollapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <span
              className="grid size-9.5 shrink-0 place-items-center rounded-full bg-[var(--color-foreground)] text-[0.68rem] font-bold text-white"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span
              className={`flex min-w-0 flex-col whitespace-nowrap ${
                isCollapsed ? "md:hidden" : ""
              }`}
            >
              <strong className="overflow-hidden text-[0.82rem] text-ellipsis">
                {user.fullName}
              </strong>
              <small className="mt-0.5 text-[0.72rem] text-[var(--color-muted)]">
                {user.email}
              </small>
            </span>
          </div>

          {mode === "demo" ? (
            <button
              aria-disabled="true"
              className={configurationClassName}
              disabled
              title="Configuración: próximamente"
              type="button"
            >
              {configurationContent}
            </button>
          ) : (
            <Link
              aria-current={isConfigurationActive ? "page" : undefined}
              className={configurationClassName}
              href="/app/configuracion"
              title={isCollapsed ? "Configuración" : undefined}
            >
              {configurationContent}
            </Link>
          )}

          {mode === "demo" ? (
            <Link
              className={`flex h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 text-left text-[var(--color-muted)] no-underline transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] ${
                isCollapsed ? "md:justify-center md:px-0" : ""
              }`}
              href="/"
              title={isCollapsed ? "Salir del demo" : undefined}
            >
              <LogOut aria-hidden="true" size={19} strokeWidth={1.8} />
              <span
                className={`overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "md:hidden" : ""
                }`}
              >
                Salir del demo
              </span>
            </Link>
          ) : (
            <form action={logoutAction}>
              <button
                className={`flex h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl border-0 bg-transparent px-3 text-left text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] ${
                  isCollapsed ? "md:justify-center md:px-0" : ""
                }`}
                title={isCollapsed ? "Cerrar sesión" : undefined}
                type="submit"
              >
                <LogOut aria-hidden="true" size={19} strokeWidth={1.8} />
                <span
                  className={`overflow-hidden whitespace-nowrap ${
                    isCollapsed ? "md:hidden" : ""
                  }`}
                >
                  Cerrar sesión
                </span>
              </button>
            </form>
          )}

          <div className="mt-2 hidden border-t border-[var(--color-border)] pt-3 md:block">
            <button
              aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
              className={`flex h-11.5 w-full cursor-pointer items-center gap-3.5 rounded-xl border border-[var(--color-border)] bg-transparent px-3 text-left text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)] ${
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
            <BrandMark aria-hidden="true" className="size-9" />
            <strong>
              Odonto<span className="text-[var(--color-brand)]">Sync</span>
            </strong>
          </div>
          <span
            className="grid size-8.5 place-items-center rounded-full bg-[var(--color-foreground)] text-[0.68rem] font-bold text-white"
            aria-label={user.fullName}
          >
            {initials}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
