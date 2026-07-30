"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { loginAction } from "@/modules/auth/actions";
import { initialAuthFormState } from "@/modules/auth/domain/auth-form";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

export function LoginForm({
  confirmationError = false,
}: Readonly<{ confirmationError?: boolean }>) {
  const [state, action] = useActionState(loginAction, initialAuthFormState);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {confirmationError ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          El enlace de confirmación no es válido o venció. Intentá registrarte
          nuevamente.
        </p>
      ) : null}

      {state.message ? (
        <p
          className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <label className="text-sm font-semibold">
        Correo electrónico
        <input
          aria-describedby={
            state.fieldErrors.email ? "login-email-error" : undefined
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
            id="login-email-error"
          >
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>

      <label className="text-sm font-semibold">
        Contraseña
        <input
          aria-describedby={
            state.fieldErrors.password ? "login-password-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete="current-password"
          className={inputClassName}
          name="password"
          type="password"
        />
        {state.fieldErrors.password ? (
          <span
            className="mt-2 block text-xs font-normal text-red-700"
            id="login-password-error"
          >
            {state.fieldErrors.password}
          </span>
        ) : null}
      </label>

      <SubmitButton pendingLabel="Ingresando…">
        Ingresar a OdontoSync
      </SubmitButton>

      <p className="m-0 text-center text-sm text-[var(--color-muted)]">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          className="font-bold text-[var(--color-brand)]"
          href="/registro"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
