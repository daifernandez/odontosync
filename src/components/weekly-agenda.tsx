import {
  CalendarClock,
  CalendarPlus,
  Clock3,
  Settings2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { AppointmentForm } from "@/components/appointment-form";
import { buildWeeklySchedule } from "@/modules/agenda/domain/weekly-schedule";
import {
  getAppointmentSpecialtyLabel,
  type Appointment,
} from "@/modules/appointments/domain/appointment";
import type { InitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import type { Patient } from "@/modules/patients/domain/patient";

type AppointmentPatientOption = Pick<
  Patient,
  "id" | "firstName" | "lastName"
>;

const summaryCardClassName =
  "rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]";

export function WeeklyAgenda({
  appointments,
  configuration,
  created,
  patients,
}: Readonly<{
  appointments: Appointment[];
  configuration: InitialConfiguration;
  created: boolean;
  patients: AppointmentPatientOption[];
}>) {
  const schedule = buildWeeklySchedule(configuration.availability);
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Agenda
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
            Semana habitual
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Consultá los bloques de atención que configuraste para cada día.
          </p>
        </div>
        <Link
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-subtle)]"
          href="/app/configuracion#agenda"
        >
          <Settings2 aria-hidden="true" size={17} />
          Ajustar horarios
        </Link>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <CalendarClock aria-hidden="true" className="mt-1 shrink-0 md:mt-0" size={18} />
        <p className="m-0 text-[0.78rem] leading-6">
          Prototipo académico: asociá únicamente pacientes ficticios y no
          ingreses información clínica en la agenda.
        </p>
      </aside>

      <section
        aria-label="Preferencias de la agenda"
        className="mt-5 grid gap-4 sm:grid-cols-3"
      >
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Intervalo de grilla
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.gridIntervalMinutes} min
          </strong>
        </article>
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Duración habitual
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.defaultAppointmentDurationMinutes} min
          </strong>
        </article>
        <article className={summaryCardClassName}>
          <p className="m-0 text-xs font-semibold text-[var(--color-muted)]">
            Acondicionamiento
          </p>
          <strong className="mt-2 block text-xl">
            {configuration.defaultCleanupMinutes} min
          </strong>
        </article>
      </section>

      <section
        aria-labelledby="weekly-availability-title"
        className="mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
      >
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Disponibilidad
          </p>
          <h2 className="m-0 text-xl" id="weekly-availability-title">
            Horarios por día
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {schedule.map((day) => (
            <article
              className="min-h-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-3.5"
              key={day.dayOfWeek}
            >
              <h3 className="m-0 text-sm font-bold">{day.label}</h3>

              {day.blocks.length === 0 ? (
                <p className="mt-5 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                  Sin atención
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {day.blocks.map((block) => (
                    <div
                      className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5"
                      key={`${block.startTime}-${block.endTime}`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-dark)]">
                        <Clock3 aria-hidden="true" size={14} />
                        <time dateTime={block.startTime}>{block.startTime}</time>
                        <span aria-hidden="true">–</span>
                        <time dateTime={block.endTime}>{block.endTime}</time>
                      </span>
                      <span className="mt-1 block text-[0.68rem] text-[var(--color-muted)]">
                        Disponible
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section
          aria-labelledby="upcoming-appointments-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
        >
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Próximos turnos
          </p>
          <h2 className="m-0 text-xl" id="upcoming-appointments-title">
            Pendientes de confirmación
          </h2>

          {appointments.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
              <CalendarClock
                aria-hidden="true"
                className="mx-auto text-[var(--color-brand)]"
                size={28}
              />
              <h3 className="mt-3 mb-0 text-base">
                Todavía no hay próximos turnos
              </h3>
              <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                Los turnos nuevos aparecerán aquí hasta que se habilite su
                gestión de estados.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {appointments.map((appointment) => (
                <article
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4"
                  key={appointment.id}
                >
                  <p className="m-0 text-xs font-bold text-[var(--color-brand-dark)]">
                    {dateFormatter.format(new Date(appointment.startsAt))}
                  </p>
                  <h3 className="mt-2 mb-0 text-base">
                    {appointment.patientLastName},{" "}
                    {appointment.patientFirstName}
                  </h3>
                  <p className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                    {getAppointmentSpecialtyLabel(appointment.specialty)} ·{" "}
                    {appointment.durationMinutes} min +{" "}
                    {appointment.cleanupMinutes} min de acondicionamiento
                  </p>
                  <span className="mt-3 inline-flex rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[var(--color-brand-dark)]">
                    Pendiente de confirmación
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="new-appointment-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
        >
          <CalendarPlus
            aria-hidden="true"
            className="text-[var(--color-brand)]"
            size={24}
          />
          <h2 className="mt-3 mb-0 text-xl" id="new-appointment-title">
            Nuevo turno
          </h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Se guardará como pendiente y respetará el tiempo de
            acondicionamiento.
          </p>

          {patients.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-5 text-center">
              <UsersRound
                aria-hidden="true"
                className="mx-auto text-[var(--color-brand)]"
                size={26}
              />
              <p className="mt-3 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                Primero necesitás un paciente ficticio activo.
              </p>
              <Link
                className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                href="/app/pacientes"
              >
                Ir a pacientes
              </Link>
            </div>
          ) : (
            <AppointmentForm
              created={created}
              defaultCleanupMinutes={configuration.defaultCleanupMinutes}
              defaultDurationMinutes={
                configuration.defaultAppointmentDurationMinutes
              }
              patients={patients}
            />
          )}
        </section>
      </div>
    </main>
  );
}
