"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteAccountAction } from "@/modules/account-deletion/actions";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-xl border-0 bg-red-700 px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Eliminando cuenta…" : "Eliminar cuenta definitivamente"}
    </button>
  );
}

export function AccountDeletionPanel({ email }: Readonly<{ email: string }>) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteAccountAction, { status: "idle" as const, message: "" });

  return (
    <section
      aria-labelledby="account-deletion-title"
      className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-7"
    >
      <h2 className="m-0 text-xl" id="account-deletion-title">Eliminar cuenta</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        Podés eliminar tu cuenta y todos los datos asociados cuando lo necesites.
      </p>
      <button
        aria-controls="account-deletion-confirmation"
        aria-expanded={open}
        className="min-h-11 rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        onClick={() => setOpen(!open)}
        type="button"
      >
        Eliminar mi cuenta
      </button>

      {open ? (
        <div className="mt-5 border-t border-[var(--color-border)] pt-5" id="account-deletion-confirmation">
          <p className="m-0 text-sm leading-6 text-[var(--color-foreground)]">
            Esta acción es permanente. Se eliminarán tu perfil, foto, preferencias, horarios,
            pacientes, turnos, contactos, indicaciones y bloqueos. No podrás recuperar estos datos
            ni volver a ingresar con esta cuenta.
          </p>
          <form action={action} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold" htmlFor="account-deletion-email">
              Escribí el correo {email} para confirmar
              <input
                autoComplete="off"
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-normal"
                id="account-deletion-email"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input className="mt-1 size-4" name="accepted" required type="checkbox" />
              Entiendo que la eliminación es permanente y acepto borrar mi cuenta y sus datos.
            </label>
            {state.message ? (
              <p
                className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning-foreground)]"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <DeleteButton />
              <button
                className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
                disabled={pending}
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
