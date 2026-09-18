"use client";

import { useActionState } from "react";

import { ConfigurationFieldError, configurationCardClassName, configurationInputClassName } from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import { useConfigurationDraft } from "@/components/configuration-drafts";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveProfileSettingsAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  type ProfileSettings,
} from "@/modules/initial-configuration/domain/initial-configuration";

export function ProfileSettingsForm({
  initialProfile,
}: Readonly<{ initialProfile: ProfileSettings }>) {
  const [state, action, pending] = useActionState(
    saveProfileSettingsAction,
    configurationFormState,
  );
  const { value: profile, setDraft, discardDraft, restored } = useConfigurationDraft("profile", initialProfile, state);
  const { isDirty, markDirty, clearDirty } = useUnsavedChanges(state, restored);
  const fieldErrors = isDirty ? state.fieldErrors : {};

  return (
    <form action={action} className={configurationCardClassName} noValidate onChange={markDirty}>
      <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
        <div>
          <h2 className="m-0 text-xl">Información profesional</h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
            Estos datos identifican al profesional dentro de OdontoSync y en los documentos.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="text-sm font-medium">
              Nombre completo
              <input
                aria-describedby={fieldErrors.fullName ? "profile-full-name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.fullName)}
                autoComplete="name"
                className={configurationInputClassName}
                value={profile.fullName}
                onChange={(event) => setDraft({ ...profile, fullName: event.target.value })}
                maxLength={120}
                name="fullName"
                type="text"
              />
              <ConfigurationFieldError id="profile-full-name-error" message={fieldErrors.fullName} />
            </label>

            <fieldset className="m-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
              <legend className="px-1 text-sm font-bold text-[var(--color-brand-dark)]">
                Registro profesional <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
              </legend>
              <p className="mt-0 mb-4 text-sm leading-5 text-[var(--color-muted)]">
                Se mostrará como referencia y no implica una verificación profesional.
              </p>
              <div className="grid gap-4 min-[1440px]:grid-cols-2">
                <label className="text-sm font-medium">
                  Matrícula
                  <input
                    aria-describedby={fieldErrors.licenseNumber ? "profile-license-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.licenseNumber)}
                    className={configurationInputClassName}
                    value={profile.licenseNumber ?? ""}
                    onChange={(event) => setDraft({ ...profile, licenseNumber: event.target.value })}
                    maxLength={50}
                    name="licenseNumber"
                    type="text"
                  />
                  <ConfigurationFieldError id="profile-license-error" message={fieldErrors.licenseNumber} />
                </label>

                <label className="text-sm font-medium">
                  Jurisdicción
                  <input
                    aria-describedby={fieldErrors.licenseJurisdiction ? "profile-jurisdiction-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.licenseJurisdiction)}
                    className={configurationInputClassName}
                    value={profile.licenseJurisdiction ?? ""}
                    onChange={(event) => setDraft({ ...profile, licenseJurisdiction: event.target.value })}
                    maxLength={100}
                    name="licenseJurisdiction"
                    placeholder="Ej. Provincia de Buenos Aires"
                    type="text"
                  />
                  <ConfigurationFieldError id="profile-jurisdiction-error" message={fieldErrors.licenseJurisdiction} />
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        <ConfigurationSaveBar onDiscard={() => { discardDraft(initialProfile); clearDirty(); }} isDirty={isDirty} label="Guardar perfil" state={state} />
      </fieldset>
    </form>
  );
}
