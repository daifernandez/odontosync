import { GoogleLoginButton } from "@/components/auth/google-login-button";

export function GoogleOnlyPanel({
  callbackError = false,
  redirectTo,
}: Readonly<{ callbackError?: boolean; redirectTo: string }>) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_0.75rem_2rem_rgb(19_48_45/5%)] sm:p-6">
      {callbackError ? (
        <p
          className="mt-0 mb-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-warning-foreground)]"
          role="alert"
        >
          No pudimos completar el acceso. Volvé a intentarlo.
        </p>
      ) : null}

      <GoogleLoginButton redirectTo={redirectTo} />
      <p className="mt-4 mb-0 text-center text-xs text-[var(--color-muted)]">
        Uso académico · solo datos ficticios
      </p>
    </div>
  );
}
