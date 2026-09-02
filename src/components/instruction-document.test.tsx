import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InstructionDocument } from "./instruction-document";

describe("InstructionDocument", () => {
  it("renders the professional header, full content, and brand footer", () => {
    const markup = renderToStaticMarkup(
      <InstructionDocument
        showProfessionalData
        profile={{
          fullName: "Dra. Ana Pérez",
          licenseNumber: "MN 12345",
          licenseJurisdiction: "CABA",
          clinicName: "Clínica del Parque",
          officeAddress: "Av. Siempre Viva 742",
          contactPhone: "11 4444 5555",
          contactEmail: "turnos@clinica.com",
          additionalInformation: "Atención con turno previo",
        }}
        template={{
          title: "Cuidados posteriores",
          specialty: "surgery",
          introduction: "Leé con atención estas recomendaciones.",
          listStyle: "checks",
          points: [
            "Descansá durante las primeras horas.",
            "Consultá si aparece alguna molestia inesperada.",
          ],
        }}
      />,
    );

    expect(markup).toContain("Dra. Ana Pérez");
    expect(markup).toContain("MN 12345 · CABA");
    expect(markup).toContain("Clínica del Parque");
    expect(markup).toContain("Av. Siempre Viva 742");
    expect(markup).toContain("11 4444 5555");
    expect(markup).toContain("turnos@clinica.com");
    expect(markup).toContain("Atención con turno previo");
    expect(markup.indexOf("Clínica del Parque")).toBeLessThan(
      markup.indexOf("Dra. Ana Pérez"),
    );
    expect(markup.indexOf("Dra. Ana Pérez")).toBeLessThan(
      markup.indexOf("MN 12345 · CABA"),
    );
    expect(markup).toContain(
      ">Av. Siempre Viva 742 · 11 4444 5555 · turnos@clinica.com</p>",
    );
    expect(markup.indexOf("Descansá durante las primeras horas.")).toBeLessThan(
      markup.indexOf("Av. Siempre Viva 742"),
    );
    expect(markup).toContain("Cuidados posteriores");
    expect(markup).toContain("Leé con atención estas recomendaciones.");
    expect(markup).toContain("Descansá durante las primeras horas.");
    expect(markup).toContain(">Odonto<span");
    expect(markup).toContain(">Sync</span>");
    expect(markup).not.toContain("Creado en OdontoSync");
    expect(markup).not.toContain(
      "Indicaciones claras, cuidado que continúa.",
    );
    expect(markup).toContain("justify-self-end");
    expect(markup).toContain("border-t border-[#d7e5e2]");
    expect(markup).toContain("size-4 shrink-0 md:size-5");
    expect(markup).toContain("text-[0.64rem] font-semibold");
    expect(markup).toContain("md:text-[0.68rem]");
    expect(markup).toContain(
      "min-h-0 min-[30rem]:min-h-[42rem] md:min-h-[70rem]",
    );
    expect(markup).toContain("px-5 pt-5 pb-4");
    expect(markup).toContain("md:px-[clamp(1.5rem,4.5vw,3.75rem)]");
    expect(markup).toContain("text-[clamp(1rem,2.2vw,1.25rem)]");
    expect(markup).toContain("text-[1.35rem] leading-[1.15]");
    expect(markup).toContain(
      "md:text-[clamp(1.65rem,3.8vw,2.35rem)] md:leading-[1.12]",
    );
    expect(markup).not.toContain('class="h-px w-12');
    expect(markup).toContain("grid size-5 place-items-center");
    expect(markup).toContain("md:size-6");
    expect(markup).toContain("text-[0.78rem] leading-[1.2rem]");
    expect(markup).toContain("md:text-[0.84rem] md:leading-6");
    expect(markup).not.toContain("text-[clamp(2rem,5vw,3.35rem)]");
    expect(markup).not.toContain("border-t-2 border-[#147d73]");
    expect(markup).not.toContain("Paciente");
  });

  it("keeps account and placeholder data out of a neutral document header", () => {
    const markup = renderToStaticMarkup(
      <InstructionDocument
        profile={{
          fullName: "Evaluación OdontoSync",
          licenseNumber: null,
          licenseJurisdiction: null,
          clinicName: null,
          officeAddress: null,
          contactPhone: null,
          contactEmail: null,
          additionalInformation: null,
        }}
        template={{
          title: "Higiene diaria",
          specialty: "general",
          introduction: null,
          listStyle: "numbered",
          points: ["Usá un cepillo de cerdas suaves."],
        }}
      />,
    );

    expect(markup).toContain("Indicaciones profesionales");
    expect(markup).not.toContain("Evaluación OdontoSync");
    expect(markup).not.toContain("Datos profesionales");
  });

  it("uses the OdontoSync symbol as a list marker", () => {
    const markup = renderToStaticMarkup(
      <InstructionDocument
        profile={{
          fullName: "Consultorio Demo",
          licenseNumber: null,
          licenseJurisdiction: null,
          clinicName: null,
          officeAddress: null,
          contactPhone: null,
          contactEmail: null,
          additionalInformation: null,
        }}
        template={{
          title: "Higiene diaria",
          specialty: "general",
          introduction: null,
          listStyle: "odontosync",
          points: ["Usá un cepillo de cerdas suaves."],
        }}
      />,
    );

    expect(markup).toContain('aria-label="Marcador OdontoSync"');
  });

  it("offers a shorter paper for the live preview without changing the printable default", () => {
    const markup = renderToStaticMarkup(
      <InstructionDocument
        compact
        profile={{
          fullName: "Consultorio Demo",
          licenseNumber: null,
          licenseJurisdiction: null,
          clinicName: null,
          officeAddress: null,
          contactPhone: null,
          contactEmail: null,
          additionalInformation: null,
        }}
        template={{
          title: "Higiene diaria",
          specialty: "general",
          introduction: null,
          listStyle: "numbered",
          points: ["Usá un cepillo de cerdas suaves."],
        }}
      />,
    );

    expect(markup).toContain("min-h-0");
    expect(markup).toContain("min-[30rem]:min-h-[42rem]");
    expect(markup).toContain("max-w-[30rem]");
    expect(markup).not.toContain("min-h-[70rem]");
  });
});
