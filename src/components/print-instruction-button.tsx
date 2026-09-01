"use client";

import { Printer } from "lucide-react";

export function PrintInstructionButton() {
  return (
    <button
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-5 text-sm font-bold text-white shadow-[0_0.65rem_1.8rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)]"
      onClick={() => window.print()}
      type="button"
    >
      <Printer aria-hidden="true" size={17} />
      Imprimir o guardar como PDF
    </button>
  );
}
