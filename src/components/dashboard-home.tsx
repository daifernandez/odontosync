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

import type { DashboardData } from "@/modules/dashboard/domain/dashboard";

const demoAppointments = [
  {
    id: "demo-09-00",
    date: "",
    dateLabel: "Hoy",
    time: "09:00",
    patient: "Paciente de ejemplo",
    specialty: "Odontología general",
    status: "Confirmado",
  },
  {
    id: "demo-10-30",
    date: "",
    dateLabel: "Hoy",
    time: "10:30",
    patient: "Paciente de muestra",
    specialty: "Ortodoncia",
    status: "Pendiente",
  },
  {
    id: "demo-12-00",
    date: "",
    dateLabel: "Hoy",
    time: "12:00",
    patient: "Horario disponible",
    specialty: "Sin asignar",
    status: "Libre",
  },
] as const;

const printables = [
  { name: "Plan de tratamiento", detail: "Hoja clínica y administrativa" },
  { name: "Odontograma", detail: "Adulto y odontopediátrico" },
  { name: "Indicaciones generales", detail: "Organizadas por especialidad" },
];

const statusStyles = {
  Confirmado: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  Pendiente:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]",
  Atendido: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  "No asistió": "bg-[var(--color-neutral-soft)] text-[var(--color-muted)]",
  Libre: "bg-[var(--color-neutral-soft)] text-[var(--color-muted)]",
};

const emptyDashboardData: DashboardData = {
  todayAppointments: 0,
  confirmedToday: 0,
  availableSlotsToday: 0,
  upcomingAppointments: [],
};

export function DashboardHome({
  demoMode = false,
  data = emptyDashboardData,
}: Readonly<{ demoMode?: boolean; data?: DashboardData }>) {
  const agendaHref = demoMode ? "/demo/agenda" : "/app/agenda";
  const newAppointmentHref = demoMode
    ? "/demo/agenda?nuevo=1#nuevo-turno"
    : "/app/agenda?nuevo=1#nuevo-turno";
  const displayedAppointments = demoMode
    ? demoAppointments
    : data.upcomingAppointments;
  const nextAppointment = displayedAppointments[0];
  const todayAppointments = demoMode ? 2 : data.todayAppointments;
  const confirmedToday = demoMode ? 1 : data.confirmedToday;
  const availableSlotsToday = demoMode ? 1 : data.availableSlotsToday;

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
        className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3"
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
        <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <Clock3 aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="m-0 mb-0.5 text-[0.72rem] text-[var(--color-muted)]">
              Próximo turno
            </p>
            <strong className="text-xl tracking-[-0.035em]">
              {nextAppointment?.time ?? "Sin turnos"}
            </strong>
          </div>
          <span className="self-end text-[0.7rem] whitespace-nowrap text-[var(--color-muted)]">
            {nextAppointment
              ? `${nextAppointment.dateLabel} · ${nextAppointment.specialty}`
              : "Agenda libre"}
          </span>
        </article>
        <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-neutral-soft)] text-[var(--color-muted)]">
            <UserRound aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="m-0 mb-0.5 text-[0.72rem] text-[var(--color-muted)]">
              Espacios libres
            </p>
            <strong className="text-2xl tracking-[-0.035em]">
              {availableSlotsToday}
            </strong>
          </div>
          <span className="self-end text-[0.7rem] whitespace-nowrap text-[var(--color-muted)]">
            Hoy
          </span>
        </article>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <section
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          aria-labelledby="agenda-title"
        >
          <div className="flex min-h-11 items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Agenda
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
              Ver agenda
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div className="mt-4 flex flex-col">
            {displayedAppointments.map((appointment) => {
              const appointmentHref = demoMode
                ? agendaHref
                : `${agendaHref}?vista=day&fecha=${appointment.date}&turno=${appointment.id}`;

              return (
                <article
                  className="grid min-h-17.5 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3.5 border-t border-[var(--color-border)] min-[421px]:grid-cols-[3.3rem_1px_minmax(0,1fr)_auto] md:grid-cols-[3.3rem_1px_minmax(0,1fr)_auto_auto]"
                  key={appointment.id}
                >
                  <time className="text-[0.82rem] font-bold">
                    {appointment.time}
                  </time>
                  <span
                    className="hidden h-8 w-px bg-[var(--color-border)] min-[421px]:block"
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <strong className="overflow-hidden text-[0.82rem] text-ellipsis whitespace-nowrap">
                      {appointment.patient}
                    </strong>
                    <span className="text-[0.7rem] text-[var(--color-muted)]">
                      {appointment.dateLabel} · {appointment.specialty}
                    </span>
                  </div>
                  <span
                    className={`hidden rounded-full px-2.5 py-1.5 text-[0.65rem] font-bold min-[421px]:inline md:inline ${statusStyles[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>
                  <Link
                    aria-label={`Ver turno de las ${appointment.time} en la agenda`}
                    className="hidden size-8 place-items-center rounded-full text-[var(--color-muted)] no-underline hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] md:grid"
                    href={appointmentHref}
                  >
                    <ChevronRight aria-hidden="true" size={18} />
                  </Link>
                </article>
              );
            })}
            {!demoMode && displayedAppointments.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center border-t border-[var(--color-border)] px-4 py-8 text-center">
                <strong className="text-sm">No hay próximos turnos</strong>
                <p className="mt-2 mb-4 max-w-sm text-[0.76rem] leading-5 text-[var(--color-muted)]">
                  La agenda no tiene turnos pendientes ni confirmados a partir de ahora.
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
            {printables.map((printable) => (
              <button
                aria-disabled="true"
                className="flex min-h-17.5 cursor-not-allowed items-center justify-between gap-4 border-0 border-t border-[var(--color-border)] bg-transparent p-0 text-left text-[var(--color-foreground)] opacity-60"
                disabled
                key={printable.name}
                title={`${printable.name}: próximamente`}
                type="button"
              >
                <span className="flex flex-col gap-1">
                  <strong className="text-[0.8rem]">{printable.name}</strong>
                  <small className="text-[0.67rem] leading-5 text-[var(--color-muted)]">
                    {printable.detail}
                  </small>
                </span>
                <span className="text-[0.58rem] font-bold tracking-[0.05em] text-[var(--color-muted)] uppercase">
                  Próximamente
                </span>
              </button>
            ))}
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
