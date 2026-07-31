"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  type InitialConfigurationFieldErrors,
  validateInitialConfiguration,
} from "./domain/initial-configuration";
import { saveInitialConfiguration } from "./repository";

export type InitialConfigurationFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: InitialConfigurationFieldErrors;
};

export const initialConfigurationFormState: InitialConfigurationFormState = {
  status: "idle",
  fieldErrors: {},
};

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

export async function saveInitialConfigurationAction(
  _previousState: InitialConfigurationFormState,
  formData: FormData,
): Promise<InitialConfigurationFormState> {
  const validation = validateInitialConfiguration({
    fullName: readText(formData, "fullName"),
    licenseNumber: readText(formData, "licenseNumber"),
    licenseJurisdiction: readText(formData, "licenseJurisdiction"),
    gridIntervalMinutes: readText(formData, "gridIntervalMinutes"),
    defaultAppointmentDurationMinutes: readText(
      formData,
      "defaultAppointmentDurationMinutes",
    ),
    defaultCleanupMinutes: readText(formData, "defaultCleanupMinutes"),
    availability: readAvailability(formData),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: validation.fieldErrors,
    };
  }

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
    await saveInitialConfiguration(validation.data);
  } catch {
    return {
      status: "error",
      message:
        "No pudimos guardar la configuración. Intentá nuevamente en unos minutos.",
      fieldErrors: {},
    };
  }

  revalidatePath("/app", "layout");
  redirect("/app");
}
