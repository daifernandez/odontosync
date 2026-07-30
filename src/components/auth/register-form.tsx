"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { registerAction } from "@/modules/auth/actions";
import { initialAuthFormState } from "@/modules/auth/domain/auth-form";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

export function RegisterForm() {
  const [state, action] = useActionState(
    registerAction,
    initialAuthFormState,
  );

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message ? (
        <p
          className={`m-0 rounded-xl border px-4 py-3 text-sm leading-6 ${
            state.status === "success"
              ? "border-[var(--color-border)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
              : "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <label className="text-sm font-semibold">
        Nombre completo
        <input
          aria-describedby={
            state.fieldErrors.fullName
              ? "register-full-name-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.fullName)}
          autoComplete="name"
          className={inputClassName}
          name="fullName"
          placeholder="Ej. Ana Fernández"
          type="text"
        />
        {state.fieldErrors.fullName ? (
          <span
            className="mt-2 block text-xs font-normal text-red-700"
            id="register-full-name-error"
          >
            {state.fieldErrors.fullName}
          </span>
        ) : null}
      </label>

      <label className="text-sm font-semibold">
        Correo electrónico
        <input
          aria-describedby={
            state.fieldErrors.email ? "register-email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          className={inputClassName}
          name="email"
          placeholder="tu@consultorio.com"
          type="email"
        />
        {state.fieldErrors.email ? (
          <span
            className="mt-2 block text-xs font-normal text-red-700"
            id="register-email-error"
          >
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>

      <label className="text-sm font-semibold">
        Contraseña
        <input
          aria-describedby="register-password-help"
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete="new-password"
          className={inputClassName}
          minLength={12}
          name="password"
          type="password"
        />
        <span
          className={`mt-2 block text-xs font-normal ${
            state.fieldErrors.password
              ? "text-red-700"
              : "text-[var(--color-muted)]"
          }`}
          id="register-password-help"
        >
          {state.fieldErrors.password ??
            "Usá 12 o más caracteres, con mayúscula, minúscula, número y símbolo."}
        </span>
      </label>

      <div>
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-muted)]">
          <input
            aria-describedby={
              state.fieldErrors.academicUse
                ? "register-academic-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.academicUse)}
            className="mt-1 size-4 shrink-0 accent-[var(--color-brand)]"
            name="academicUse"
            type="checkbox"
          />
          <span>
            Acepto usar esta versión académica únicamente con datos ficticios
            y no ingresar información clínica ni datos personales de pacientes
            reales.
          </span>
        </label>
        {state.fieldErrors.academicUse ? (
          <span
            className="mt-2 block text-xs text-red-700"
            id="register-academic-error"
          >
            {state.fieldErrors.academicUse}
          </span>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>

      <p className="m-0 text-center text-sm text-[var(--color-muted)]">
        ¿Ya tenés una cuenta?{" "}
        <Link
          className="font-bold text-[var(--color-brand)]"
          href="/ingresar"
        >
          Ingresar
        </Link>
      </p>
    </form>
  );
}
