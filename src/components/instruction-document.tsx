import { BrandMark } from "@/components/brand-mark";
import {
  getInstructionListMarker,
  instructionSpecialties,
  type InstructionTemplateInput,
} from "@/modules/instructions/domain/instruction-template";

export type InstructionProfessionalProfile = {
  fullName: string;
  licenseNumber: string | null;
  licenseJurisdiction: string | null;
};

type InstructionDocumentProps = {
  compact?: boolean;
  profile: InstructionProfessionalProfile;
  template: InstructionTemplateInput;
};

export function InstructionDocument({
  compact = false,
  profile,
  template,
}: InstructionDocumentProps) {
  const specialty = instructionSpecialties.find(
    ({ value }) => value === template.specialty,
  );
  const license = [profile.licenseNumber, profile.licenseJurisdiction]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`instruction-document flex w-full flex-col overflow-hidden rounded-[1.4rem] bg-white px-[clamp(1.5rem,4.5vw,3.75rem)] pt-[clamp(1.75rem,4vw,3rem)] pb-[clamp(1.25rem,3vw,2.25rem)] text-[#17332f] shadow-[0_1.5rem_5rem_rgb(21_48_45/14%)] ${compact ? "mx-auto min-h-[42rem] max-w-[30rem]" : "min-h-[70rem]"}`}
    >
      <header className="instruction-document-header border-b border-[#c8dfdb] pb-5">
        <p className="m-0 text-[0.54rem] font-semibold tracking-[0.14em] text-[#147d73] uppercase">
          Indicaciones profesionales
        </p>
        <div className="mt-2.5 flex items-end justify-between gap-5">
          <div>
            <p className="m-0 text-[clamp(1rem,2.2vw,1.25rem)] font-semibold tracking-[-0.02em]">
              {profile.fullName || "Profesional odontológico"}
            </p>
            <p className="mt-1 mb-0 min-h-4 text-[0.68rem] text-[#6b7d79]">
              {license || "Datos profesionales"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="h-px w-12 shrink-0 bg-[#9fcac5]"
          />
        </div>
      </header>

      <div className="instruction-document-content pt-[clamp(2rem,4vw,3rem)] pb-10">
        <p className="m-0 text-[0.56rem] font-semibold tracking-[0.12em] text-[#147d73] uppercase">
          {specialty?.label ?? "Odontología general"}
        </p>
        <h1 className="mt-2.5 mb-0 max-w-[34rem] text-[clamp(1.65rem,3.8vw,2.35rem)] leading-[1.12] tracking-[-0.04em] [overflow-wrap:anywhere]">
          {template.title || "Título de la indicación"}
        </h1>

        {template.introduction ? (
          <p className="mt-5 mb-0 max-w-[39rem] whitespace-pre-wrap text-[0.84rem] leading-6 text-[#566b67] [overflow-wrap:anywhere]">
            {template.introduction}
          </p>
        ) : null}

        <ol className="mt-8 flex list-none flex-col gap-[1.125rem] p-0">
          {template.points.map((point, index) => (
            <li
              className="instruction-document-point grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 break-inside-avoid"
              key={`${index}-${point.slice(0, 24)}`}
            >
              {template.listStyle === "odontosync" ? (
                <span
                  aria-label="Marcador OdontoSync"
                  className="grid size-6 place-items-center rounded-full bg-[#edf7f5]"
                >
                  <BrandMark aria-hidden="true" className="size-4" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-6 place-items-center rounded-full bg-[#edf7f5] text-[0.66rem] font-semibold text-[#0f665e]"
                >
                  {getInstructionListMarker(template.listStyle, index)}
                </span>
              )}
              <p className="m-0 whitespace-pre-wrap text-[0.84rem] leading-6 [overflow-wrap:anywhere]">
                {point || "Escribí una indicación"}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <footer className="instruction-document-footer mt-auto break-inside-avoid border-t border-[#d7e5e2] pt-3">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1.5">
            <BrandMark aria-hidden="true" className="size-5 shrink-0" />
            <strong className="text-[0.68rem] font-semibold tracking-[-0.015em]">
              Odonto<span className="text-[#147d73]">Sync</span>
            </strong>
          </div>
        </div>
      </footer>
    </article>
  );
}
