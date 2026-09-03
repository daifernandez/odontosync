import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Printer,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { buildAgendaPath } from "@/modules/agenda/domain/weekly-schedule";
import type { DashboardData } from "@/modules/dashboard/domain/dashboard";

const demoAppointments = [
  {
    id: "demo-09-00",
    date: "",
    dateLabel: "Hoy",
    durationMinutes: 30,
    time: "09:00",
    patient: "Paciente de ejemplo",
    specialty: "Odontología general",
    status: "Confirmado" as const,
  },
  {
    id: "demo-10-30",
    date: "",
    dateLabel: "Hoy",
    durationMinutes: 45,
    time: "10:30",
    patient: "Paciente de muestra",
    specialty: "Ortodoncia",
    status: "Pendiente de confirmación" as const,
  },
  {
    id: "demo-12-00",
    date: "",
    dateLabel: "Hoy",
    durationMinutes: 30,
    time: "12:00",
    patient: "Paciente ficticio",
    specialty: "Odontología general",
    status: "Confirmado" as const,
  },
] as const;

const printables = [
  {
    name: "Historia clínica odontológica",
    detail: "Cuatro páginas para completar a mano",
    href: "/app/imprimibles",
  },
  { name: "Odontograma", detail: "Adulto y odontopediátrico" },
  { name: "Indicaciones generales", detail: "Organizadas por especialidad" },
];

const statusStyles: Record<
  DashboardData["upcomingAppointments"][number]["status"],
  { badge: string; dot: string }
> = {
  Confirmado: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
  },
  "Pendiente de confirmación": {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
  },
};

const emptyDashboardData: DashboardData = {
  date: "",
  todayAppointments: 0,
  confirmedToday: 0,
  pendingConfirmationsToday: 0,
  upcomingAppointments: [],
};

