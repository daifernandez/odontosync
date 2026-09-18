"use client";

import { useActionState } from "react";

import { ConfigurationFieldError, configurationInputClassName } from "@/components/configuration-form-ui";
import { ConfigurationSaveBar } from "@/components/configuration-save-bar";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import { saveProfileSettingsAction } from "@/modules/initial-configuration/actions";
import {
  configurationFormState,
  type ProfileSettings,
} from "@/modules/initial-configuration/domain/initial-configuration";

export function ProfileSettingsForm({
  initialProfile,
}: Readonly<{ initialProfile: ProfileSettings }>) {
  const [state, action] = useActionState(
    saveProfileSettingsAction,
    configurationFormState,
  );
  const { isDirty, markDirty } = useUnsavedChanges(state);

  return (
    <form action={action} noValidate onChange={markDirty}>
      <div className="border-t border-[var(--color-border)] pt-6">
        <h2 className="m-0 text-xl">Información profesional</h2>
        <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
          La matrícula es opcional y no implica una verificación profesional.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold md:col-span-2">
            Nombre completo
            <input
              aria-describedby={state.fieldErrors.fullName ? "profile-full-name-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.fullName)}
              autoComplete="name"
              className={configurationInputClassName}
              defaultValue={initialProfile.fullName}
              maxLength={120}
              name="fullName"
              type="text"
            />
            <ConfigurationFieldError id="profile-full-name-error" message={state.fieldErrors.fullName} />
          </label>

          <label className="text-sm font-semibold">
            Matrícula <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
            <input
              aria-describedby={state.fieldErrors.licenseNumber ? "profile-license-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.licenseNumber)}
              className={configurationInputClassName}
              defaultValue={initialProfile.licenseNumber ?? ""}
              maxLength={50}
              name="licenseNumber"
              type="text"
            />
            <ConfigurationFieldError id="profile-license-error" message={state.fieldErrors.licenseNumber} />
          </label>

          <label className="text-sm font-semibold">
            Jurisdicción <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
            <input
              aria-describedby={state.fieldErrors.licenseJurisdiction ? "profile-jurisdiction-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.licenseJurisdiction)}
              className={configurationInputClassName}
              defaultValue={initialProfile.licenseJurisdiction ?? ""}
              maxLength={100}
              name="licenseJurisdiction"
              placeholder="Ej. Provincia de Buenos Aires"
              type="text"
            />
            <ConfigurationFieldError id="profile-jurisdiction-error" message={state.fieldErrors.licenseJurisdiction} />
          </label>
        </div>
      </div>

      <ConfigurationSaveBar isDirty={isDirty} label="Guardar perfil" state={state} />
    </form>
  );
}
