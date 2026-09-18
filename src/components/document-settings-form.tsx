"use client";

import { ChevronDown, Eye } from "lucide-react";
import { useActionState, useState } from "react";

import { ConfigurationFieldError, configurationCardClassName, configurationInputClassName } from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import {
  InstructionProfessionalFooter,
  InstructionProfessionalHeader,
  type InstructionProfessionalProfile,
} from "@/components/instruction-document";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveDocumentSettingsAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  type DocumentSettings,
  type ProfileSettings,
} from "@/modules/initial-configuration/domain/initial-configuration";

function DocumentPreview({
  preview,
}: Readonly<{ preview: InstructionProfessionalProfile }>) {
  return (
    <>
      <div className="mt-3 rounded-xl bg-white p-4 shadow-[var(--shadow-card)]">
        <InstructionProfessionalHeader profile={preview} showProfessionalData />
        <div aria-hidden="true" className="h-20" />
        <InstructionProfessionalFooter profile={preview} showProfessionalData />
      </div>
      <p className="mt-3 mb-0 text-xs leading-5 text-[var(--color-muted)]">
        Podrás decidir si incluir estos datos antes de imprimir.
      </p>
    </>
  );
}

export function DocumentSettingsForm({
  initialDocuments,
  profile,
}: Readonly<{
  initialDocuments: DocumentSettings;
  profile: ProfileSettings;
}>) {
  const [state, action] = useActionState(
    saveDocumentSettingsAction,
    configurationFormState,
  );
  const { isDirty, markDirty } = useUnsavedChanges(state);
  const [documents, setDocuments] = useState(initialDocuments);
  const preview: InstructionProfessionalProfile = { ...profile, ...documents };

  function update(field: keyof DocumentSettings, value: string) {
    setDocuments((current) => ({ ...current, [field]: value }));
    markDirty();
  }

  return (
    <form action={action} className={configurationCardClassName} noValidate>
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] xl:items-start">
        <div>
          <h2 className="m-0 text-xl">Información reutilizable</h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Completá únicamente lo que quieras ofrecer al generar indicaciones.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">
              Clínica o consultorio <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              <input
                aria-describedby={state.fieldErrors.clinicName ? "documents-clinic-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.clinicName)}
                autoComplete="organization"
                className={configurationInputClassName}
                maxLength={120}
                name="clinicName"
                onChange={(event) => update("clinicName", event.target.value)}
                value={documents.clinicName ?? ""}
              />
              <ConfigurationFieldError id="documents-clinic-error" message={state.fieldErrors.clinicName} />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Dirección <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              <input
                aria-describedby={state.fieldErrors.officeAddress ? "documents-address-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.officeAddress)}
                autoComplete="street-address"
                className={configurationInputClassName}
                maxLength={160}
                name="officeAddress"
                onChange={(event) => update("officeAddress", event.target.value)}
                value={documents.officeAddress ?? ""}
              />
              <ConfigurationFieldError id="documents-address-error" message={state.fieldErrors.officeAddress} />
            </label>

            <label className="text-sm font-semibold">
              Teléfono <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              <input
                aria-describedby={state.fieldErrors.contactPhone ? "documents-phone-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.contactPhone)}
                autoComplete="tel"
                className={configurationInputClassName}
                maxLength={50}
                name="contactPhone"
                onChange={(event) => update("contactPhone", event.target.value)}
                type="tel"
                value={documents.contactPhone ?? ""}
              />
              <ConfigurationFieldError id="documents-phone-error" message={state.fieldErrors.contactPhone} />
            </label>

            <label className="text-sm font-semibold">
              Email <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              <input
                aria-describedby={state.fieldErrors.contactEmail ? "documents-email-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.contactEmail)}
                autoComplete="email"
                className={configurationInputClassName}
                maxLength={254}
                name="contactEmail"
                onChange={(event) => update("contactEmail", event.target.value)}
                type="email"
                value={documents.contactEmail ?? ""}
              />
              <ConfigurationFieldError id="documents-email-error" message={state.fieldErrors.contactEmail} />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Información adicional <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              <input
                aria-describedby={state.fieldErrors.additionalInformation ? "documents-additional-error" : "documents-additional-help"}
                aria-invalid={Boolean(state.fieldErrors.additionalInformation)}
                className={configurationInputClassName}
                maxLength={160}
                name="additionalInformation"
                onChange={(event) => update("additionalInformation", event.target.value)}
                placeholder="Ej. Atención con turno previo"
                value={documents.additionalInformation ?? ""}
              />
              <span className="mt-2 block text-xs font-normal text-[var(--color-muted)]" id="documents-additional-help">
                Usá una frase breve que resulte útil para el paciente.
              </span>
              <ConfigurationFieldError id="documents-additional-error" message={state.fieldErrors.additionalInformation} />
            </label>
          </div>
        </div>

        <details className="group rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-page)] p-3 open:pb-4 xl:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-bold text-[var(--color-brand-dark)] [&::-webkit-details-marker]:hidden">
            <Eye aria-hidden="true" size={17} strokeWidth={1.8} />
            <span className="flex-1">Ver vista previa</span>
            <ChevronDown
              aria-hidden="true"
              className="transition-transform group-open:rotate-180"
              size={17}
            />
          </summary>
          <DocumentPreview preview={preview} />
        </details>

        <aside className="hidden rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 xl:sticky xl:top-6 xl:block">
          <p className="m-0 text-sm font-bold text-[var(--color-brand-dark)]">
            Vista previa
          </p>
          <DocumentPreview preview={preview} />
        </aside>
      </div>

      <ConfigurationSaveBar isDirty={isDirty} label="Guardar datos" state={state} />
    </form>
  );
}