export function DashboardHome({
  demoMode = false,
  data = emptyDashboardData,
}: Readonly<{ demoMode?: boolean; data?: DashboardData }>) {
  const agendaHref = demoMode
    ? "/demo/agenda"
    : data.date
      ? buildAgendaPath({
          weekStartDate: data.date,
          view: "day",
          selectedDate: data.date,
        })
      : "/app/agenda";
  const newAppointmentHref = demoMode
    ? "/demo/agenda?nuevo=1#nuevo-turno"
    : "/app/agenda?nuevo=1#nuevo-turno";
  const displayedAppointments = demoMode
    ? demoAppointments
    : data.upcomingAppointments;
  const nextAppointment = displayedAppointments[0];
  const todayAppointments = demoMode
    ? demoAppointments.length
    : data.todayAppointments;
  const confirmedToday = demoMode
    ? demoAppointments.filter(({ status }) => status === "Confirmado").length
    : data.confirmedToday;
  const pendingConfirmationsToday = demoMode
    ? demoAppointments.filter(
        ({ status }) => status === "Pendiente de confirmación",
      ).length
    : data.pendingConfirmationsToday;
  const nextAppointmentHref = nextAppointment
    ? demoMode
      ? agendaHref
      : buildAgendaPath({
          weekStartDate: nextAppointment.date,
          view: "day",
          selectedDate: nextAppointment.date,
          params: { turno: nextAppointment.id },
        })
    : null;
  const nextAppointmentCardClassName =
    "grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-3.5 gap-y-0.5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]";
  const nextAppointmentSummary = (
    <>
      <span className="row-span-2 grid size-11 self-center place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
        <Clock3 aria-hidden="true" size={21} />
      </span>
      <p className="col-start-2 row-start-1 m-0 text-[0.72rem] whitespace-nowrap text-[var(--color-muted)]">
        Próximo turno
      </p>
      <strong className="col-start-2 row-start-2 text-xl tracking-[-0.035em]">
        {nextAppointment?.time ?? "Sin turnos hoy"}
      </strong>
      {nextAppointment ? (
        <div className="col-start-3 row-start-2 flex min-w-0 flex-col items-start gap-0.5 text-left">
          <strong className="min-w-0 max-w-full text-[0.82rem] leading-4 tracking-[-0.02em] break-words min-[520px]:text-[0.9rem] min-[520px]:leading-5">
            {nextAppointment.patient}
          </strong>
          <span className="min-w-0 max-w-full text-[0.62rem] leading-4 break-words text-[var(--color-muted)] min-[520px]:text-[0.7rem] min-[520px]:leading-5">
            {nextAppointment.dateLabel} · {nextAppointment.specialty}
          </span>
        </div>
      ) : null}
    </>
  );

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Resumen de hoy
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] font-bold tracking-[-0.045em]">
            Buen día
          </h1>
          <p className="mt-3 mb-0 text-[0.95rem] text-[var(--color-muted)]">
            Organizá tu jornada y accedé rápido a tus herramientas.
          </p>
        </div>
        <Link
          className="flex min-h-11.5 w-full items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-4 py-3 text-[0.86rem] font-bold text-white no-underline shadow-[0_0.45rem_1.2rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)] md:w-auto"
          href={newAppointmentHref}
        >
          <Plus aria-hidden="true" size={18} />
          Nuevo turno
        </Link>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <span className="grid shrink-0 place-items-center" aria-hidden="true">
          <FileText size={18} />
        </span>
        <p className="m-0 text-[0.78rem] leading-6">
          <strong>{demoMode ? "Modo demostración." : "Prototipo académico."}</strong>{" "}
          {demoMode
            ? "Todos los datos son ficticios y los cambios no se guardan."
            : "Usá únicamente información ficticia; no ingreses datos de pacientes reales."}
        </p>
      </aside>

      <section
        className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)]"
        aria-label="Resumen de la agenda"
      >
        <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-brand)] text-white">
            <CalendarDays aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="m-0 mb-0.5 text-[0.72rem] text-[var(--color-muted)]">
              Turnos de hoy
            </p>
            <strong className="text-2xl tracking-[-0.035em]">
              {todayAppointments}
            </strong>
          </div>
          <span className="self-end text-[0.7rem] whitespace-nowrap text-[var(--color-muted)]">
            {confirmedToday}{" "}
            {confirmedToday === 1 ? "confirmado" : "confirmados"}
          </span>
        </article>
        {nextAppointmentHref ? (
          <Link
            aria-label={`Abrir próximo turno: ${nextAppointment.time}, ${nextAppointment.patient}`}
            className={`${nextAppointmentCardClassName} relative pr-8 text-[var(--color-foreground)] no-underline transition-colors hover:bg-[var(--color-brand-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] active:bg-[var(--color-brand-soft)]`}
            href={nextAppointmentHref}
          >
            {nextAppointmentSummary}
            <span
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            >
              <ChevronRight size={18} />
            </span>
          </Link>
        ) : (
          <article className={nextAppointmentCardClassName}>
            {nextAppointmentSummary}
          </article>
        )}
        <article className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-neutral-soft)] text-[var(--color-muted)]">
            <UserRound aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="m-0 mb-0.5 text-[0.72rem] whitespace-nowrap text-[var(--color-muted)]">
              Confirmaciones pendientes
            </p>
            <strong className="text-2xl tracking-[-0.035em]">
              {pendingConfirmationsToday}
            </strong>
          </div>
        </article>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <section
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          aria-labelledby="agenda-title"
        >
          <div className="flex min-h-11 flex-col items-start gap-3 min-[421px]:flex-row min-[421px]:items-center min-[421px]:justify-between min-[421px]:gap-4">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Agenda de hoy
              </p>
              <h2
                className="m-0 text-lg font-semibold tracking-[-0.025em]"
                id="agenda-title"
              >
                Próximos turnos
              </h2>
            </div>
            <Link
              className="flex items-center gap-1.5 text-[0.76rem] font-bold text-[var(--color-brand)] no-underline"
              href={agendaHref}
            >
              Ver agenda de hoy
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div className="mt-4 flex flex-col">
            {displayedAppointments.map((appointment) => {
              const styles = statusStyles[appointment.status];
              const appointmentHref = demoMode
                ? agendaHref
                : buildAgendaPath({
                    weekStartDate: appointment.date,
                    view: "day",
                    selectedDate: appointment.date,
                    params: { turno: appointment.id },
                  });

              return (
                <Link
                  aria-label={`${appointment.time}, ${appointment.patient}, ${appointment.status}. Abrir turno en la agenda`}
                  className="grid min-h-20 grid-cols-[3rem_0.625rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-t border-[var(--color-border)] py-3 text-[var(--color-foreground)] no-underline hover:bg-[var(--color-brand-subtle)] md:grid-cols-[3.3rem_0.625rem_minmax(0,1fr)_auto_auto] md:gap-x-3.5"
                  href={appointmentHref}
                  key={appointment.id}
                >
                  <time className="self-start pt-0.5 text-[0.82rem] font-bold md:self-center md:pt-0">
                    {appointment.time}
                  </time>
                  <span
                    className={`size-2.5 rounded-full ${styles.dot}`}
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <strong className="overflow-hidden text-[0.82rem] text-ellipsis whitespace-nowrap">
                      {appointment.patient}
                    </strong>
                    <span className="text-[0.7rem] text-[var(--color-muted)]">
                      {appointment.specialty} · {appointment.durationMinutes} min
                    </span>
                  </div>
                  <span
                    className={`col-start-3 justify-self-start rounded-full border px-2.5 py-1.5 text-[0.65rem] font-bold md:col-start-auto ${styles.badge}`}
                  >
                    {appointment.status}
                  </span>
                  <span className="hidden text-[var(--color-muted)] md:block">
                    <ChevronRight aria-hidden="true" size={18} />
                  </span>
                </Link>
              );
            })}
            {!demoMode && displayedAppointments.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center border-t border-[var(--color-border)] px-4 py-8 text-center">
                <strong className="text-sm">No quedan turnos para hoy</strong>
                <p className="mt-2 mb-4 max-w-sm text-[0.76rem] leading-5 text-[var(--color-muted)]">
                  No hay turnos pendientes ni confirmados a partir de ahora.
                </p>
                <Link
                  className="text-[0.76rem] font-bold text-[var(--color-brand)] no-underline"
                  href={newAppointmentHref}
                >
                  Crear turno
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        <section
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          aria-labelledby="printables-title"
        >
          <div className="flex min-h-11 items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Accesos rápidos
              </p>
              <h2
                className="m-0 text-lg font-semibold tracking-[-0.025em]"
                id="printables-title"
              >
                Imprimibles
              </h2>
            </div>
            <span
              className="grid size-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
              aria-hidden="true"
            >
              <Printer size={20} />
            </span>
          </div>

          <div className="mt-4 flex flex-col">
            {printables.map((printable) => {
              const href = demoMode ? undefined : printable.href;
              const content = (
                <>
                  <span className="flex flex-col gap-1">
                    <strong className="text-[0.8rem]">{printable.name}</strong>
                    <small className="text-[0.67rem] leading-5 text-[var(--color-muted)]">
                      {printable.detail}
                    </small>
                  </span>
                  <span className="text-[0.58rem] font-bold tracking-[0.05em] text-[var(--color-muted)] uppercase">
                    {href ? "Abrir" : "Próximamente"}
                  </span>
                </>
              );

              return href ? (
                <Link
                  className="flex min-h-17.5 items-center justify-between gap-4 border-t border-[var(--color-border)] text-left text-[var(--color-foreground)] no-underline hover:bg-[var(--color-brand-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
                  href={href}
                  key={printable.name}
                >
                  {content}
                </Link>
              ) : (
                <button
                  aria-disabled="true"
                  className="flex min-h-17.5 cursor-not-allowed items-center justify-between gap-4 border-0 border-t border-[var(--color-border)] bg-transparent p-0 text-left text-[var(--color-foreground)] opacity-60"
                  disabled
                  key={printable.name}
                  title={`${printable.name}: próximamente`}
                  type="button"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {demoMode ? (
        <footer className="mt-4 text-left text-[0.67rem] text-[var(--color-muted)] md:text-right">
          Los nombres, horarios y cantidades mostrados son datos de demostración.
        </footer>
      ) : null}
    </main>
  );
}
