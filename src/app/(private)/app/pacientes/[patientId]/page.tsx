import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildAgendaPath } from "@/modules/agenda/domain/weekly-schedule";
import {
  formatArgentinaDateInput,
  getAppointmentSpecialtyLabel,
  type Appointment,
  type AppointmentStatus,
} from "@/modules/appointments/domain/appointment";
import { listPatientAppointments } from "@/modules/appointments/repository";
import { validatePatientId } from "@/modules/patients/domain/patient";
import { getPatient } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Ficha de paciente | OdontoSync",
  description: "Consultá los datos administrativos y turnos de un paciente.",
};

type PatientDetailPageProps = {
  params: Promise<{ patientId: string }>;
};

const appointmentDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const appointmentTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function getAppointmentStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "completed":
      return "Atendido";
    case "no_show":
      return "No asistió";
    case "cancelled":
      return "Cancelado";
    case "rescheduled":
      return "Reprogramado";
    default:
      return "Pendiente de confirmación";
  }
}

function getAppointmentStatusClassName(status: AppointmentStatus) {
  return status === "no_show"
    ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]"
    : status === "pending_confirmation" || status === "cancelled"
      ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]"
    : "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]";
}

function formatAppointmentDate(date: Date) {
  const formattedDate = appointmentDateFormatter.format(date);
  return `${formattedDate.charAt(0).toUpperCase()}${formattedDate.slice(1)}`;
}

function AppointmentList({
  appointments,
  emptyMessage,
  agendaLink = false,
}: Readonly<{
  agendaLink?: boolean;
  appointments: Appointment[];
  emptyMessage: string;
}>) {
  if (appointments.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-8 text-center">
        <CalendarDays
          aria-hidden="true"
          className="mx-auto text-[var(--color-brand)]"
          size={26}
        />
        <p className="mt-3 mb-0 text-sm font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {appointments.map((appointment) => {
        const startsAt = new Date(appointment.startsAt);
        const date = formatArgentinaDateInput(startsAt);

        return (
          <article
            className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between"
            key={appointment.id}
          >
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold">
                {formatAppointmentDate(startsAt)} ·{" "}
                {appointmentTimeFormatter.format(startsAt)}
              </p>
              <p className="mt-1 mb-0 text-xs leading-5 text-[var(--color-muted)]">
                {getAppointmentSpecialtyLabel(appointment.specialty)} ·{" "}
                {appointment.durationMinutes} min
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${getAppointmentStatusClassName(appointment.status)}`}
              >
                {getAppointmentStatusLabel(appointment.status)}
              </span>
            </div>
            {agendaLink ? (
              <Link
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                href={buildAgendaPath({
                  weekStartDate: date,
                  view: "day",
                  selectedDate: date,
                  params: { turno: appointment.id },
                })}
              >
                Ver en Agenda
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { patientId: patientIdValue } = await params;
  const patientId = validatePatientId(patientIdValue);

  if (!patientId) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    redirect("/ingresar");
  }

  const [patient, appointments] = await Promise.all([
    getPatient(patientId, userId),
    listPatientAppointments(patientId, userId),
  ]);

  if (!patient) {
    notFound();
  }

  const now = new Date().getTime();
  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        (appointment.status === "pending_confirmation" ||
          appointment.status === "confirmed") &&
        new Date(appointment.startsAt).getTime() >= now,
    )
    .toSorted(
      (first, second) =>
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime(),
    );
  const historicalAppointments = appointments.filter((appointment) =>
    ["completed", "no_show", "cancelled", "rescheduled"].includes(
      appointment.status,
    ),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 md:px-8 md:py-12">
      <Link
        className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:underline"
        href={
          patient.isActive
            ? "/app/pacientes"
            : "/app/pacientes?estado=inactivos"
        }
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Volver a pacientes {patient.isActive ? "activos" : "inactivos"}
      </Link>

      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Ficha administrativa
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
            {patient.lastName}, {patient.firstName}
          </h1>
          <span className="mt-3 inline-flex rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-bold text-[var(--color-brand-dark)]">
            Paciente {patient.isActive ? "activo" : "inactivo"}
          </span>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
          href={`/app/pacientes/${patient.id}/editar`}
        >
          <Pencil aria-hidden="true" size={16} />
          Editar ficha
        </Link>
      </header>

      <section
        aria-labelledby="patient-contact-title"
        className="mt-8 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <UserRound aria-hidden="true" size={20} />
          </span>
          <h2 className="m-0 text-xl" id="patient-contact-title">
            Datos de contacto
          </h2>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--color-brand-subtle)] p-4">
            <dt className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
              <Phone aria-hidden="true" size={15} />
              Teléfono
            </dt>
            <dd className="mt-2 ml-0 text-sm font-semibold">
              {patient.phone ?? "Sin teléfono"}
            </dd>
          </div>
          <div className="min-w-0 rounded-xl bg-[var(--color-brand-subtle)] p-4">
            <dt className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
              <Mail aria-hidden="true" size={15} />
              Correo electrónico
            </dt>
            <dd className="mt-2 ml-0 truncate text-sm font-semibold">
              {patient.email ?? "Sin correo electrónico"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="upcoming-appointments-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-xl" id="upcoming-appointments-title">
              Próximos turnos
            </h2>
            {patient.isActive ? (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-3 text-xs font-bold text-white no-underline hover:bg-[var(--color-brand-dark)]"
                href={`/app/agenda?nuevo=1&paciente=${patient.id}#nuevo-turno`}
              >
                <Plus aria-hidden="true" size={15} />
                Crear turno
              </Link>
            ) : null}
          </div>
          <AppointmentList
            agendaLink
            appointments={upcomingAppointments}
            emptyMessage="No hay próximos turnos"
          />
        </section>

        <section
          aria-labelledby="appointment-history-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
        >
          <h2 className="m-0 text-xl" id="appointment-history-title">
            Historial de turnos
          </h2>
          <AppointmentList
            appointments={historicalAppointments}
            emptyMessage="Este paciente todavía no tiene historial"
          />
        </section>
      </div>
    </main>
  );
}
