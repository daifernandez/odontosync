"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  type PatientFormState,
  validatePatient,
} from "./domain/patient";
import { createPatient } from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function createPatientAction(
  _previousState: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const validation = validatePatient({
    firstName: readText(formData, "firstName"),
    lastName: readText(formData, "lastName"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
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
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para guardar el paciente.",
      fieldErrors: {},
    };
  }

  try {
    await createPatient(validation.data, userId);
  } catch {
    return {
      status: "error",
      message:
        "No pudimos guardar el paciente. Intentá nuevamente en unos minutos.",
      fieldErrors: {},
    };
  }

  revalidatePath("/app/pacientes");
  redirect("/app/pacientes?creado=1");
}
