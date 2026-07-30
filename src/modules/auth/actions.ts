"use server";

import { redirect } from "next/navigation";

import { getAuthCallbackUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

import {
  type AuthFormState,
  validateLogin,
  validateRegistration,
} from "./domain/auth-form";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateRegistration({
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    password: readText(formData, "password"),
    academicUseAccepted: formData.get("academicUse") === "on",
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
      data: {
        full_name: validation.data.fullName,
        academic_use_accepted_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        "No pudimos crear la cuenta. Verificá el correo o intentá nuevamente en unos minutos.",
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message:
      "Te enviamos un correo. Confirmá tu dirección para poder ingresar.",
    fieldErrors: {},
  };
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateLogin({
    email: readText(formData, "email"),
    password: readText(formData, "password"),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {
      status: "error",
      message:
        "No pudimos iniciar sesión. Revisá el correo, la contraseña y que hayas confirmado tu cuenta.",
      fieldErrors: {},
    };
  }

  redirect("/app");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/ingresar");
}
