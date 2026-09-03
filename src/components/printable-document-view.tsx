import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PrintInstructionButton } from "@/components/print-instruction-button";
import { PrintableDocument } from "@/components/printable-document";
import type { PrintableId } from "@/modules/printables/domain/printable";

type PrintableDocumentViewProps = {
  printableId: PrintableId;
};

export function PrintableDocumentView({
  printableId,
}: Readonly<PrintableDocumentViewProps>) {
  return (
    <main className="px-3 py-5 md:px-8 md:py-10">
      <div className="printable-screen-only mx-auto mb-4 max-w-[52rem] md:mb-5">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:underline sm:text-sm"
          href="/app/imprimibles"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver a imprimibles
        </Link>

        <div className="mt-3 flex flex-col gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] md:mt-4 md:flex-row md:items-center md:justify-between md:rounded-[var(--radius-large)] md:p-4">
          <p className="m-0 text-xs leading-5 text-[var(--color-muted)] md:text-sm">
            <strong className="text-[var(--color-brand-dark)]">
              Plantilla académica vacía.
            </strong>{" "}
            Completala a mano después de imprimirla. Requiere validación
            profesional y jurídica antes de uso real.
            {printableId === "examen-odontograma" ? (
              <span
                data-double-sided-print-help="true"
                className="printable-screen-only mt-1 block font-semibold text-[var(--color-brand-dark)]"
              >
                Imprimí doble faz, con giro por el borde largo.
              </span>
            ) : null}
          </p>
          <div className="shrink-0">
            <PrintInstructionButton />
          </div>
        </div>
      </div>

      <div className="printable-print-root mx-auto max-w-[52rem]">
        <PrintableDocument printableId={printableId} />
      </div>
    </main>
  );
}
