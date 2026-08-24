import {
  ChevronRight,
  Mail,
  Phone,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PatientDirectorySearch } from "@/components/patient-directory-search";
import { PatientForm } from "@/components/patient-form";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import {
  buildPatientDirectoryPath,
  normalizePatientSearch,
  normalizePatientStatus,
} from "@/modules/patients/domain/patient";
import { listPatients } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Pacientes | OdontoSync",
  description: "Administrá fichas mínimas de pacientes ficticios.",
};

type PatientsPageProps = {
  searchParams: Promise<{
    buscar?: string | string[];
    creado?: string | string[];
    actualizado?: string | string[];
    desactivado?: string | string[];
    estado?: string | string[];
    reactivado?: string | string[];
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
  const status = normalizePatientStatus(readSearchParam(params.estado));
  const [configuration, patients] = await Promise.all([
    getInitialConfiguration(),
    listPatients(search, status),
  ]);

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  const feedback =
    readSearchParam(params.creado) === "1"
      ? "El paciente ficticio se guardó correctamente."
      : readSearchParam(params.actualizado) === "1"
        ? "Los datos del paciente se actualizaron correctamente."
        : readSearchParam(params.desactivado) === "1"
          ? "El paciente quedó inactivo y sus datos se conservaron."
          : readSearchParam(params.reactivado) === "1"
            ? "El paciente volvió a estar activo."
            : null;

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

      {feedback ? (
        <p
          className="mt-5 mb-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)]"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section
          aria-labelledby="patient-list-title"
          className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Directorio
              </p>
              <h2 className="m-0 text-xl" id="patient-list-title">
                Pacientes {status === "active" ? "activos" : "inactivos"}
              </h2>
            </div>

            <PatientDirectorySearch
              initialSearch={search}
              key={`${status}-${search}`}
              status={status}
            />
          </div>

          <nav aria-label="Estado de pacientes" className="mt-5 flex gap-2">
            <Link
              aria-current={status === "active" ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-bold no-underline ${
                status === "active"
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
              }`}
              href={buildPatientDirectoryPath({
                search,
                status: "active",
              })}
            >
              Activos
            </Link>
            <Link
              aria-current={status === "inactive" ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-bold no-underline ${
                status === "inactive"
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
              }`}
              href={buildPatientDirectoryPath({
                search,
                status: "inactive",
              })}
            >
              Inactivos
            </Link>
          </nav>

          {patients.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
              <UsersRound
                aria-hidden="true"
                className="mx-auto text-[var(--color-brand)]"
                size={28}
              />
              <h3 className="mt-3 mb-0 text-base">
                {search
                  ? "No encontramos coincidencias"
                  : status === "active"
                    ? "Todavía no hay pacientes activos"
                    : "No hay pacientes inactivos"}
              </h3>
              <p className="mx-auto mt-2 mb-0 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                {search
                  ? `No hay pacientes cuyo nombre o apellido coincida con “${search}”.`
                  : status === "active"
                    ? "Usá el formulario para crear la primera ficha ficticia."
                    : "Los pacientes que desactives aparecerán en esta sección."}
              </p>
              {search ? (
                <Link
                  className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                  href={
                    status === "inactive"
                      ? "/app/pacientes?estado=inactivos"
                      : "/app/pacientes"
                  }
                >
                  Limpiar búsqueda
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-5">
              <ul
                aria-label={`Lista de pacientes ${status === "active" ? "activos" : "inactivos"}`}
                className="m-0 list-none divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] p-0"
              >
                {patients.map((patient) => (
                  <li key={patient.id}>
                    <article className="grid min-w-0 gap-4 px-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-4">
                      <div className="min-w-0">
                        <h3 className="m-0 text-sm font-semibold">
                          {patient.lastName}, {patient.firstName}
                        </h3>
                        <div className="mt-2 flex min-w-0 flex-col gap-2 text-xs text-[var(--color-muted)] lg:flex-row lg:flex-wrap lg:gap-x-5">
                          <span className="flex min-w-0 items-center gap-2">
                            <Phone
                              aria-hidden="true"
                              className="shrink-0"
                              size={14}
                            />
                            <span className="sr-only">Teléfono: </span>
                            <span className="truncate">
                              {patient.phone ?? "Sin teléfono"}
                            </span>
                          </span>
                          <span className="flex min-w-0 items-center gap-2">
                            <Mail
                              aria-hidden="true"
                              className="shrink-0"
                              size={14}
                            />
                            <span className="sr-only">Correo electrónico: </span>
                            <span className="truncate">
                              {patient.email ?? "Sin correo electrónico"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Link
                        className="inline-flex min-h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                        href={`/app/pacientes/${patient.id}`}
                      >
                        Ver ficha
                        <ChevronRight aria-hidden="true" size={14} />
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
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
