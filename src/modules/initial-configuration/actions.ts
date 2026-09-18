"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  type ConfigurationFormState,
  type InitialConfiguration,
  validateAgendaPreferences,
  validateAvailability,
  validateDocumentSettings,
  validateProfileSettings,
} from "./domain/initial-configuration";
import {
  getInitialConfiguration,
  saveInitialConfiguration,
} from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function readAvailability(formData: FormData) {
  try {
    return JSON.parse(readText(formData, "availability"));
  } catch {
    return null;
  }
}

function validationError(
  fieldErrors: ConfigurationFormState["fieldErrors"],
): ConfigurationFormState {
  return {
    status: "error",
    message: "Revisá los campos marcados.",
    fieldErrors,
  };
}

async function saveConfigurationSection(
  update: (current: InitialConfiguration) => InitialConfiguration,
): Promise<ConfigurationFormState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para guardar los cambios.",
      fieldErrors: {},
    };
  }

  try {
    const current = await getInitialConfiguration();

    if (!current) {
      throw new Error("Missing initial configuration");
    }

    await saveInitialConfiguration(update(current));
  } catch {
    return {
      status: "error",
      message:
        "No pudimos guardar los cambios. Intentá nuevamente en unos minutos.",
      fieldErrors: {},
    };
  }

  revalidatePath("/app", "layout");

  return {
    status: "success",
    message: "Cambios guardados.",
    fieldErrors: {},
  };
}

export async function saveProfileSettingsAction(
  _previousState: ConfigurationFormState,
  formData: FormData,
): Promise<ConfigurationFormState> {
  const validation = validateProfileSettings({
    fullName: readText(formData, "fullName"),
    licenseNumber: readText(formData, "licenseNumber"),
    licenseJurisdiction: readText(formData, "licenseJurisdiction"),
  });

  if (!validation.success) {
    return validationError(validation.fieldErrors);
  }

  return saveConfigurationSection((current) => ({
    ...current,
    ...validation.data,
  }));
}

export async function saveDocumentSettingsAction(
  _previousState: ConfigurationFormState,
  formData: FormData,
): Promise<ConfigurationFormState> {
  const validation = validateDocumentSettings({
    clinicName: readText(formData, "clinicName"),
    officeAddress: readText(formData, "officeAddress"),
    contactPhone: readText(formData, "contactPhone"),
    contactEmail: readText(formData, "contactEmail"),
    additionalInformation: readText(formData, "additionalInformation"),
  });

  if (!validation.success) {
    return validationError(validation.fieldErrors);
  }

  return saveConfigurationSection((current) => ({
    ...current,
    ...validation.data,
  }));
}

export async function saveAgendaPreferencesAction(
  _previousState: ConfigurationFormState,
  formData: FormData,
): Promise<ConfigurationFormState> {
  const validation = validateAgendaPreferences({
    gridIntervalMinutes: readText(formData, "gridIntervalMinutes"),
    defaultAppointmentDurationMinutes: readText(
      formData,
      "defaultAppointmentDurationMinutes",
    ),
    defaultCleanupMinutes: readText(formData, "defaultCleanupMinutes"),
  });

  if (!validation.success) {
    return validationError(validation.fieldErrors);
  }

  return saveConfigurationSection((current) => ({
    ...current,
    ...validation.data,
  }));
}

export async function saveAvailabilityAction(
  _previousState: ConfigurationFormState,
  formData: FormData,
): Promise<ConfigurationFormState> {
  const validation = validateAvailability(readAvailability(formData));

  if (!validation.success) {
    return validationError(validation.fieldErrors);
  }

  return saveConfigurationSection((current) => ({
    ...current,
    availability: validation.data,
  }));
}
