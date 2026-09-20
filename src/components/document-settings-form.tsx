"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { ConfigurationFieldError, configurationCardClassName, configurationInputClassName } from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import {
  InstructionProfessionalFooter,
  InstructionProfessionalHeader,
  type InstructionProfessionalProfile,
} from "@/components/instruction-document";
import { useConfigurationDraft } from "@/components/configuration-drafts";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveDocumentSettingsAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  type DocumentSettings,
  type ProfileSettings,
} from "@/modules/initial-configuration/domain/initial-configuration";

function PreviewDocument({ preview }: Readonly<{ preview: InstructionProfessionalProfile }>) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[var(--shadow-card)]">
      <InstructionProfessionalHeader profile={preview} showProfessionalData />
      <div aria-hidden="true" className="h-20" />
      <InstructionProfessionalFooter profile={preview} showProfessionalData />
    </div>
  );
}

function DocumentPreview({
  preview,
}: Readonly<{ preview: InstructionProfessionalProfile }>) {
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
    return () => { document.body.style.overflow = overflow; };
  }, [expanded]);

  return (
    <>
      <div className="mt-3"><PreviewDocument preview={preview} /></div>
      <button
        className="mt-3 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-subtle)]"
        onClick={() => setExpanded(true)}
        ref={triggerRef}
        type="button"
      >
        Ampliar vista previa
      </button>
      <p className="mt-3 mb-0 text-sm leading-5 text-[var(--color-muted)]">
        Podrás decidir si incluir estos datos antes de imprimir.
      </p>
      <dialog
        aria-labelledby="expanded-preview-title"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-0 text-[var(--color-foreground)] shadow-[var(--shadow-card)] backdrop:bg-[rgb(24_51_48/45%)] open:flex open:flex-col"
        onClose={() => { setExpanded(false); triggerRef.current?.focus(); }}
        ref={dialogRef}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white p-4">
          <h2 className="m-0 text-xl" id="expanded-preview-title">Vista previa ampliada</h2>
          <button
            className="min-h-11 shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >Cerrar</button>
        </div>
        <p className="m-0 shrink-0 px-4 pt-3 text-sm leading-5 text-[var(--color-muted)]">
          Ampliación al 150 %. Deslizá para recorrer el documento.
        </p>
        <div aria-label="Documento ampliado" className="min-h-0 overflow-auto overscroll-contain p-4" role="region" tabIndex={0}>
          {expanded ? <div className="w-[32rem] [zoom:1.5]"><PreviewDocument preview={preview} /></div> : null}
        </div>
      </dialog>
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
  const [state, action, pending] = useActionState(
    saveDocumentSettingsAction,
    configurationFormState,
  );
  const { value: documents, setDraft, discardDraft, restored } = useConfigurationDraft("documents", initialDocuments, state);
  const { isDirty, markDirty, clearDirty } = useUnsavedChanges(state, restored);
  const fieldErrors = isDirty ? state.fieldErrors : {};
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const formRef = useRef<HTMLFormElement>(null);
  const [handledState, setHandledState] = useState(state);
  if (handledState !== state) {
    setHandledState(state);
    if (state.status === "error" && Object.keys(state.fieldErrors).length > 0) setMobileView("edit");
  }
  useEffect(() => {
    if (state.status === "error") formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [state]);
  const preview: InstructionProfessionalProfile = { ...profile, ...documents };

  function update(field: keyof DocumentSettings, value: string) {
    setDraft({ ...documents, [field]: value });
    markDirty();
  }

  return (
    <form ref={formRef} action={action} className={configurationCardClassName} noValidate>
      <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
        <div
          aria-label="Vista de datos del consultorio"
          className="mb-5 grid grid-cols-2 rounded-xl bg-[var(--color-background)] p-1 min-[1440px]:hidden"
          role="group"
        >
          <button
            aria-pressed={mobileView === "edit"}
            className={`min-h-11 rounded-lg border-0 px-3 text-sm font-bold transition-colors ${
              mobileView === "edit"
                ? "bg-white text-[var(--color-brand-dark)] shadow-sm"
                : "bg-transparent text-[var(--color-muted)]"
            }`}
            onClick={() => setMobileView("edit")}
            type="button"
          >
            Editar datos
          </button>
          <button
            aria-pressed={mobileView === "preview"}
            className={`min-h-11 rounded-lg border-0 px-3 text-sm font-bold transition-colors ${
              mobileView === "preview"
                ? "bg-white text-[var(--color-brand-dark)] shadow-sm"
                : "bg-transparent text-[var(--color-muted)]"
            }`}
            onClick={() => setMobileView("preview")}
            type="button"
          >
            Vista previa
          </button>
        </div>

        <div className="grid gap-7 min-[1440px]:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] min-[1440px]:items-start">
          <div className={mobileView === "edit" ? "block" : "hidden min-[1440px]:block"}>
            <h2 className="m-0 text-xl">Información reutilizable</h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
              Completá únicamente lo que quieras ofrecer al generar indicaciones.
            </p>

            <div className="mt-5 grid gap-4">
              <section className="border-t border-[var(--color-border)] pt-5">
                <h3 className="m-0 text-lg">Consultorio</h3>
                <p className="mt-1 mb-0 text-sm leading-5 text-[var(--color-muted)]">
                  Identificá el lugar donde atendés.
                </p>
                <div className="mt-4 grid gap-4">
                  <label className="text-sm font-medium">
                    Clínica o consultorio <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                    <input
                      aria-describedby={fieldErrors.clinicName ? "documents-clinic-error" : undefined}
                      aria-invalid={Boolean(fieldErrors.clinicName)}
                      autoComplete="organization"
                      className={configurationInputClassName}
                      maxLength={120}
                      name="clinicName"
                      onChange={(event) => update("clinicName", event.target.value)}
                      value={documents.clinicName ?? ""}
                    />
                    <ConfigurationFieldError id="documents-clinic-error" message={fieldErrors.clinicName} />
                  </label>

                  <label className="text-sm font-medium">
                    Dirección <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                    <input
                      aria-describedby={fieldErrors.officeAddress ? "documents-address-error" : undefined}
                      aria-invalid={Boolean(fieldErrors.officeAddress)}
                      autoComplete="street-address"
                      className={configurationInputClassName}
                      maxLength={160}
                      name="officeAddress"
                      onChange={(event) => update("officeAddress", event.target.value)}
                      value={documents.officeAddress ?? ""}
                    />
                    <ConfigurationFieldError id="documents-address-error" message={fieldErrors.officeAddress} />
                  </label>
                </div>
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <h3 className="m-0 text-lg">Contacto</h3>
                <p className="mt-1 mb-0 text-sm leading-5 text-[var(--color-muted)]">
                  Permití que el paciente pueda comunicarse con el consultorio.
                </p>
                <div className="mt-4 grid gap-4 min-[1600px]:grid-cols-2">
                  <label className="text-sm font-medium">
                    Teléfono <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                    <input
                      aria-describedby={fieldErrors.contactPhone ? "documents-phone-error" : undefined}
                      aria-invalid={Boolean(fieldErrors.contactPhone)}
                      autoComplete="tel"
                      className={configurationInputClassName}
                      maxLength={50}
                      name="contactPhone"
                      onChange={(event) => update("contactPhone", event.target.value)}
                      type="tel"
                      value={documents.contactPhone ?? ""}
                    />
                    <ConfigurationFieldError id="documents-phone-error" message={fieldErrors.contactPhone} />
                  </label>

                  <label className="text-sm font-medium">
                    Email <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                    <input
                      aria-describedby={fieldErrors.contactEmail ? "documents-email-error" : undefined}
                      aria-invalid={Boolean(fieldErrors.contactEmail)}
                      autoComplete="email"
                      className={configurationInputClassName}
                      maxLength={254}
                      name="contactEmail"
                      onChange={(event) => update("contactEmail", event.target.value)}
                      type="email"
                      value={documents.contactEmail ?? ""}
                    />
                    <ConfigurationFieldError id="documents-email-error" message={fieldErrors.contactEmail} />
                  </label>
                </div>
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <h3 className="m-0 text-lg">Nota para pacientes</h3>
                <p className="mt-1 mb-0 text-sm leading-5 text-[var(--color-muted)]">
                  Agregá una indicación general breve.
                </p>
                <label className="mt-4 block text-sm font-medium">
                  Información adicional <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                  <input
                    aria-describedby={fieldErrors.additionalInformation ? "documents-additional-error" : "documents-additional-help"}
                    aria-invalid={Boolean(fieldErrors.additionalInformation)}
                    className={configurationInputClassName}
                    maxLength={160}
                    name="additionalInformation"
                    onChange={(event) => update("additionalInformation", event.target.value)}
                    placeholder="Ej. Atención con turno previo"
                    value={documents.additionalInformation ?? ""}
                  />
                  <span className="mt-2 block text-sm font-normal text-[var(--color-muted)]" id="documents-additional-help">
                    Usá una frase breve que resulte útil para el paciente.
                  </span>
                  <ConfigurationFieldError id="documents-additional-error" message={fieldErrors.additionalInformation} />
                </label>
              </section>
            </div>
          </div>

          <aside className={`${mobileView === "preview" ? "block" : "hidden min-[1440px]:block"} rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-background)] p-4 min-[1440px]:sticky min-[1440px]:top-6`}>
            <p className="m-0 text-sm font-bold text-[var(--color-brand-dark)]">
              Vista previa
            </p>
            <DocumentPreview preview={preview} />
          </aside>
        </div>

        <ConfigurationSaveBar onDiscard={() => { discardDraft(initialDocuments); clearDirty(); }} isDirty={isDirty} label="Guardar datos" state={state} />
      </fieldset>
    </form>
  );
}
