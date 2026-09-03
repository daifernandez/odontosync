import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import type { PrintableId } from "@/modules/printables/domain/printable";

const permanentTeeth = [
  ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"],
  ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"],
] as const;
const temporaryTeeth = [
  ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"],
  ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"],
] as const;
const evolutionRows = ["1", "2", "3", "4", "5", "6"];
type PageNumber = 1 | 2 | 3 | 4;

const printablePages = {
  "historia-clinica-odontologica": [1, 2, 3, 4],
  "identificacion-antecedentes": [1],
  "examen-odontograma": [2, 3],
  "evolucion-documentacion": [4],
} as const satisfies Record<PrintableId, readonly PageNumber[]>;

type Field = { label: string; span?: "double" | "full" };

function FieldGrid({ fields }: Readonly<{ fields: readonly Field[] }>) {
  return (
    <div className="grid grid-cols-4 gap-x-[1.2em] gap-y-[0.75em]">
      {fields.map((field) => (
        <div
          className={
            field.span === "full"
              ? "col-span-4"
              : field.span === "double"
                ? "col-span-2"
                : undefined
          }
          key={field.label}
        >
          <span className="block text-[0.72em] leading-none font-semibold tracking-[0.06em] text-[#46635f] uppercase">
            {field.label}
          </span>
          <span aria-hidden="true" className="mt-[0.35em] block h-[1.7em] border-b border-[#a9c1bd]" />
        </div>
      ))}
    </div>
  );
}

function ProfessionalSignatureArea() {
  return (
    <div
      className="ml-auto flex h-[4cm] w-[9cm] shrink-0 flex-col justify-end"
      data-professional-signature-area="true"
    >
      <span className="block text-[0.72em] leading-none font-semibold tracking-[0.06em] text-[#46635f] uppercase">
        Firma / sello profesional
      </span>
      <span
        aria-hidden="true"
        className="mt-[0.45em] block border-b border-[#a9c1bd]"
      />
    </div>
  );
}

function CheckboxList({ items }: Readonly<{ items: readonly string[] }>) {
  return (
    <div className="grid grid-cols-2 gap-x-[1em] gap-y-[0.65em]">
      {items.map((item) => (
        <span className="flex items-center gap-[0.55em]" key={item}>
          <span aria-hidden="true" className="size-[1.1em] shrink-0 border border-[#7f9b96]" />
          <span className="text-[0.82em] leading-[1.25]">{item}</span>
        </span>
      ))}
    </div>
  );
}

function BlankLines({
  count,
  distributed = false,
}: Readonly<{ count: number; distributed?: boolean }>) {
  return (
    <div
      aria-hidden="true"
      className={
        distributed
          ? "mt-[0.25em] flex flex-1 flex-col justify-between"
          : "mt-[0.25em] grid gap-[0.65em]"
      }
      data-distributed-lines={distributed || undefined}
    >
      {Array.from({ length: count }, (_, index) => (
        <span className="h-[1.45em] border-b border-[#a9c1bd]" key={index} />
      ))}
    </div>
  );
}

