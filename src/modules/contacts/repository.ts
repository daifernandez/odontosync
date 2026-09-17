import { createClient } from "@/lib/supabase/server";

import {
  type Contact,
  type ContactInput,
  type ContactStatus,
  type ContactTypeFilter,
  normalizeContactSearch,
} from "./domain/contact";

type ContactRow = {
  id: string;
  name: string;
  type: Contact["type"];
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  specialty: string | null;
  notes: string | null;
  is_active: boolean;
};

const columns = "id, name, type, contact_name, phone, email, address, hours, specialty, notes, is_active";

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    hours: row.hours,
    specialty: row.specialty,
    notes: row.notes,
    isActive: row.is_active,
  };
}

function toRow(contact: ContactInput) {
  return {
    name: contact.name,
    type: contact.type,
    contact_name: contact.contactName,
    phone: contact.phone,
    email: contact.email,
    address: contact.address,
    hours: contact.hours,
    specialty: contact.specialty,
    notes: contact.notes,
  };
}

export async function listContacts(
  search: string,
  type: ContactTypeFilter,
  status: ContactStatus,
  userId: string,
): Promise<Contact[]> {
  const supabase = await createClient();
  let query = supabase.from("business_contacts").select(columns)
    .eq("user_id", userId).eq("is_active", status === "active");
  if (type !== "all") query = query.or(`type.eq.${type},type.eq.both`);
  const term = normalizeContactSearch(search);
  if (term) query = query.ilike("name", `%${term}%`);
  const { data, error } = await query.order("name");
  if (error) throw new Error("Could not read contacts");
  return (data as ContactRow[]).map(mapContact);
}

export async function getContact(contactId: string, userId: string): Promise<Contact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_contacts").select(columns)
    .eq("id", contactId).eq("user_id", userId).maybeSingle();
  if (error) throw new Error("Could not read contact");
  return data ? mapContact(data as ContactRow) : null;
}

export async function createContact(contact: ContactInput, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_contacts")
    .insert({ user_id: userId, ...toRow(contact) });
  if (error) throw new Error("Could not create contact");
}

export async function updateContact(contactId: string, contact: ContactInput, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_contacts")
    .update(toRow(contact)).eq("id", contactId).eq("user_id", userId)
    .select("id").maybeSingle();
  if (error) throw new Error("Could not update contact");
  return data !== null;
}

export async function setContactActive(contactId: string, isActive: boolean, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_contacts")
    .update({ is_active: isActive }).eq("id", contactId).eq("user_id", userId)
    .select("id").maybeSingle();
  if (error) throw new Error("Could not change contact status");
  return data !== null;
}
