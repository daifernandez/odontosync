import { ArrowLeft, UserRoundCog } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PatientForm,
  PatientStatusForm,
} from "@/components/patient-form";
import { validatePatientId } from "@/modules/patients/domain/patient";
import { getPatient } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Editar paciente | OdontoSync",
  description: "Actualizá una ficha administrativa de paciente ficticio.",
};

type EditPatientPageProps = {
  params: Promise<{ patientId: string }>;
};

export default async function EditPatientPage({
  params,
}: EditPatientPageProps) {
  const { patientId: patientIdValue } = await params;
  const patientId = validatePatientId(patientIdValue);

  if (!patientId) {
    notFound();
  }

  const patient = await getPatient(patientId);

  if (!patient) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 md:px-8 md:py-12">
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

      <header className="mt-5">
        <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
          Pacientes
        </p>
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">
          Editar ficha ficticia
        </h1>
        <p className="mt-3 mb-0 text-sm leading-6 text-[var(--color-muted)]">
          Actualizá únicamente los datos administrativos necesarios.
        </p>
      </header>

      <section className="mt-8 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <UserRoundCog
          aria-hidden="true"
          className="text-[var(--color-brand)]"
          size={24}
        />
        <h2 className="mt-3 mb-0 text-xl">
          {patient.lastName}, {patient.firstName}
        </h2>
        <PatientForm patient={patient} />
      </section>

      <section className="mt-5 rounded-[var(--radius-large)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-5 md:p-6">
        <h2 className="m-0 text-lg text-[var(--color-warning-foreground)]">
          {patient.isActive ? "Desactivar paciente" : "Reactivar paciente"}
        </h2>
        <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-warning-foreground)]">
          {patient.isActive
            ? "La ficha dejará de aparecer entre los pacientes activos, pero no se eliminará ningún dato."
            : "La ficha volverá a aparecer entre los pacientes activos."}
        </p>
        <PatientStatusForm patient={patient} />
      </section>
    </main>
  );
}
