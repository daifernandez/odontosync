import { createClient } from "@/lib/supabase/server";

import { calculateOccupiedUntil } from "./domain/calculate-occupied-until";
import type {
  Appointment,
  AppointmentInput,
  AppointmentSpecialty,
} from "./domain/appointment";

type AppointmentRow = {
  id: string;
  patient_id: string;
  starts_at: string;
  duration_minutes: number;
  cleanup_minutes: number;
  specialty: AppointmentSpecialty;
  status: "pending_confirmation";
  patient: {
    first_name: string;
    last_name: string;
  } | null;
};

const appointmentColumns = `
  id,
  patient_id,
  starts_at,
  duration_minutes,
  cleanup_minutes,
  specialty,
  status,
  patient:patients!appointments_patient_id_user_id_fkey(first_name, last_name)
`;

function mapAppointment(row: AppointmentRow): Appointment {
  if (!row.patient) {
    throw new Error("Appointment patient was not available");
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    patientFirstName: row.patient.first_name,
    patientLastName: row.patient.last_name,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    cleanupMinutes: row.cleanup_minutes,
    specialty: row.specialty,
    status: row.status,
  };
}

export async function listUpcomingAppointments(
  from = new Date(),
): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .gte("starts_at", from.toISOString())
    .eq("status", "pending_confirmation")
    .order("starts_at")
    .limit(50);

  if (error) {
    throw new Error("Could not read appointments");
  }

  return (data as unknown as AppointmentRow[]).map(mapAppointment);
}

export type CreateAppointmentResult =
  | "created"
  | "patient_unavailable"
  | "overlap";

export async function createAppointment(
  appointment: AppointmentInput,
  userId: string,
): Promise<CreateAppointmentResult> {
  const supabase = await createClient();
  const patientResult = await supabase
    .from("patients")
    .select("id")
    .eq("id", appointment.patientId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (patientResult.error) {
    throw new Error("Could not verify appointment patient");
  }

  if (!patientResult.data) {
    return "patient_unavailable";
  }

  const occupiedUntil = calculateOccupiedUntil({
    startsAt: new Date(appointment.startsAt),
    durationMinutes: appointment.durationMinutes,
    turnoverMinutes: appointment.cleanupMinutes,
  });
  const { error } = await supabase.from("appointments").insert({
    user_id: userId,
    patient_id: appointment.patientId,
    starts_at: appointment.startsAt,
    occupied_until: occupiedUntil.toISOString(),
    duration_minutes: appointment.durationMinutes,
    cleanup_minutes: appointment.cleanupMinutes,
    specialty: appointment.specialty,
  });

  if (!error) {
    return "created";
  }

  if (error.code === "23P01") {
    return "overlap";
  }

  if (error.code === "42501") {
    return "patient_unavailable";
  }

  throw new Error("Could not create appointment");
}
