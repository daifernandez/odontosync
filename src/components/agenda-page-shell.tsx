import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { AgendaDisplayView } from "@/modules/agenda/domain/weekly-schedule";

export const agendaActionsClassName =
  "grid w-full grid-cols-2 gap-2 [&>a]:w-full [&>button]:w-full [&>:first-child]:col-span-2 sm:flex sm:w-auto sm:[&>a]:w-auto sm:[&>button]:w-auto sm:[&>:first-child]:col-span-1";

export function AgendaPageHeader({
  actions,
}: Readonly<{
  actions: ReactNode;
}>) {
  return (
    <header className="flex flex-col items-start gap-5 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
      <div>
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
          Agenda
        </h1>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Organizá tus turnos y horarios.
        </p>
      </div>
      <div className={agendaActionsClassName}>{actions}</div>
    </header>
  );
}

export function AgendaViewToolbar({
  currentHref,
  currentLabel = "Hoy",
  dayHref,
  monthHref,
  nextHref,
  nextLabel,
  previousHref,
  previousLabel,
  view,
  weekHref,
}: Readonly<{
  currentHref: string;
  currentLabel?: string;
  dayHref: string;
  monthHref: string;
  nextHref: string;
  nextLabel: string;
  previousHref: string;
  previousLabel: string;
  view: AgendaDisplayView;
  weekHref: string;
}>) {
  const viewLinkClassName = (candidate: AgendaDisplayView) =>
    `flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold no-underline sm:flex-none ${view === candidate ? "bg-white text-[var(--color-brand-dark)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-brand-dark)]"}`;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label="Cambiar vista de agenda"
        className="flex w-full rounded-xl bg-[var(--color-brand-subtle)] p-1 sm:w-auto"
      >
        <Link
          aria-current={view === "week" ? "page" : undefined}
          className={viewLinkClassName("week")}
          href={weekHref}
        >
          Semana
        </Link>
        <Link
          aria-current={view === "day" ? "page" : undefined}
          className={viewLinkClassName("day")}
          href={dayHref}
        >
          Día
        </Link>
        <Link
          aria-current={view === "month" ? "page" : undefined}
          className={viewLinkClassName("month")}
          href={monthHref}
        >
          Mes
        </Link>
      </nav>
      <nav
        aria-label={
          view === "day"
            ? "Navegar días"
            : view === "week"
              ? "Navegar semanas"
              : "Navegar meses"
        }
        className="flex justify-end gap-2"
      >
        <Link
          aria-label={previousLabel}
          className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href={previousHref}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </Link>
        <Link
          className="flex min-h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href={currentHref}
        >
          {currentLabel}
        </Link>
        <Link
          aria-label={nextLabel}
          className="grid size-11 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href={nextHref}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </Link>
      </nav>
    </div>
  );
}

export function AgendaPrototypeNotice() {
  return (
    <aside className="mt-4 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] sm:items-center">
      <CalendarClock
        aria-hidden="true"
        className="mt-1 shrink-0 sm:mt-0"
        size={18}
      />
      <p className="m-0 text-[0.78rem] leading-6">
        <strong>Prototipo académico.</strong> Asociá únicamente pacientes
        ficticios y no ingreses información clínica en la agenda.
      </p>
    </aside>
  );
}
