"use client";

import { CheckCircle2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import type { ConfigurationFormState } from "@/modules/initial-configuration/domain/initial-configuration";

export function ConfigurationSaveBar({
  disabled = false,
  isDirty,
  label,
  onDiscard,
  state,
}: Readonly<{
  disabled?: boolean;
  isDirty: boolean;
  label: string;
  onDiscard?: () => void;
  state: ConfigurationFormState;
}>) {
  const { pending } = useFormStatus();
  const hasError = isDirty && state.status === "error";
  const saved = !isDirty && state.status === "success";

  return (
    <div
      className={`-mx-5 mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] bg-[rgb(255_255_255/96%)] px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:-mx-7 md:flex-row md:items-center md:justify-between md:px-7 md:py-4 ${
        isDirty
          ? "sticky bottom-0 z-10 shadow-[0_-0.75rem_2rem_rgb(28_66_61/8%)] backdrop-blur-sm"
          : ""
      }`}
    >
      <p
        aria-live="polite"
        className={`m-0 flex items-center gap-2 text-sm ${
          hasError
            ? "text-red-700"
            : saved
              ? "text-[var(--color-brand-dark)]"
              : "text-[var(--color-muted)]"
        }`}
        role={hasError ? "alert" : "status"}
      >
        {saved ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
        {pending
          ? "Guardando…"
          : hasError
            ? state.message
            : isDirty
            ? "Tenés cambios sin guardar"
            : (state.status === "success" ? state.message : "") || "Todos los cambios están guardados"}
      </p>
      <div className="flex flex-col gap-2 md:items-end">
        <button
          className="min-h-11 w-full shrink-0 whitespace-nowrap rounded-xl border-0 bg-[var(--color-brand)] px-5 text-sm font-bold text-white shadow-[0_0.65rem_1.8rem_rgb(20_125_115/18%)] transition-colors hover:bg-[var(--color-brand-dark)] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          disabled={!isDirty || disabled || pending}
          type="submit"
        >
          {pending ? "Guardando…" : label}
        </button>
        {isDirty && onDiscard ? <button
          className="min-h-11 rounded-xl border-0 bg-transparent px-3 text-sm font-semibold text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)]"
          disabled={pending}
          onClick={onDiscard}
          type="button"
        >Descartar cambios</button> : null}
      </div>
    </div>
  );
}
