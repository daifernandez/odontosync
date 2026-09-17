"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { buildContactDirectoryPath, normalizeContactSearch, normalizeContactStatus, normalizeContactTypeFilter, type ContactFormState, validateContact, validateContactId } from "./domain/contact";
import { createContact, setContactActive, updateContact } from "./repository";

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function readContact(formData: FormData) {
  return validateContact({
    name: text(formData, "name"), type: text(formData, "type"),
    contactName: text(formData, "contactName"), phone: text(formData, "phone"),
    email: text(formData, "email"), address: text(formData, "address"),
    hours: text(formData, "hours"), specialty: text(formData, "specialty"),
    notes: text(formData, "notes"),
  });
}

async function userId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return typeof data?.claims?.sub === "string" ? data.claims.sub : null;
}

function error(message: string): ContactFormState {
  return { status: "error", message, fieldErrors: {} };
}

function directoryPath(formData: FormData, feedback: string, status?: "active" | "inactive") {
  const path = buildContactDirectoryPath({
    search: normalizeContactSearch(text(formData, "buscar")),
    type: normalizeContactTypeFilter(text(formData, "tipo")),
    status: status ?? normalizeContactStatus(text(formData, "estado")),
  });
  return `${path}${path.includes("?") ? "&" : "?"}${feedback}=1`;
}

export async function createContactAction(
  _state: ContactFormState, formData: FormData,
): Promise<ContactFormState> {
  const result = readContact(formData);
  if (!result.success) return { status: "error", message: "Revisá los campos marcados.", fieldErrors: result.fieldErrors };
  const owner = await userId();
  if (!owner) return error("Tu sesión venció. Volvé a ingresar.");
  try {
    await createContact(result.data, owner);
  } catch {
    return error("No pudimos guardar el contacto. Intentá nuevamente.");
  }
  revalidatePath("/app/contactos");
  redirect(directoryPath(formData, "creado"));
}

export async function updateContactAction(
  idValue: string, _state: ContactFormState, formData: FormData,
): Promise<ContactFormState> {
  const id = validateContactId(idValue);
  if (!id) return error("No encontramos este contacto.");
  const result = readContact(formData);
  if (!result.success) return { status: "error", message: "Revisá los campos marcados.", fieldErrors: result.fieldErrors };
  const owner = await userId();
  if (!owner) return error("Tu sesión venció. Volvé a ingresar.");
  try {
    if (!(await updateContact(id, result.data, owner))) return error("No encontramos este contacto.");
  } catch {
    return error("No pudimos guardar los cambios. Intentá nuevamente.");
  }
  revalidatePath("/app/contactos");
  redirect(directoryPath(formData, "actualizado"));
}

export async function setContactActiveAction(
  idValue: string, isActive: boolean, _state: ContactFormState, formData: FormData,
): Promise<ContactFormState> {
  void _state;
  const id = validateContactId(idValue);
  if (!id) return error("No encontramos este contacto.");
  const owner = await userId();
  if (!owner) return error("Tu sesión venció. Volvé a ingresar.");
  try {
    if (!(await setContactActive(id, isActive, owner))) return error("No encontramos este contacto.");
  } catch {
    return error("No pudimos cambiar el estado. Intentá nuevamente.");
  }
  revalidatePath("/app/contactos");
  redirect(directoryPath(formData, isActive ? "reactivado" : "desactivado", isActive ? "active" : "inactive"));
}
