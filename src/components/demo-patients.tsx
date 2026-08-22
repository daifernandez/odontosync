"use client";

import { CheckCircle2, Plus, Search, UserRound, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useDemoState, type DemoPatient } from "@/components/demo-state";

export function DemoPatients() {
  const { addPatient, patients } = useDemoState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DemoPatient["status"]>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState<string>();
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visiblePatients = patients.filter(
    (patient) =>
      patient.status === status &&
      patient.name.toLocaleLowerCase("es").includes(normalizedQuery),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!name) {
      return;
    }

    addPatient({ name, phone: phone || "Sin teléfono" });
    setStatus("active");
    setQuery("");
    setNotice(`Paciente ficticio ${name} agregado a la demo.`);
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
            Pacientes
          </h1>
          <p className="mt-3 mb-0 max-w-2xl text-[0.95rem] text-[var(--color-muted)]">
            Explorá un listado ficticio y probá búsquedas sin guardar datos.
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
          Nuevo paciente
        </button>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)]">
        <UserRound aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <p className="m-0 text-[0.78rem] leading-6">
          <strong>Datos exclusivamente ficticios.</strong> Nada de lo que
          agregues se envía ni se guarda; se descarta al recargar la página.
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
          aria-labelledby="new-demo-patient-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Simulación
              </p>
              <h2
                className="m-0 text-lg font-semibold"
                id="new-demo-patient-title"
              >
                Nuevo paciente ficticio
              </h2>
            </div>
            <button
              aria-label="Cerrar nuevo paciente ficticio"
              className="grid size-10 cursor-pointer place-items-center rounded-xl border-0 bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
              onClick={() => setIsFormOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <form
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Nombre ficticio
              <input
                autoComplete="off"
                className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal"
                name="name"
                placeholder="Ej.: Paciente de prueba"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Teléfono ficticio <span className="font-normal">(opcional)</span>
              <input
                autoComplete="off"
                className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal"
                inputMode="tel"
                name="phone"
                placeholder="11 0000 0000"
              />
            </label>
            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
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
        aria-labelledby="demo-patients-title"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Listado
            </p>
            <h2 className="m-0 text-lg font-semibold" id="demo-patients-title">
              Pacientes ficticios
            </h2>
          </div>
          <label className="relative flex w-full max-w-md flex-col gap-2 text-sm font-semibold">
            Buscar paciente ficticio
            <Search
              aria-hidden="true"
              className="absolute bottom-3.5 left-3 text-[var(--color-muted)]"
              size={17}
            />
            <input
              className="min-h-11.5 rounded-xl border border-[var(--color-border)] bg-white pr-3 pl-10 font-normal"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div
          className="mt-4 flex gap-2"
          aria-label="Estado de pacientes ficticios"
          role="group"
        >
          <button
            aria-pressed={status === "active"}
            className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold ${
              status === "active"
                ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)]"
            }`}
            onClick={() => setStatus("active")}
            type="button"
          >
            Activos
          </button>
          <button
            aria-pressed={status === "inactive"}
            className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold ${
              status === "inactive"
                ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)]"
            }`}
            onClick={() => setStatus("inactive")}
            type="button"
          >
            Inactivos
          </button>
        </div>

        {visiblePatients.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {visiblePatients.map((patient) => (
              <article
                className="flex min-w-0 items-center gap-4 rounded-[var(--radius-medium)] border border-[var(--color-border)] p-4"
                key={patient.id}
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] font-bold text-[var(--color-brand-dark)]"
                >
                  {patient.name
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {patient.name}
                  </strong>
                  <small className="text-[var(--color-muted)]">
                    {patient.phone} · Última visita: {patient.lastVisit}
                  </small>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[var(--radius-medium)] bg-[var(--color-neutral-soft)] p-6 text-center">
            <h3 className="m-0 text-base">No hay coincidencias</h3>
            <p className="mt-2 mb-0 text-sm text-[var(--color-muted)]">
              Probá otra búsqueda o cambiá el estado seleccionado.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
