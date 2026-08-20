"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import { buildAgendaWeek } from "@/modules/agenda/domain/weekly-schedule";

import {
  type AppointmentFormState,
  isAppointmentId,
  validateAppointment,
} from "./domain/appointment";
import { isAppointmentWithinWeeklyAvailability } from "./domain/availability";
import {
  cancelAppointment,
  createAppointment,
  getPendingAppointmentById,
  updateAppointment,
} from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function createAppointmentAction(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const values = {
    patientId: readText(formData, "patientId"),
    startsAt: readText(formData, "startsAt"),
    durationMinutes: readText(formData, "durationMinutes"),
    cleanupMinutes: readText(formData, "cleanupMinutes"),
    specialty: readText(formData, "specialty"),
  };
  const validation = validateAppointment(values);

  if (!validation.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: validation.fieldErrors,
      values,
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
      values,
    };
  }

  try {
    const configuration = await getInitialConfiguration();

    if (
      !configuration ||
      !isAppointmentWithinWeeklyAvailability(
        validation.data,
        configuration.availability,
        configuration.gridIntervalMinutes,
      )
    ) {
      return {
        status: "error",
        message:
          "Ese horario no pertenece a la disponibilidad configurada. Elegí otro.",
        fieldErrors: { startsAt: "Elegí uno de los horarios disponibles." },
        values,
      };
    }

    const result = await createAppointment(validation.data, userId);

    if (result === "patient_unavailable") {
      return {
        status: "error",
        message: "El paciente ya no está disponible para asignar un turno.",
        fieldErrors: { patientId: "Elegí otro paciente activo." },
        values,
      };
    }

    if (result === "overlap") {
      return {
        status: "error",
        message:
          "Ese horario se superpone con otro turno. Elegí un horario disponible.",
        fieldErrors: { startsAt: "El horario seleccionado no está disponible." },
        values,
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "No pudimos guardar el turno. Intentá nuevamente en unos minutos.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/app/agenda");
  const weekStartDate = buildAgendaWeek(
    readText(formData, "weekStartDate"),
  ).startDate;
  redirect(`/app/agenda?semana=${weekStartDate}&creado=1`);
}

export async function updateAppointmentAction(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const appointmentId = readText(formData, "appointmentId");
  const weekStartDate = buildAgendaWeek(
    readText(formData, "weekStartDate"),
  ).startDate;

  if (!isAppointmentId(appointmentId)) {
    return {
      status: "error",
      message: "El turno ya no está disponible para modificar.",
      fieldErrors: {},
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
      fieldErrors: {},
    };
  }

  try {
    const currentAppointment = await getPendingAppointmentById(appointmentId);

    if (!currentAppointment) {
      return {
        status: "error",
        message: "El turno ya no está disponible para modificar.",
        fieldErrors: {},
      };
    }

    const values = {
      patientId: currentAppointment.patientId,
      startsAt: readText(formData, "startsAt"),
      durationMinutes: readText(formData, "durationMinutes"),
      cleanupMinutes: readText(formData, "cleanupMinutes"),
      specialty: readText(formData, "specialty"),
    };
    const validation = validateAppointment(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Revisá los campos marcados.",
        fieldErrors: validation.fieldErrors,
        values,
      };
    }

    const configuration = await getInitialConfiguration();

    if (
      !configuration ||
      !isAppointmentWithinWeeklyAvailability(
        validation.data,
        configuration.availability,
        configuration.gridIntervalMinutes,
      )
    ) {
      return {
        status: "error",
        message: "Ese horario no pertenece a la disponibilidad configurada.",
        fieldErrors: { startsAt: "Elegí uno de los horarios disponibles." },
        values,
      };
    }

    const result = await updateAppointment(appointmentId, validation.data);

    if (result === "overlap") {
      return {
        status: "error",
        message: "Ese horario se superpone con otro turno.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
        values,
      };
    }

    if (result === "unavailable") {
      return {
        status: "error",
        message: "El turno ya no está disponible para modificar.",
        fieldErrors: {},
        values,
      };
    }
  } catch {
    return {
      status: "error",
      message: "No pudimos actualizar el turno. Intentá nuevamente.",
      fieldErrors: {},
    };
  }

  revalidatePath("/app/agenda");
  redirect(`/app/agenda?semana=${weekStartDate}&actualizado=1`);
}

export async function cancelAppointmentAction(formData: FormData) {
  const appointmentId = readText(formData, "appointmentId");
  const weekStartDate = buildAgendaWeek(
    readText(formData, "weekStartDate"),
  ).startDate;

  if (!isAppointmentId(appointmentId)) {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  let result: Awaited<ReturnType<typeof cancelAppointment>>;

  try {
    result = await cancelAppointment(appointmentId);
  } catch {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  if (result === "unavailable") {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  revalidatePath("/app/agenda");
  redirect(`/app/agenda?semana=${weekStartDate}&cancelado=1`);
}
