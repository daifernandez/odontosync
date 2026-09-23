import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { createClient } from "@/lib/supabase/server";
import { acceptAcademicUseAction, logoutAction } from "@/modules/auth/actions";
import { needsAcademicUseAcceptance } from "@/modules/auth/domain/academic-use";

export const metadata: Metadata = {
  title: "Uso académico | OdontoSync",
  description: "Confirmá el uso académico antes de entrar a OdontoSync.",
};

export default async function AcademicUsePage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/ingresar");
  }

  if (!needsAcademicUseAcceptance(data.user)) {
    redirect("/app");
  }

  const { error } = await searchParams;

  return (
    <AuthShell
      description="Antes de usar tu cuenta de Google, confirmá las condiciones de esta versión académica."
      eyebrow="Primer acceso"
      title="Uso de datos ficticios"
    >
      <form action={acceptAcademicUseAction} className="flex flex-col gap-5">
        {error ? (
          <p className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm" role="alert">
            {error === "aceptacion"
              ? "Tenés que aceptar el uso académico para continuar."
              : "No pudimos guardar tu aceptación. Intentá nuevamente."}
          </p>
        ) : null}
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-muted)]">
          <input
            className="mt-1 size-4 shrink-0 accent-[var(--color-brand)]"
            name="academicUse"
            type="checkbox"
          />
          <span>
            Acepto usar esta versión académica únicamente con datos ficticios
            y no ingresar información clínica ni datos personales de pacientes reales.
          </span>
        </label>
        <SubmitButton pendingLabel="Guardando…">Continuar a OdontoSync</SubmitButton>
      </form>
      <form action={logoutAction} className="mt-4">
        <button className="min-h-11 w-full text-sm font-semibold text-[var(--color-brand-dark)]" type="submit">
          Salir sin aceptar
        </button>
      </form>
    </AuthShell>
  );
}
