"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { validateProfileAvatarFile } from "./domain/profile-avatar";
import { deleteProfileAvatar, replaceProfileAvatar } from "./repository";

export type ProfileAvatarFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const profileAvatarFormState: ProfileAvatarFormState = {
  status: "idle",
  message: "",
};

async function readAuthenticatedUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;

  return typeof subject === "string" && subject ? subject : null;
}

function revalidateAvatarViews() {
  revalidatePath("/app", "layout");
  revalidatePath("/app/configuracion");
}

export async function uploadProfileAvatarAction(
  _previousState: ProfileAvatarFormState,
  formData: FormData,
): Promise<ProfileAvatarFormState> {
  void _previousState;
  const validation = await validateProfileAvatarFile(formData.get("avatar"));

  if (!validation.success) {
    return { status: "error", message: validation.message };
  }

  const userId = await readAuthenticatedUserId();

  if (!userId) {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    };
  }

  try {
    await replaceProfileAvatar({
      extension: validation.extension,
      file: validation.file,
      userId,
    });
  } catch {
    return {
      status: "error",
      message: "No pudimos guardar la foto. Intentá nuevamente.",
    };
  }

  revalidateAvatarViews();
  return { status: "success", message: "Foto de perfil actualizada." };
}

export async function removeProfileAvatarAction(
  _previousState: ProfileAvatarFormState,
  _formData: FormData,
): Promise<ProfileAvatarFormState> {
  void _previousState;
  void _formData;
  const userId = await readAuthenticatedUserId();

  if (!userId) {
    return {
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    };
  }

  try {
    await deleteProfileAvatar(userId);
  } catch {
    return {
      status: "error",
      message: "No pudimos quitar la foto. Intentá nuevamente.",
    };
  }

  revalidateAvatarViews();
  return { status: "success", message: "Foto de perfil eliminada." };
}
