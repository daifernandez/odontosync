import { Mail, Phone, Search, UserRoundPlus, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PatientForm } from "@/components/patient-form";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import { normalizePatientSearch } from "@/modules/patients/domain/patient";
import { listPatients } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Pacientes | OdontoSync",
  description: "Administrá fichas mínimas de pacientes ficticios.",
};

type PatientsPageProps = {
  searchParams: Promise<{
    buscar?: string | string[];
    creado?: string | string[];
  }>;
};

function readSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function PatientsPage({
  searchParams,
}: PatientsPageProps) {
  const params = await searchParams;
  const search = normalizePatientSearch(readSearchParam(params.buscar));
  const [configuration, patients] = await Promise.all([
    getInitialConfiguration(),
    listPatients(search),
  ]);

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  const patientWasCreated = readSearchParam(params.creado) === "1";

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
      <header>
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          Pacientes
        </p>
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
          Fichas administrativas
        </h1>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Creá y consultá la información mínima que después permitirá asociar
          pacientes con sus turnos.
        </p>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-[var(--color-warning-foreground)] md:items-center">
        <UsersRound
          aria-hidden="true"
          className="mt-1 shrink-0 md:mt-0"
          size={18}
        />
        <p className="m-0 text-[0.78rem] leading-6">
          Prototipo académico: ingresá únicamente pacientes ficticios. No
          cargues datos personales reales ni información clínica.
        </p>
      </aside>

      {patientWasCreated ? (
        <p
          className="mt-5 mb-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
          role="status"
        >
          El paciente ficticio se guardó correctamente.
        </p>
      ) : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section
          aria-labelledby="patient-list-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Directorio
              </p>
              <h2 className="m-0 text-xl" id="patient-list-title">
                Pacientes guardados
              </h2>
            </div>

            <form className="flex w-full max-w-md gap-2" method="get" role="search">
              <label className="sr-only" htmlFor="patient-search">
                Buscar por nombre o apellido
              </label>
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-muted)]"
                  size={17}
                />
                <input
                  className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pr-3 pl-10 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]"
                  defaultValue={search}
                  id="patient-search"
                  maxLength={80}
                  name="buscar"
                  placeholder="Nombre o apellido"
                  type="search"
                />
              </div>
              <button
                className="min-h-11 cursor-pointer rounded-xl border-0 bg-[var(--color-brand)] px-4 text-sm font-bold text-white hover:bg-[var(--color-brand-dark)]"
                type="submit"
              >
                Buscar
              </button>
            </form>
          </div>

          {patients.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
              <UsersRound
                aria-hidden="true"
                className="mx-auto text-[var(--color-brand)]"
                size={28}
              />
              <h3 className="mt-3 mb-0 text-base">
                {search ? "No encontramos coincidencias" : "Todavía no hay pacientes"}
              </h3>
              <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                {search
                  ? `No hay pacientes cuyo nombre o apellido coincida con “${search}”.`
                  : "Usá el formulario para crear la primera ficha ficticia."}
              </p>
              {search ? (
                <Link
                  className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                  href="/app/pacientes"
                >
                  Limpiar búsqueda
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {patients.map((patient) => (
                <article
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4"
                  key={patient.id}
                >
                  <h3 className="m-0 text-base">
                    {patient.lastName}, {patient.firstName}
                  </h3>
                  <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--color-muted)]">
                    <span className="flex items-center gap-2">
                      <Phone aria-hidden="true" size={14} />
                      {patient.phone ?? "Sin teléfono"}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <Mail aria-hidden="true" className="shrink-0" size={14} />
                      <span className="truncate">
                        {patient.email ?? "Sin correo electrónico"}
                      </span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="new-patient-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6"
        >
          <UserRoundPlus
            aria-hidden="true"
            className="text-[var(--color-brand)]"
            size={24}
          />
          <h2 className="mt-3 mb-0 text-xl" id="new-patient-title">
            Nuevo paciente ficticio
          </h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Nombre y apellido son obligatorios. Los datos de contacto son
            opcionales.
          </p>
          <PatientForm />
        </section>
      </div>
    </main>
  );
}
