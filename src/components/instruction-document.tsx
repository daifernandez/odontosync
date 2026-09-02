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
  clinicName: string | null;
  officeAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  additionalInformation: string | null;
};

type InstructionDocumentProps = {
  compact?: boolean;
  profile: InstructionProfessionalProfile;
  showProfessionalData?: boolean;
  template: InstructionTemplateInput;
};

export function InstructionProfessionalHeader({
  profile,
  showProfessionalData = false,
}: Readonly<{
  profile: InstructionProfessionalProfile;
  showProfessionalData?: boolean;
}>) {
  const license = [profile.licenseNumber, profile.licenseJurisdiction]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="instruction-document-header border-b border-[#c8dfdb] pb-4 md:pb-5">
      <p className="m-0 text-[0.5rem] font-semibold tracking-[0.14em] text-[#147d73] uppercase md:text-[0.54rem]">
        Indicaciones profesionales
      </p>

      {showProfessionalData ? (
        <div className="mt-2.5 min-w-0 md:mt-3">
          {profile.clinicName ? (
            <p className="m-0 text-[0.64rem] leading-4 font-semibold text-[#147d73] [overflow-wrap:anywhere] md:text-[0.68rem]">
              {profile.clinicName}
            </p>
          ) : null}
          <p className="m-0 text-[0.92rem] leading-5 font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] md:text-[clamp(1rem,2.2vw,1.25rem)] md:leading-normal">
            {profile.fullName}
          </p>
          {license ? (
            <p className="mt-0.5 mb-0 text-[0.64rem] text-[#6b7d79] [overflow-wrap:anywhere] md:mt-1 md:text-[0.68rem]">
              {license}
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

export function InstructionProfessionalFooter({
  profile,
  showProfessionalData = false,
}: Readonly<{
  profile: InstructionProfessionalProfile;
  showProfessionalData?: boolean;
}>) {
  const professionalContact = [
    profile.officeAddress,
    profile.contactPhone,
    profile.contactEmail,
  ]
    .filter(Boolean)
    .join(" · ");
  const showProfessionalFooter =
    showProfessionalData &&
    Boolean(professionalContact || profile.additionalInformation);

  return (
    <footer className="instruction-document-footer mt-auto break-inside-avoid border-t border-[#d7e5e2] pt-2.5 md:pt-3">
      <div className="grid gap-2.5 min-[30rem]:grid-cols-[minmax(0,1fr)_auto] min-[30rem]:items-end">
        {showProfessionalFooter ? (
          <div className="min-w-0 text-[0.58rem] leading-[0.9rem] text-[#6b7d79] md:text-[0.62rem] md:leading-4">
            {professionalContact ? (
              <p className="m-0 [overflow-wrap:anywhere]">
                {professionalContact}
              </p>
            ) : null}
            {profile.additionalInformation ? (
              <p className="mt-0.5 mb-0 [overflow-wrap:anywhere]">
                {profile.additionalInformation}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 justify-self-end">
          <BrandMark aria-hidden="true" className="size-4 shrink-0 md:size-5" />
          <strong className="text-[0.64rem] font-semibold tracking-[-0.015em] md:text-[0.68rem]">
            Odonto<span className="text-[#147d73]">Sync</span>
          </strong>
        </div>
      </div>
    </footer>
  );
}

export function InstructionDocument({
  compact = false,
  profile,
  showProfessionalData = false,
  template,
}: InstructionDocumentProps) {
  const specialty = instructionSpecialties.find(
    ({ value }) => value === template.specialty,
  );

  return (
    <article
      className={`instruction-document flex w-full flex-col overflow-hidden rounded-[1.1rem] bg-white px-5 pt-5 pb-4 text-[#17332f] shadow-[0_1.5rem_5rem_rgb(21_48_45/14%)] md:rounded-[1.4rem] md:px-[clamp(1.5rem,4.5vw,3.75rem)] md:pt-[clamp(1.75rem,4vw,3rem)] md:pb-[clamp(1.25rem,3vw,2.25rem)] ${compact ? "mx-auto min-h-0 max-w-[30rem] min-[30rem]:min-h-[42rem]" : "min-h-0 min-[30rem]:min-h-[42rem] md:min-h-[70rem]"}`}
    >
      <InstructionProfessionalHeader
        profile={profile}
        showProfessionalData={showProfessionalData}
      />

      <div className="instruction-document-content pt-6 pb-7 md:pt-[clamp(2rem,4vw,3rem)] md:pb-10">
        <p className="m-0 text-[0.52rem] font-semibold tracking-[0.12em] text-[#147d73] uppercase md:text-[0.56rem]">
          {specialty?.label ?? "Odontología general"}
        </p>
        <h1 className="mt-2 mb-0 max-w-[34rem] text-[1.35rem] leading-[1.15] tracking-[-0.04em] [overflow-wrap:anywhere] md:mt-2.5 md:text-[clamp(1.65rem,3.8vw,2.35rem)] md:leading-[1.12]">
          {template.title || "Título de la indicación"}
        </h1>

        {template.introduction ? (
          <p className="mt-4 mb-0 max-w-[39rem] whitespace-pre-wrap text-[0.78rem] leading-[1.2rem] text-[#566b67] [overflow-wrap:anywhere] md:mt-5 md:text-[0.84rem] md:leading-6">
            {template.introduction}
          </p>
        ) : null}

        <ol className="mt-6 flex list-none flex-col gap-3 p-0 md:mt-8 md:gap-[1.125rem]">
          {template.points.map((point, index) => (
            <li
              className="instruction-document-point grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 break-inside-avoid md:grid-cols-[1.5rem_minmax(0,1fr)] md:gap-3"
              key={`${index}-${point.slice(0, 24)}`}
            >
              {template.listStyle === "odontosync" ? (
                <span
                  aria-label="Marcador OdontoSync"
                  className="grid size-5 place-items-center rounded-full bg-[#edf7f5] md:size-6"
                >
                  <BrandMark aria-hidden="true" className="size-3.5 md:size-4" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-5 place-items-center rounded-full bg-[#edf7f5] text-[0.6rem] font-semibold text-[#0f665e] md:size-6 md:text-[0.66rem]"
                >
                  {getInstructionListMarker(template.listStyle, index)}
                </span>
              )}
              <p className="m-0 whitespace-pre-wrap text-[0.78rem] leading-[1.2rem] [overflow-wrap:anywhere] md:text-[0.84rem] md:leading-6">
                {point || "Escribí una indicación"}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <InstructionProfessionalFooter
        profile={profile}
        showProfessionalData={showProfessionalData}
      />
    </article>
  );
}
