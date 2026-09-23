import type { Metadata } from "next";

import { GoogleOnlyPanel } from "@/components/auth/google-only-panel";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { isEmailAuthEnabled } from "@/modules/auth/email-auth";

export const metadata: Metadata = {
  title: "Ingresar | OdontoSync",
  description: "Ingresá a tu cuenta de OdontoSync.",
};

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string }>;
}>) {
  const params = await searchParams;
  const emailAuthEnabled = isEmailAuthEnabled();
  const callbackError = params.error === "acceso" || params.error === "confirmacion";

  return (
    <AuthShell
      description={emailAuthEnabled ? "Ingresá con correo y contraseña o continuá con Google." : "Ingresá o creá tu cuenta con Google."}
      eyebrow="Bienvenida"
      title="Ingresá a tu espacio"
    >
      {emailAuthEnabled ? (
        <LoginForm callbackError={callbackError} googleRedirectTo={getAuthCallbackUrl()} />
      ) : (
        <GoogleOnlyPanel callbackError={callbackError} redirectTo={getAuthCallbackUrl()} />
      )}
    </AuthShell>
  );
}
