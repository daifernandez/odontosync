import { createClient } from "@/lib/supabase/server";

import { calculateOccupiedUntil } from "./domain/calculate-occupied-until";
import type {
  Appointment,
  AppointmentInput,
  AppointmentSpecialty,
} from "./domain/appointment";
import type { AppointmentOccupancy } from "./domain/availability";

type AppointmentRow = {
  id: string;
  patient_id: string;
  starts_at: string;
  duration_minutes: number;
  cleanup_minutes: number;
  specialty: AppointmentSpecialty;
  status: "pending_confirmation" | "confirmed";
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
    .in("status", ["pending_confirmation", "confirmed"])
    .order("starts_at")
    .limit(50);

  if (error) {
    throw new Error("Could not read appointments");
  }

  return (data as unknown as AppointmentRow[]).map(mapAppointment);
}

export async function listAppointmentsForRange(
  from: Date,
  to: Date,
): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .in("status", ["pending_confirmation", "confirmed"])
    .order("starts_at");

  if (error) {
    throw new Error("Could not read appointments for agenda week");
  }

  return (data as unknown as AppointmentRow[]).map(mapAppointment);
}

export async function getPendingAppointmentById(
  appointmentId: string,
): Promise<Appointment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("id", appointmentId)
    .eq("status", "pending_confirmation")
    .maybeSingle();

  if (error) {
    throw new Error("Could not read appointment");
  }

  return data ? mapAppointment(data as unknown as AppointmentRow) : null;
}

type AppointmentOccupancyRow = {
  starts_at: string;
  duration_minutes: number;
  cleanup_minutes: number;
};

export async function listAppointmentOccupancy(
  from = new Date(),
): Promise<AppointmentOccupancy[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("starts_at, duration_minutes, cleanup_minutes")
    .gt("occupied_until", from.toISOString())
    .in("status", ["pending_confirmation", "confirmed"])
    .order("starts_at")
    .limit(1000);

  if (error) {
    throw new Error("Could not read appointment occupancy");
  }

  return (data as AppointmentOccupancyRow[]).map((row) => ({
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    cleanupMinutes: row.cleanup_minutes,
  }));
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

export type UpdateAppointmentResult = "updated" | "unavailable" | "overlap";

export async function updateAppointment(
  appointmentId: string,
  appointment: AppointmentInput,
): Promise<UpdateAppointmentResult> {
  const supabase = await createClient();
  const occupiedUntil = calculateOccupiedUntil({
    startsAt: new Date(appointment.startsAt),
    durationMinutes: appointment.durationMinutes,
    turnoverMinutes: appointment.cleanupMinutes,
  });
  const { data, error } = await supabase
    .from("appointments")
    .update({
      starts_at: appointment.startsAt,
      occupied_until: occupiedUntil.toISOString(),
      duration_minutes: appointment.durationMinutes,
      cleanup_minutes: appointment.cleanupMinutes,
      specialty: appointment.specialty,
    })
    .eq("id", appointmentId)
    .eq("status", "pending_confirmation")
    .select("id")
    .maybeSingle();

  if (!error) {
    return data ? "updated" : "unavailable";
  }

  if (error.code === "23P01") {
    return "overlap";
  }

  if (error.code === "42501") {
    return "unavailable";
  }

  throw new Error("Could not update appointment");
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("status", "pending_confirmation")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not cancel appointment");
  }

  return data ? "cancelled" : "unavailable";
}

export async function confirmAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("status", "pending_confirmation")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not confirm appointment");
  }

  return data ? "confirmed" : "unavailable";
}
