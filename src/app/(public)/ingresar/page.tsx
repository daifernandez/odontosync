import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

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

  return (
    <AuthShell
      description="Usá el correo y la contraseña con los que creaste tu cuenta."
      eyebrow="Bienvenida"
      title="Ingresá a tu espacio"
    >
      <LoginForm confirmationError={params.error === "confirmacion"} />
    </AuthShell>
  );
}
