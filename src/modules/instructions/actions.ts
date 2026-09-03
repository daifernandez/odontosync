"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  buildInstructionTemplateCopyTitle,
  type InstructionTemplateFormState,
  type InstructionTemplateFormValues,
  type InstructionTemplateManagementState,
  validateInstructionTemplate,
  validateInstructionTemplateId,
} from "./domain/instruction-template";
import {
  createInstructionTemplate,
  deleteInstructionTemplate,
  getInstructionTemplate,
  updateInstructionTemplate,
} from "./repository";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function readValues(formData: FormData): InstructionTemplateFormValues {
  return {
    title: readText(formData, "title"),
    specialty: readText(formData, "specialty"),
    introduction: readText(formData, "introduction"),
    listStyle: readText(formData, "listStyle"),
    points: formData
      .getAll("points")
      .filter((point): point is string => typeof point === "string"),
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return typeof userId === "string" ? userId : null;
}

function sessionError(
  values: InstructionTemplateFormValues,
): InstructionTemplateFormState {
  return {
    status: "error",
    message: "Tu sesión venció. Volvé a ingresar para continuar.",
    fieldErrors: {},
    values,
  };
}

function writeError(
  values: InstructionTemplateFormValues,
): InstructionTemplateFormState {
  return {
    status: "error",
    message: "No pudimos guardar los cambios. Volvé a intentarlo.",
    fieldErrors: {},
    values,
  };
}

function managementError(
  action: "duplicar" | "eliminar",
): InstructionTemplateManagementState {
  return {
    status: "error",
    message: `No pudimos ${action} la plantilla. Volvé a intentarlo.`,
  };
}

function managementSessionError(): InstructionTemplateManagementState {
  return {
    status: "error",
    message: "Tu sesión venció. Volvé a ingresar para continuar.",
  };
}

export async function createInstructionTemplateAction(
  _previousState: InstructionTemplateFormState,
  formData: FormData,
): Promise<InstructionTemplateFormState> {
  const values = readValues(formData);
  const validation = validateInstructionTemplate(values);

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
    return sessionError(values);
  }

  let templateId: string;

  try {
    templateId = await createInstructionTemplate(validation.data, userId);
  } catch {
    return writeError(values);
  }

  revalidatePath("/app/indicaciones");
  redirect(`/app/indicaciones/${templateId}/imprimir?creada=1`);
}

export async function updateInstructionTemplateAction(
  templateIdValue: string,
  _previousState: InstructionTemplateFormState,
  formData: FormData,
): Promise<InstructionTemplateFormState> {
  const values = readValues(formData);
  const templateId = validateInstructionTemplateId(templateIdValue);

  if (!templateId) {
    return writeError(values);
  }

  const validation = validateInstructionTemplate(values);

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
    return sessionError(values);
  }

  try {
    if (!(await updateInstructionTemplate(templateId, validation.data, userId))) {
      return writeError(values);
    }
  } catch {
    return writeError(values);
  }

  revalidatePath("/app/indicaciones");
  revalidatePath(`/app/indicaciones/${templateId}/imprimir`);
  redirect(`/app/indicaciones/${templateId}/imprimir?actualizada=1`);
}

export async function duplicateInstructionTemplateAction(
  templateIdValue: string,
  _previousState: InstructionTemplateManagementState,
): Promise<InstructionTemplateManagementState> {
  void _previousState;
  const templateId = validateInstructionTemplateId(templateIdValue);

  if (!templateId) {
    return managementError("duplicar");
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return managementSessionError();
  }

  let copyId: string;

  try {
    const template = await getInstructionTemplate(templateId, userId);

    if (!template) {
      return managementError("duplicar");
    }

    copyId = await createInstructionTemplate(
      {
        title: buildInstructionTemplateCopyTitle(template.title),
        specialty: template.specialty,
        introduction: template.introduction,
        listStyle: template.listStyle,
        points: template.points,
      },
      userId,
    );
  } catch {
    return managementError("duplicar");
  }

  revalidatePath("/app/indicaciones");
  redirect(`/app/indicaciones/${copyId}/editar?duplicada=1`);
}

export async function deleteInstructionTemplateAction(
  templateIdValue: string,
  _previousState: InstructionTemplateManagementState,
): Promise<InstructionTemplateManagementState> {
  void _previousState;
  const templateId = validateInstructionTemplateId(templateIdValue);

  if (!templateId) {
    return managementError("eliminar");
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return managementSessionError();
  }

  try {
    if (!(await deleteInstructionTemplate(templateId, userId))) {
      return managementError("eliminar");
    }
  } catch {
    return managementError("eliminar");
  }

  revalidatePath("/app/indicaciones");

  return {
    status: "success",
    message: "La plantilla se eliminó correctamente.",
  };
}
