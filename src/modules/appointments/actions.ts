"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  type AppointmentFormState,
  validateAppointment,
} from "./domain/appointment";
import { createAppointment } from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function createAppointmentAction(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const validation = validateAppointment({
    patientId: readText(formData, "patientId"),
    startsAt: readText(formData, "startsAt"),
    durationMinutes: readText(formData, "durationMinutes"),
    cleanupMinutes: readText(formData, "cleanupMinutes"),
    specialty: readText(formData, "specialty"),
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
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
      fieldErrors: {},
    };
  }

  try {
    const result = await createAppointment(validation.data, userId);

    if (result === "patient_unavailable") {
      return {
        status: "error",
        message: "El paciente ya no está disponible para asignar un turno.",
        fieldErrors: { patientId: "Elegí otro paciente activo." },
      };
    }

    if (result === "overlap") {
      return {
        status: "error",
        message:
          "Ese horario se superpone con otro turno. Elegí un horario disponible.",
        fieldErrors: { startsAt: "El horario seleccionado no está disponible." },
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "No pudimos guardar el turno. Intentá nuevamente en unos minutos.",
      fieldErrors: {},
    };
  }

  revalidatePath("/app/agenda");
  redirect("/app/agenda?creado=1");
}
