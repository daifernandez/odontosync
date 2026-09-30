import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAuthCallbackUrl } from "@/lib/app-url";

export const metadata: Metadata = {
  title: "Ingresar | OdontoSync",
  description: "Ingresá a tu cuenta de OdontoSync.",
};

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; cuenta?: string }>;
}>) {
  const params = await searchParams;
  const callbackError = params.error === "acceso" || params.error === "confirmacion";

  return (
    <AuthShell
      description="Ingresá con correo y contraseña o continuá con Google."
      eyebrow="Bienvenida"
      title="Ingresá a tu espacio"
    >
      {params.cuenta === "eliminada" ? (
        <p className="m-0 mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4 py-3 text-sm leading-6 text-[var(--color-brand-dark)]" role="status">
          Tu cuenta y sus datos fueron eliminados.
        </p>
      ) : null}
      <LoginForm callbackError={callbackError} googleRedirectTo={getAuthCallbackUrl()} />
    </AuthShell>
  );
}
