import { DocumentSettingsForm } from "@/components/document-settings-form";
import { defaultInitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export default async function DocumentConfigurationPage() {
  const configuration = (await getInitialConfiguration()) ?? defaultInitialConfiguration;

  return (
    <section aria-labelledby="documents-configuration-title">
      <h2 className="m-0 text-xl tracking-[-0.03em] sm:text-2xl" id="documents-configuration-title">Datos para pacientes</h2>
      <p className="mt-1.5 mb-4 text-sm leading-6 text-[var(--color-muted)] sm:mt-2 sm:mb-5">
        Prepará los datos que podés incluir al imprimir una indicación.
      </p>
      <DocumentSettingsForm
        initialDocuments={{
          clinicName: configuration.clinicName,
          officeAddress: configuration.officeAddress,
          contactPhone: configuration.contactPhone,
          contactEmail: configuration.contactEmail,
          additionalInformation: configuration.additionalInformation,
        }}
        profile={{
          fullName: configuration.fullName,
          licenseNumber: configuration.licenseNumber,
          licenseJurisdiction: configuration.licenseJurisdiction,
        }}
      />
    </section>
  );
}
