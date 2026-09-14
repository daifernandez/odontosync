import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildContactDirectoryPath, validateContactId } from "@/modules/contacts/domain/contact";
import { getContact } from "@/modules/contacts/repository";

export const metadata: Metadata = { title: "Ficha de contacto | OdontoSync" };

export default async function ContactPage({ params }: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId: value } = await params;
  const id = validateContactId(value);
  if (!id) notFound();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const owner = data?.claims?.sub;
  if (typeof owner !== "string") redirect("/ingresar");
  const contact = await getContact(id, owner);
  if (!contact) notFound();
  const path = buildContactDirectoryPath({ search: "", type: "all", status: contact.isActive ? "active" : "inactive" });
  redirect(`${path}${path.includes("?") ? "&" : "?"}editar=${id}`);
}
