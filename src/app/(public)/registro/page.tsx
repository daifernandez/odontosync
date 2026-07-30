import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta | OdontoSync",
  description: "Creá tu cuenta individual de OdontoSync.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      description="Empezá con una cuenta individual. Luego vas a poder configurar el consultorio según tu forma de trabajar."
      eyebrow="Cuenta individual"
      title="Creá tu espacio"
    >
      <RegisterForm />
    </AuthShell>
  );
}
