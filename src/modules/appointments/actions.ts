"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  buildAgendaPath,
  buildAgendaWeek,
  type AgendaView,
} from "@/modules/agenda/domain/weekly-schedule";
import { listExceptionalBlocks } from "@/modules/exceptional-blocks/repository";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

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

function buildActionAgendaPath(
  formData: FormData,
  params: Record<string, string>,
  dailyDate?: string,
  followTargetWeek = false,
) {
  const view: AgendaView =
    readText(formData, "agendaView") === "day" ? "day" : "week";
  const selectedDate =
    view === "day" ? dailyDate ?? readText(formData, "agendaDate") : undefined;
  const weekStartDate = buildAgendaWeek(
    followTargetWeek || view === "day"
      ? dailyDate ?? selectedDate
      : readText(formData, "weekStartDate"),
  ).startDate;

  return buildAgendaPath({ weekStartDate, view, selectedDate, params });
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
  redirect(
    buildActionAgendaPath(
      formData,
      { creado: "1" },
      values.startsAt.slice(0, 10),
    ),
  );
}

export async function updateAppointmentAction(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const appointmentId = readText(formData, "appointmentId");

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
  redirect(
    buildActionAgendaPath(
      formData,
      { actualizado: "1" },
      readText(formData, "startsAt").slice(0, 10),
    ),
  );
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
  redirect(
    buildActionAgendaPath(
      formData,
      { reprogramado: "1" },
      values.startsAt.slice(0, 10),
      true,
    ),
  );
}

export async function cancelAppointmentAction(formData: FormData) {
  const appointmentId = readText(formData, "appointmentId");

  if (!isAppointmentId(appointmentId)) {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  let result: Awaited<ReturnType<typeof cancelAppointment>>;

  try {
    result = await cancelAppointment(appointmentId);
  } catch {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  if (result === "unavailable") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  revalidatePath("/app/agenda");
  redirect(buildActionAgendaPath(formData, { cancelado: "1" }));
}

export async function confirmAppointmentAction(formData: FormData) {
  const appointmentId = readText(formData, "appointmentId");

  if (!isAppointmentId(appointmentId)) {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  let result: Awaited<ReturnType<typeof confirmAppointment>>;

  try {
    result = await confirmAppointment(appointmentId);
  } catch {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  if (result === "unavailable") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  revalidatePath("/app/agenda");
  redirect(buildActionAgendaPath(formData, { confirmado: "1" }));
}

export async function closeAppointmentAction(formData: FormData) {
  const appointmentId = readText(formData, "appointmentId");
  const closureStatus = readText(formData, "closureStatus");

  if (
    !isAppointmentId(appointmentId) ||
    !isAppointmentClosureStatus(closureStatus)
  ) {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (typeof data?.claims?.sub !== "string") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  let result: Awaited<ReturnType<typeof closeAppointment>>;

  try {
    result = await closeAppointment(appointmentId, closureStatus);
  } catch {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  if (result === "unavailable") {
    redirect(buildActionAgendaPath(formData, { errorGestion: "1" }));
  }

  revalidatePath("/app/agenda");
  revalidatePath("/app/pacientes", "layout");
  redirect(buildActionAgendaPath(formData, { cierre: closureStatus }));
}