function ClinicalSection({
  children,
  fill = false,
  layout = "boxed",
  title,
}: Readonly<{
  children: ReactNode;
  fill?: boolean;
  layout?: "boxed" | "open";
  title: string;
}>) {
  const isOpen = layout === "open";

  return (
    <section
      data-clinical-section-title={title}
      data-clinical-section-layout={layout}
      className={`printable-document-section ${
        isOpen
          ? "border-b border-[#c8dbd8] px-[0.2em] pt-[0.35em] pb-[1em]"
          : "rounded-[0.8em] border border-[#c8dbd8] p-[1.1em]"
      }${fill ? " flex flex-col" : ""}`}
    >
      <h3
        className={`mt-0 text-[0.78em] leading-none font-bold tracking-[0.09em] text-[#147d73] uppercase${
          isOpen
            ? " mb-[1.05em] border-b border-[#d7e5e2] pb-[0.7em]"
            : " mb-[0.85em]"
        }`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function DocumentPage({
  children,
  pageNumber,
  title,
}: Readonly<{ children: ReactNode; pageNumber: PageNumber; title: string }>) {
  return (
    <article
      className="printable-document relative flex aspect-[210/297] w-full flex-col overflow-hidden rounded-[1.4rem] bg-white p-[2.8em] text-[clamp(0.36rem,1.25vw,0.625rem)] text-[#17332f] shadow-[0_1.5rem_5rem_rgb(21_48_45/14%)]"
      data-printable-page={pageNumber}
    >
      <div
        data-printable-watermark="true"
        data-printable-watermark-pattern="true"
        aria-hidden="true"
        className="printable-document-watermark"
      >
        {Array.from({ length: 18 }, (_, index) => (
          <span data-printable-watermark-item="true" key={index}>
            OdontoSync
          </span>
        ))}
      </div>

      <header className="printable-document-section relative z-10 border-b border-[#c8dfdb] pb-[1.15em]">
        <div className="flex items-start justify-between gap-[1em]">
          <div>
            <p className="m-0 text-[0.72em] font-semibold tracking-[0.14em] text-[#147d73] uppercase">
              Historia clínica odontológica general
            </p>
            <h2 className="mt-[0.4em] mb-0 text-[2em] leading-[1.05] tracking-[-0.04em]">{title}</h2>
          </div>
          {pageNumber === 2 || pageNumber === 3 ? (
            <div className="w-[10em] shrink-0 text-left" data-printable-header-date="true">
              <span className="block text-[0.68em] font-semibold tracking-[0.06em] text-[#46635f] uppercase">
                Fecha
              </span>
              <span aria-hidden="true" className="mt-[0.25em] block h-[1.1em] border-b border-[#a9c1bd]" />
            </div>
          ) : null}
        </div>
        <div
          data-printable-identification="true"
          className={`${pageNumber === 2 || pageNumber === 3 ? "mt-[calc(1.1em+0.5cm)]" : "mt-[1.1em]"} grid grid-cols-4 gap-[1.1em]`}
        >
          {["N.º de historia", "Folio", "Paciente", "Documento"].map((label) => (
            <div key={label}>
              <span className="block text-[0.68em] font-semibold tracking-[0.06em] text-[#46635f] uppercase">{label}</span>
              <span aria-hidden="true" className="mt-[0.25em] block h-[1.45em] border-b border-[#a9c1bd]" />
            </div>
          ))}
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col gap-[1.05em] pt-[1.25em]">{children}</div>

      <footer className="printable-document-section relative z-10 mt-[1em] flex items-end justify-between gap-[1em] border-t border-[#d7e5e2] pt-[0.8em]">
        <p className="m-0 max-w-[70%] text-[0.68em] leading-[1.35] text-[#667b77]">
          Plantilla académica · Requiere validación profesional y jurídica antes de uso real.
        </p>
        <div className="flex items-center gap-[0.45em]">
          <BrandMark aria-hidden="true" className="size-[1.65em] shrink-0" />
          <strong className="text-[0.82em] font-semibold tracking-[-0.015em]">
            Odonto<span className="text-[#147d73]">Sync</span>
          </strong>
        </div>
      </footer>
    </article>
  );
}

function ToothDiagram() {
  return (
    <svg aria-hidden="true" className="aspect-square w-full" fill="none" viewBox="0 0 30 30">
      <rect height="28" rx="2" stroke="currentColor" width="28" x="1" y="1" />
      <rect height="10" stroke="currentColor" width="10" x="10" y="10" />
      <path d="M1 1l9 9M29 1l-9 9M1 29l9-9M29 29l-9-9" stroke="currentColor" />
    </svg>
  );
}

function OdontogramRow({ compact = false, teeth }: Readonly<{ compact?: boolean; teeth: readonly string[] }>) {
  return (
    <div className={compact ? "grid grid-cols-[repeat(10,minmax(0,1fr))] gap-[0.45em] px-[4.8em]" : "grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[0.32em]"}>
      {teeth.map((tooth) => (
        <div className="text-center text-[#4f6b66]" key={tooth}>
          <span className="mb-[0.2em] block text-[0.7em] font-semibold">{tooth}</span>
          <ToothDiagram />
        </div>
      ))}
    </div>
  );
}

function DentalClinicalHistory({ printableId }: Readonly<{ printableId: PrintableId }>) {
  const selectedPages: readonly PageNumber[] = printablePages[printableId];

  return (
    <div
      aria-label="Historia clínica odontológica general"
      className="printable-document-set grid gap-5"
      role="group"
    >
      {selectedPages.includes(1) ? (
        <DocumentPage pageNumber={1} title="Identificación y antecedentes">
        <ClinicalSection title="Datos de la atención">
          <FieldGrid fields={[{ label: "Lugar", span: "double" }, { label: "Fecha de inicio" }, { label: "Hora" }]} />
        </ClinicalSection>
        <ClinicalSection title="Profesional interviniente">
          <FieldGrid fields={[{ label: "Nombre y apellido", span: "double" }, { label: "Matrícula / jurisdicción" }, { label: "Especialidad" }]} />
        </ClinicalSection>
        <ClinicalSection title="Datos del paciente">
          <FieldGrid fields={[
            { label: "Nombre y apellido", span: "double" },
            { label: "DNI / pasaporte / cédula" },
            { label: "Fecha de nacimiento" },
            { label: "Edad" },
            { label: "Sexo" },
            { label: "Teléfono" },
            { label: "Correo electrónico" },
            { label: "Domicilio", span: "double" },
            { label: "Cobertura" },
            { label: "N.º de afiliación" },
          ]} />
        </ClinicalSection>
        <ClinicalSection title="Familiar, referente o responsable">
          <FieldGrid fields={[{ label: "Nombre y apellido", span: "double" }, { label: "Vínculo" }, { label: "Teléfono" }]} />
        </ClinicalSection>
        <div className="grid grid-cols-2 gap-[1.05em]">
          <ClinicalSection title="Motivo de consulta y derivación"><BlankLines count={3} /></ClinicalSection>
          <ClinicalSection title="Antecedentes médicos y familiares">
            <CheckboxList items={["Condiciones relevantes", "Cirugías / internaciones", "Alergias / reacciones", "Medicación actual", "Sangrado / anticoagulantes", "Embarazo, si corresponde"]} />
            <BlankLines count={2} />
          </ClinicalSection>
        </div>
        <ClinicalSection title="Antecedentes odontológicos">
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-[1.2em]">
            <CheckboxList items={["Tratamientos previos", "Dolor / síntomas", "Traumatismos", "Reacción a anestesia", "Prótesis / ortodoncia", "Hábitos relevantes"]} />
            <BlankLines count={3} />
          </div>
        </ClinicalSection>
        <div className="printable-document-section mt-auto grid grid-cols-2 gap-[3em]">
          <FieldGrid fields={[{ label: "Firma del paciente / responsable", span: "full" }]} />
          <FieldGrid fields={[{ label: "Firma / sello profesional", span: "full" }]} />
        </div>
        </DocumentPage>
      ) : null}

      {selectedPages.includes(2) ? (
        <DocumentPage pageNumber={2} title="Examen y registro odontológico">
        <div className="grid grid-cols-2 gap-[1.05em]">
          <ClinicalSection layout="open" title="Examen extraoral">
            <CheckboxList items={["Simetría facial", "ATM", "Ganglios", "Glándulas salivales"]} />
            <BlankLines count={3} />
          </ClinicalSection>
          <ClinicalSection layout="open" title="Examen intraoral">
            <CheckboxList items={["Labios y mucosas", "Lengua y piso de boca", "Paladar", "Encías y periodonto", "Higiene", "Oclusión", "Lesiones", "Otros hallazgos"]} />
            <BlankLines count={2} />
          </ClinicalSection>
        </div>
        <ClinicalSection title="Odontograma FDI">
          <p className="mt-0 mb-[0.5em] text-[0.7em] font-semibold tracking-[0.06em] text-[#46635f] uppercase">Dentición permanente</p>
          <OdontogramRow teeth={permanentTeeth[0]} />
          <div className="my-[0.55em] border-t border-dashed border-[#9db6b2]" />
          <OdontogramRow teeth={permanentTeeth[1]} />
          <p className="mt-[1.1em] mb-[0.5em] text-[0.7em] font-semibold tracking-[0.06em] text-[#46635f] uppercase">Dentición temporaria</p>
          <OdontogramRow compact teeth={temporaryTeeth[0]} />
          <div className="mx-[4.8em] my-[0.55em] border-t border-dashed border-[#9db6b2]" />
          <OdontogramRow compact teeth={temporaryTeeth[1]} />
          <p className="mt-[0.8em] mb-0 text-[0.66em] leading-[1.35] text-[#667b77]">
            Registre hallazgos con la convención profesional aplicable. Esta plantilla no define símbolos ni colores clínicos.
          </p>
        </ClinicalSection>
        <div className="grid grid-cols-2 gap-[1.05em]">
          <ClinicalSection layout="open" title="Referencias y observaciones"><BlankLines count={4} /></ClinicalSection>
          <ClinicalSection layout="open" title="Estudios complementarios e interconsultas"><BlankLines count={4} /></ClinicalSection>
        </div>
        <div className="printable-document-section mt-auto">
          <ProfessionalSignatureArea />
        </div>
        </DocumentPage>
      ) : null}

      {selectedPages.includes(3) ? (
        <DocumentPage pageNumber={3} title="Diagnóstico y pronóstico">
        <div className="grid flex-1 grid-rows-[2fr_1fr] gap-[1.05em]">
          <ClinicalSection fill layout="open" title="Diagnóstico"><BlankLines count={10} distributed /></ClinicalSection>
          <ClinicalSection fill layout="open" title="Pronóstico"><BlankLines count={5} distributed /></ClinicalSection>
        </div>
        <div className="printable-document-section mt-auto">
          <ProfessionalSignatureArea />
        </div>
        </DocumentPage>
      ) : null}

      {selectedPages.includes(4) ? (
        <DocumentPage pageNumber={4} title="Plan, evolución y documentación">
        <div className="printable-document-section flex items-end justify-between gap-[2em]">
          <p className="m-0 text-[0.78em] font-bold tracking-[0.09em] text-[#147d73] uppercase">Anexo de evolución N.º</p>
          <span aria-hidden="true" className="h-[1.5em] w-[12em] border-b border-[#a9c1bd]" />
        </div>
        <div className="grid grid-cols-2 gap-[1.05em]">
          <ClinicalSection title="Objetivos, alternativas y plan de tratamiento"><BlankLines count={6} /></ClinicalSection>
          <ClinicalSection title="Indicaciones, medicación y derivaciones"><BlankLines count={6} /></ClinicalSection>
        </div>
        <section className="printable-document-section">
          <h3 className="mt-0 mb-[0.75em] text-[0.78em] leading-none font-bold tracking-[0.09em] text-[#147d73] uppercase">Evolución y actuaciones</h3>
          <div className="overflow-hidden rounded-[0.7em] border border-[#a9c1bd]" role="table">
            <div className="grid grid-cols-[0.7fr_0.55fr_1fr_3fr_1.25fr] bg-[#edf7f5] text-[0.68em] font-bold tracking-[0.05em] text-[#0f665e] uppercase" role="row">
              {["Fecha", "Hora", "Pieza / área", "Acto, procedimiento y evolución", "Firma / sello"].map((heading) => (
                <span className="border-r border-[#a9c1bd] px-[0.55em] py-[0.7em] last:border-r-0" key={heading} role="columnheader">{heading}</span>
              ))}
            </div>
            {evolutionRows.map((row) => (
              <div className="grid min-h-[5.2em] grid-cols-[0.7fr_0.55fr_1fr_3fr_1.25fr] border-t border-[#a9c1bd]" key={row} role="row">
                {Array.from({ length: 5 }, (_, cell) => (
                  <span className="border-r border-[#a9c1bd] last:border-r-0" key={cell} role="cell" />
                ))}
              </div>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-[0.85fr_1.15fr] gap-[1.05em]">
          <ClinicalSection title="Documentación adjunta">
            <CheckboxList items={["Estudios / imágenes", "Prescripciones", "Derivaciones", "Indicaciones", "Otra documentación", "No corresponde"]} />
          </ClinicalSection>
          <ClinicalSection title="Rechazo, suspensión, abandono u observaciones"><BlankLines count={4} /></ClinicalSection>
        </div>
        <div className="printable-document-section mt-auto grid grid-cols-3 gap-[2em]">
          <FieldGrid fields={[{ label: "Fecha y hora", span: "full" }]} />
          <FieldGrid fields={[{ label: "Firma del paciente / responsable", span: "full" }]} />
          <FieldGrid fields={[{ label: "Firma / sello profesional", span: "full" }]} />
        </div>
        </DocumentPage>
      ) : null}
    </div>
  );
}

export function PrintableDocument({ printableId }: Readonly<{ printableId: PrintableId }>) {
  return <DentalClinicalHistory printableId={printableId} />;
}
