import { createClient } from "@/lib/supabase/server";

import {
  type Patient,
  type PatientInput,
  normalizePatientSearch,
} from "./domain/patient";

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
};

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
  };
}

export async function listPatients(search: string): Promise<Patient[]> {
  const supabase = await createClient();
  const searchTerm = normalizePatientSearch(search);
  let query = supabase
    .from("patients")
    .select("id, first_name, last_name, phone, email")
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
