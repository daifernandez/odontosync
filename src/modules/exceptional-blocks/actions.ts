"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  buildAgendaPath,
  buildAgendaWeek,
  type AgendaView,
} from "@/modules/agenda/domain/weekly-schedule";

import {
  type ExceptionalBlockFormState,
  validateExceptionalBlock,
  validateExceptionalBlockId,
} from "./domain/exceptional-block";
import {
  createExceptionalBlock,
  deleteExceptionalBlock,
} from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function buildActionAgendaPath(
  formData: FormData,
  params: Record<string, string>,
) {
  const view: AgendaView =
    readText(formData, "agendaView") === "day" ? "day" : "week";
  const selectedDate =
    view === "day" ? readText(formData, "agendaDate") : undefined;
  const weekStartDate = buildAgendaWeek(
    selectedDate || readText(formData, "weekStartDate"),
  ).startDate;

  return buildAgendaPath({ weekStartDate, view, selectedDate, params });
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return typeof userId === "string" ? userId : null;
}

export async function createExceptionalBlockAction(
  _previousState: ExceptionalBlockFormState,
  formData: FormData,
): Promise<ExceptionalBlockFormState> {
  const values = {
    startsAt: readText(formData, "startsAt"),
    endsAt: readText(formData, "endsAt"),
    category: readText(formData, "category"),
  };
  const validation = validateExceptionalBlock(values);

  if (!validation.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: validation.fieldErrors,
      values,
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
      fieldErrors: {},
      values,
    };
  }

  try {
    const result = await createExceptionalBlock(validation.data, userId);

    if (result === "conflict") {
      return {
        status: "error",
        message:
          "Ese período se superpone con otro bloqueo o con un turno activo.",
        fieldErrors: {},
        values,
      };
    }

    if (result === "unavailable") {
      return {
        status: "error",
        message: "Ese período ya no está disponible para bloquear.",
        fieldErrors: {},
        values,
      };
    }
  } catch {
    return {
      status: "error",
      message: "No pudimos guardar el bloqueo. Intentá nuevamente.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/app/agenda");
  redirect(
    buildActionAgendaPath(formData, {
      bloqueos: "1",
      bloqueoCreado: "1",
    }),
  );
}

export async function deleteExceptionalBlockAction(formData: FormData) {
  const blockId = validateExceptionalBlockId(readText(formData, "blockId"));
  const errorPath = buildActionAgendaPath(formData, {
    bloqueos: "1",
    bloqueoError: "1",
  });

  if (!blockId) {
    redirect(errorPath);
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(errorPath);
  }

  let deleted: boolean;

  try {
    deleted = await deleteExceptionalBlock(blockId, userId);
  } catch {
    redirect(errorPath);
  }

  if (!deleted) {
    redirect(errorPath);
  }

  revalidatePath("/app/agenda");
  redirect(
    buildActionAgendaPath(formData, {
      bloqueos: "1",
      bloqueoEliminado: "1",
    }),
  );
}
