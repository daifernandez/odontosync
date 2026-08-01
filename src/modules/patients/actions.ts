"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  type PatientFormState,
  validatePatientId,
  validatePatient,
} from "./domain/patient";
import {
  createPatient,
  setPatientActive,
  updatePatient,
} from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return typeof userId === "string" ? userId : null;
}

function sessionError(): PatientFormState {
  return {
    status: "error",
    message: "Tu sesión venció. Volvé a ingresar para continuar.",
    fieldErrors: {},
  };
}

function patientWriteError(): PatientFormState {
  return {
    status: "error",
    message:
      "No pudimos guardar los cambios. Verificá el paciente e intentá nuevamente.",
    fieldErrors: {},
  };
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

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return sessionError();
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

export async function updatePatientAction(
  patientIdValue: string,
  _previousState: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const patientId = validatePatientId(patientIdValue);

  if (!patientId) {
    return patientWriteError();
  }

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

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return sessionError();
  }

  try {
    if (!(await updatePatient(patientId, validation.data, userId))) {
      return patientWriteError();
    }
  } catch {
    return patientWriteError();
  }

  revalidatePath("/app/pacientes");
  revalidatePath(`/app/pacientes/${patientId}/editar`);
  redirect("/app/pacientes?actualizado=1");
}

export async function setPatientActiveAction(
  patientIdValue: string,
  isActive: boolean,
  _previousState: PatientFormState,
): Promise<PatientFormState> {
  void _previousState;
  const patientId = validatePatientId(patientIdValue);

  if (!patientId) {
    return patientWriteError();
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return sessionError();
  }

  try {
    if (!(await setPatientActive(patientId, isActive, userId))) {
      return patientWriteError();
    }
  } catch {
    return patientWriteError();
  }

  revalidatePath("/app/pacientes");
  revalidatePath(`/app/pacientes/${patientId}/editar`);
  redirect(
    isActive
      ? "/app/pacientes?reactivado=1"
      : "/app/pacientes?estado=inactivos&desactivado=1",
  );
}
