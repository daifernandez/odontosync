import { createClient } from "@/lib/supabase/server";

import {
  type Patient,
  type PatientInput,
  type PatientStatus,
  normalizePatientSearch,
} from "./domain/patient";

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
};

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active,
  };
}

const patientColumns =
  "id, first_name, last_name, phone, email, is_active";

export async function listPatients(
  search: string,
  status: PatientStatus,
): Promise<Patient[]> {
  const supabase = await createClient();
  const searchTerm = normalizePatientSearch(search);
  let query = supabase
    .from("patients")
    .select(patientColumns)
    .eq("is_active", status === "active")
    .order("last_name")
    .order("first_name");

  if (searchTerm) {
    query = query.or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Could not read patients");
  }

  return (data as PatientRow[]).map(mapPatient);
}

export async function getPatient(patientId: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select(patientColumns)
    .eq("id", patientId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read patient");
  }

  return data ? mapPatient(data as PatientRow) : null;
}

export async function createPatient(
  patient: PatientInput,
  userId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("patients").insert({
    user_id: userId,
    first_name: patient.firstName,
    last_name: patient.lastName,
    phone: patient.phone,
    email: patient.email,
  });

  if (error) {
    throw new Error("Could not create patient");
  }
}

export async function updatePatient(
  patientId: string,
  patient: PatientInput,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .update({
      first_name: patient.firstName,
      last_name: patient.lastName,
      phone: patient.phone,
      email: patient.email,
    })
    .eq("id", patientId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not update patient");
  }

  return data !== null;
}

export async function setPatientActive(
  patientId: string,
  isActive: boolean,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .update({ is_active: isActive })
    .eq("id", patientId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not change patient status");
  }

  return data !== null;
}
