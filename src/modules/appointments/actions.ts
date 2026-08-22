"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { listExceptionalBlocks } from "@/modules/exceptional-blocks/repository";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import { buildAgendaWeek } from "@/modules/agenda/domain/weekly-schedule";

import {
  type AppointmentFormState,
  type AppointmentRescheduleState,
  isAppointmentClosureStatus,
  isAppointmentId,
  validateAppointment,
} from "./domain/appointment";
import {
  doesAppointmentOverlapExceptionalBlock,
  isAppointmentWithinWeeklyAvailability,
} from "./domain/availability";
import {
  cancelAppointment,
  closeAppointment,
  confirmAppointment,
  createAppointment,
  getConfirmedAppointmentById,
  getPendingAppointmentById,
  rescheduleAppointment,
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
    const [configuration, exceptionalBlocks] = await Promise.all([
      getInitialConfiguration(),
      listExceptionalBlocks(),
    ]);

    if (
      doesAppointmentOverlapExceptionalBlock(
        validation.data,
        exceptionalBlocks,
      )
    ) {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
        values,
      };
    }

    if (
      !configuration ||
      !isAppointmentWithinWeeklyAvailability(
        validation.data,
        configuration.availability,
        configuration.gridIntervalMinutes,
        exceptionalBlocks,
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

    if (result === "blocked") {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
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

    const [configuration, exceptionalBlocks] = await Promise.all([
      getInitialConfiguration(),
      listExceptionalBlocks(),
    ]);

    if (
      doesAppointmentOverlapExceptionalBlock(
        validation.data,
        exceptionalBlocks,
      )
    ) {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
        values,
      };
    }

    if (
      !configuration ||
      !isAppointmentWithinWeeklyAvailability(
        validation.data,
        configuration.availability,
        configuration.gridIntervalMinutes,
        exceptionalBlocks,
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

    if (result === "blocked") {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
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

export async function rescheduleAppointmentAction(
  _previousState: AppointmentRescheduleState,
  formData: FormData,
): Promise<AppointmentRescheduleState> {
  const appointmentId = readText(formData, "appointmentId");
  const values = { startsAt: readText(formData, "startsAt") };

  if (!isAppointmentId(appointmentId)) {
    return {
      status: "error",
      message: "El turno ya no está disponible para reprogramar.",
      fieldErrors: {},
      values,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
      fieldErrors: {},
      values,
    };
  }

  try {
    const currentAppointment =
      await getConfirmedAppointmentById(appointmentId);

    if (!currentAppointment) {
      return {
        status: "error",
        message: "El turno ya no está disponible para reprogramar.",
        fieldErrors: {},
        values,
      };
    }

    const validation = validateAppointment({
      patientId: currentAppointment.patientId,
      startsAt: values.startsAt,
      durationMinutes: currentAppointment.durationMinutes,
      cleanupMinutes: currentAppointment.cleanupMinutes,
      specialty: currentAppointment.specialty,
    });

    if (!validation.success) {
      return {
        status: "error",
        message: "Elegí una nueva fecha y hora válidas.",
        fieldErrors: { startsAt: validation.fieldErrors.startsAt },
        values,
      };
    }

    if (
      new Date(validation.data.startsAt).getTime() ===
      new Date(currentAppointment.startsAt).getTime()
    ) {
      return {
        status: "error",
        message: "Elegí un horario diferente del turno actual.",
        fieldErrors: { startsAt: "Elegí otro horario." },
        values,
      };
    }

    const [configuration, exceptionalBlocks] = await Promise.all([
      getInitialConfiguration(),
      listExceptionalBlocks(),
    ]);

    if (
      doesAppointmentOverlapExceptionalBlock(
        validation.data,
        exceptionalBlocks,
      )
    ) {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
        values,
      };
    }

    if (
      !configuration ||
      !isAppointmentWithinWeeklyAvailability(
        validation.data,
        configuration.availability,
        configuration.gridIntervalMinutes,
        exceptionalBlocks,
      )
    ) {
      return {
        status: "error",
        message: "Ese horario no pertenece a la disponibilidad configurada.",
        fieldErrors: { startsAt: "Elegí uno de los horarios configurados." },
        values,
      };
    }

    const result = await rescheduleAppointment(
      appointmentId,
      validation.data.startsAt,
      readText(formData, "overlapConfirmed") === "true",
    );

    if (result === "overlap") {
      return {
        status: "overlap",
        message:
          "Ese horario se superpone con otro turno. Confirmá la superposición para continuar.",
        fieldErrors: {},
        values,
      };
    }

    if (result === "blocked") {
      return {
        status: "error",
        message: "Ese período está marcado como no disponible.",
        fieldErrors: { startsAt: "Elegí otro horario disponible." },
        values,
      };
    }

    if (result === "unavailable") {
      return {
        status: "error",
        message: "El turno ya no está disponible para reprogramar.",
        fieldErrors: {},
        values,
      };
    }
  } catch {
    return {
      status: "error",
      message: "No pudimos reprogramar el turno. Intentá nuevamente.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/app/agenda");
  const newWeekStart = buildAgendaWeek(values.startsAt.slice(0, 10)).startDate;
  redirect(`/app/agenda?semana=${newWeekStart}&reprogramado=1`);
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

export async function confirmAppointmentAction(formData: FormData) {
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

  let result: Awaited<ReturnType<typeof confirmAppointment>>;

  try {
    result = await confirmAppointment(appointmentId);
  } catch {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  if (result === "unavailable") {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  revalidatePath("/app/agenda");
  redirect(`/app/agenda?semana=${weekStartDate}&confirmado=1`);
}

export async function closeAppointmentAction(formData: FormData) {
  const appointmentId = readText(formData, "appointmentId");
  const closureStatus = readText(formData, "closureStatus");
  const weekStartDate = buildAgendaWeek(
    readText(formData, "weekStartDate"),
  ).startDate;

  if (
    !isAppointmentId(appointmentId) ||
    !isAppointmentClosureStatus(closureStatus)
  ) {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  let result: Awaited<ReturnType<typeof closeAppointment>>;

  try {
    result = await closeAppointment(appointmentId, closureStatus);
  } catch {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  if (result === "unavailable") {
    redirect(`/app/agenda?semana=${weekStartDate}&errorGestion=1`);
  }

  revalidatePath("/app/agenda");
  redirect(
    `/app/agenda?semana=${weekStartDate}&cierre=${closureStatus}`,
  );
}
