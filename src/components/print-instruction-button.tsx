"use client";

import { Printer } from "lucide-react";

export function PrintInstructionButton() {
  return (
    <button
      aria-label="Imprimir o guardar como PDF"
      className="inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_0.65rem_1.8rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)] md:px-5 md:text-sm"
      onClick={() => window.print()}
      type="button"
    >
      <Printer aria-hidden="true" size={17} />
      <span className="xl:hidden">Imprimir / PDF</span>
      <span className="hidden xl:inline">
        Imprimir o guardar como PDF
      </span>
    </button>
  );
}
