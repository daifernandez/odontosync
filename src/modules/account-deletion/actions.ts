"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { deleteAuthUser, removeAccountAvatars } from "./repository";

export type AccountDeletionState = { status: "idle" | "error"; message: string };

export async function deleteAccountAction(
  _previousState: AccountDeletionState,
  formData: FormData,
): Promise<AccountDeletionState> {
  void _previousState;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user?.email) {
    return { status: "error", message: "Tu sesión venció. Volvé a ingresar para continuar." };
  }

  if (user.email.trim().toLowerCase() === "evaluacion@odontosync.test") {
    return { status: "error", message: "La cuenta de evaluación está protegida y no se puede eliminar." };
  }

  const enteredEmail = formData.get("email");
  if (
    typeof enteredEmail !== "string" ||
    enteredEmail.trim().toLowerCase() !== user.email.toLowerCase() ||
    formData.get("accepted") !== "on"
  ) {
    return { status: "error", message: "Escribí el correo de tu cuenta y aceptá la eliminación permanente." };
  }

  try {
    await removeAccountAvatars(user.id);
    await deleteAuthUser(user.id);
  } catch {
    return { status: "error", message: "No pudimos eliminar tu cuenta. Intentá nuevamente más tarde." };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/ingresar?cuenta=eliminada");
}
