"use client";

import { FilePenLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  InstructionDocument,
  type InstructionProfessionalProfile,
} from "@/components/instruction-document";
import { PrintInstructionButton } from "@/components/print-instruction-button";
import type { InstructionTemplate } from "@/modules/instructions/domain/instruction-template";

type PrintableInstructionViewProps = {
  profile: InstructionProfessionalProfile;
  template: InstructionTemplate;
};

export function PrintableInstructionView({
  profile,
  template,
}: Readonly<PrintableInstructionViewProps>) {
  const [showProfessionalData, setShowProfessionalData] = useState(false);

  return (
    <>
      <div className="instruction-screen-only mx-auto mb-4 max-w-[30rem] md:mb-5 md:max-w-[60rem]">
        <div className="mt-3 flex flex-col gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] md:mt-4 md:rounded-[var(--radius-large)] md:p-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="m-0 text-[0.62rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase md:text-[0.68rem]">
              Vista final
            </p>
            <p className="mt-1 mb-0 hidden text-[0.72rem] leading-[1.1rem] text-[var(--color-muted)] md:block md:text-xs md:leading-5">
              Elegí qué información incluir antes de imprimir o guardar como
              PDF.
            </p>
            <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 text-xs font-semibold text-[var(--color-brand-dark)] md:text-sm">
              <input
                checked={showProfessionalData}
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)] md:size-[1.125rem]"
                onChange={(event) =>
                  setShowProfessionalData(event.target.checked)
                }
                type="checkbox"
              />
              <span>
                Incluir mis datos profesionales
                <span className="mt-0.5 block text-[0.68rem] font-normal text-[var(--color-muted)] md:text-xs">
                  Solo para esta impresión.
                </span>
              </span>
            </label>
          </div>

          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 md:flex md:flex-row">
            <Link
              className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-2 text-xs font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)] md:px-4 md:text-sm"
              href={`/app/indicaciones/${template.id}/editar`}
            >
              <FilePenLine aria-hidden="true" size={17} />
              Editar
            </Link>
            <PrintInstructionButton />
          </div>
        </div>
      </div>

      <div className="instruction-print-root mx-auto max-w-[30rem] md:max-w-[60rem]">
        <InstructionDocument
          profile={profile}
          showProfessionalData={showProfessionalData}
          template={template}
        />
      </div>
    </>
  );
}
