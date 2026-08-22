"use client";

import { CalendarDays, CheckCircle2, Clock3, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useDemoState } from "@/components/demo-state";

const statusStyles = {
  Confirmado: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  Pendiente:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]",
};

export function DemoAgenda({
  initialOpen = false,
}: Readonly<{ initialOpen?: boolean }>) {
  const { addAppointment, appointments } = useDemoState();
  const [isFormOpen, setIsFormOpen] = useState(initialOpen);
  const [notice, setNotice] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const patient = String(formData.get("patient") ?? "").trim();
    const specialty = String(formData.get("specialty") ?? "").trim();
    const time = String(formData.get("time") ?? "").trim();

    if (!patient || !specialty || !time) {
      return;
    }

    addAppointment({ patient, specialty, time });
    setNotice(`Turno ficticio agregado para ${patient} a las ${time}.`);
    setIsFormOpen(false);
    form.reset();
  }

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Demo interactiva
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] font-bold tracking-[-0.045em]">
            Agenda
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-[0.95rem] text-[var(--color-muted)]">
            Probá cómo se organiza un día de atención sin guardar información.
          </p>
        </div>
        <button
          className="flex min-h-11.5 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-4 py-3 text-[0.86rem] font-bold text-white hover:bg-[var(--color-brand-dark)] md:w-auto"
          onClick={() => {
            setIsFormOpen(true);
            setNotice(undefined);
          }}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          Nuevo turno
        </button>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)]">
        <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <p className="m-0 text-[0.78rem] leading-6">
          <strong>Simulación sin persistencia.</strong> Los cambios se descartan
          al recargar o salir del demo. Usá solamente información ficticia.
        </p>
      </aside>

      {notice ? (
        <div
          className="mt-5 flex items-center gap-2 rounded-[var(--radius-medium)] border border-[var(--color-brand)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-brand-dark)]"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          {notice}
        </div>
      ) : null}

      {isFormOpen ? (
        <section
          className="mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
          id="nuevo-turno"
          aria-labelledby="new-demo-appointment-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Simulación
              </p>
              <h2
                className="m-0 text-lg font-semibold"
                id="new-demo-appointment-title"
              >
                Nuevo turno ficticio
              </h2>
            </div>
            <button
              aria-label="Cerrar nuevo turno ficticio"
              className="grid size-10 cursor-pointer place-items-center rounded-xl border-0 bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
              onClick={() => setIsFormOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <form
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Paciente ficticio
              <select
                className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal"
                defaultValue="Paciente de prueba"
                name="patient"
                required
              >
                <option>Paciente de prueba</option>
                <option>Paciente de ejemplo</option>
                <option>Paciente de muestra</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Especialidad
              <select
                className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal"
                defaultValue="Odontología general"
                name="specialty"
                required
              >
                <option>Odontología general</option>
                <option>Ortodoncia</option>
                <option>Endodoncia</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Hora
              <input
                className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal"
                defaultValue="13:30"
                name="time"
                required
                type="time"
              />
            </label>
            <div className="flex flex-col gap-3 md:col-span-3 md:flex-row md:justify-end">
              <button
                className="min-h-11.5 cursor-pointer rounded-xl border border-[var(--color-border)] bg-transparent px-4 font-semibold text-[var(--color-muted)]"
                onClick={() => setIsFormOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="min-h-11.5 cursor-pointer rounded-xl border-0 bg-[var(--color-brand)] px-4 font-semibold text-white hover:bg-[var(--color-brand-dark)]"
                type="submit"
              >
                Agregar a la demo
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section
        className="mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
        aria-labelledby="demo-day-title"
      >
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Día de ejemplo
            </p>
            <h2 className="m-0 text-lg font-semibold" id="demo-day-title">
              Lunes 24 de agosto
            </h2>
          </div>
          <span className="text-xs text-[var(--color-muted)]">
            Horario ficticio · 09:00 a 14:00
          </span>
        </div>

        <div className="flex flex-col">
          {appointments.map((appointment) => (
            <article
              className="grid min-h-20 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 border-b border-[var(--color-border)] last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
              key={appointment.id}
            >
              <time className="font-bold">{appointment.time}</time>
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {appointment.patient}
                </strong>
                <small className="text-[var(--color-muted)]">
                  {appointment.specialty}
                </small>
              </span>
              <span
                className={`col-start-2 w-fit rounded-full px-2.5 py-1.5 text-[0.68rem] font-bold sm:col-start-auto ${statusStyles[appointment.status]}`}
              >
                {appointment.status}
              </span>
            </article>
          ))}
          <article className="grid min-h-20 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
            <time className="font-bold">14:00</time>
            <span className="flex items-center gap-2 text-[var(--color-muted)]">
              <Clock3 aria-hidden="true" size={17} />
              Horario disponible
            </span>
            <span className="col-start-2 w-fit rounded-full bg-[var(--color-neutral-soft)] px-2.5 py-1.5 text-[0.68rem] font-bold text-[var(--color-muted)] sm:col-start-auto">
              Libre
            </span>
          </article>
        </div>
      </section>
    </main>
  );
}
