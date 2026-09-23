import type { Metadata } from "next";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleOnlyPanel } from "@/components/auth/google-only-panel";
import { RegisterForm } from "@/components/auth/register-form";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { isEmailAuthEnabled } from "@/modules/auth/email-auth";

export const metadata: Metadata = {
  title: "Crear cuenta | OdontoSync",
  description: "Creá tu cuenta individual de OdontoSync.",
};

export default async function RegisterPage() {
  await connection();
  const emailAuthEnabled = isEmailAuthEnabled();

  return (
    <AuthShell
      description={emailAuthEnabled ? "Empezá con una cuenta individual. Luego vas a poder configurar el consultorio según tu forma de trabajar." : "Creá tu cuenta o ingresá con Google."}
      eyebrow="Cuenta individual"
      title="Creá tu espacio"
    >
      {emailAuthEnabled ? (
        <RegisterForm googleRedirectTo={getAuthCallbackUrl()} />
      ) : (
        <GoogleOnlyPanel redirectTo={getAuthCallbackUrl()} />
      )}
    </AuthShell>
  );
}
