"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton({ redirectTo }: Readonly<{ redirectTo: string }>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function startGoogleLogin() {
    setPending(true);
    setError(false);

    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (!error) {
        return;
      }
    } catch {
      // The same retry message applies to a network or provider failure.
    }

    setPending(false);
    setError(true);
  }

  return (
    <div>
      {error ? (
        <p className="mb-3 text-sm text-[var(--color-warning-foreground)]" role="alert">
          No pudimos iniciar el acceso con Google. Intentá nuevamente.
        </p>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-bold text-[var(--color-foreground)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] disabled:opacity-60 sm:gap-3 sm:px-5"
        disabled={pending}
        onClick={startGoogleLogin}
        type="button"
      >
        <span aria-hidden="true" className="grid size-5 place-items-center">
          <svg className="size-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94a11.06 11.06 0 0 1-4.82 7.26l7.73 6C44.36 38.1 46.98 31.95 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.42 14.42 0 0 1 9.75 24c0-1.6.27-3.15.78-4.59l-7.97-6.2A23.88 23.88 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.9-5.73l-7.73-6C30.03 37.73 27.29 38.5 24 38.5c-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
        </span>
        {pending ? "Conectando con Google…" : "Continuar con Google"}
      </button>
    </div>
  );
}
