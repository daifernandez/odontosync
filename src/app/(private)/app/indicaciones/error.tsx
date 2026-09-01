"use client";

import { CircleAlert } from "lucide-react";

export default function InstructionsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-2xl place-items-center px-4 py-12 text-center md:px-8">
      <div>
        <CircleAlert
          aria-hidden="true"
          className="mx-auto text-[var(--color-brand)]"
          size={38}
        />
        <h1 className="mt-4 mb-0 text-2xl">No pudimos abrir tus indicaciones</h1>
        <p className="mx-auto mt-3 mb-0 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
          Tu biblioteca no se modificó. Intentá cargarla nuevamente.
        </p>
        <button
          className="mt-6 min-h-11 cursor-pointer rounded-xl border-0 bg-[var(--color-brand)] px-5 text-sm font-bold text-white hover:bg-[var(--color-brand-dark)]"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
