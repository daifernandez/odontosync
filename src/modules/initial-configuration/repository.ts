import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { InitialConfiguration } from "./domain/initial-configuration";

type Profile = Pick<
  InitialConfiguration,
  "fullName" | "licenseNumber" | "licenseJurisdiction"
>;

type ProfileRow = {
  full_name: string;
  license_number: string | null;
  license_jurisdiction: string | null;
};

type AgendaSettingsRow = {
  grid_interval_minutes: number;
  default_appointment_duration_minutes: number;
  default_cleanup_minutes: number;
};

type AvailabilityRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

function throwReadError() {
  throw new Error("Could not read the initial configuration");
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, license_number, license_jurisdiction")
    .maybeSingle();

  if (error) {
    throwReadError();
  }

  const row = data as ProfileRow | null;

  return row
    ? {
        fullName: row.full_name,
        licenseNumber: row.license_number,
        licenseJurisdiction: row.license_jurisdiction,
      }
    : null;
});

export const getInitialConfiguration = cache(
  async (): Promise<InitialConfiguration | null> => {
    const supabase = await createClient();
    const [profile, settingsResult, availabilityResult] = await Promise.all([
      getProfile(),
      supabase
        .from("agenda_settings")
        .select(
          "grid_interval_minutes, default_appointment_duration_minutes, default_cleanup_minutes",
        )
        .maybeSingle(),
      supabase
        .from("weekly_availability_blocks")
        .select("day_of_week, start_time, end_time")
        .order("day_of_week")
        .order("start_time"),
    ]);

    if (settingsResult.error || availabilityResult.error) {
      throwReadError();
    }

    if (!profile || !settingsResult.data) {
      return null;
    }

    const settings = settingsResult.data as AgendaSettingsRow;
    const availability = availabilityResult.data as AvailabilityRow[];

    return {
      ...profile,
      gridIntervalMinutes: settings.grid_interval_minutes,
      defaultAppointmentDurationMinutes:
        settings.default_appointment_duration_minutes,
      defaultCleanupMinutes: settings.default_cleanup_minutes,
      availability: availability.map((block) => ({
        dayOfWeek: block.day_of_week,
        startTime: block.start_time.slice(0, 5),
        endTime: block.end_time.slice(0, 5),
      })),
    };
  },
);

export async function saveInitialConfiguration(
  configuration: InitialConfiguration,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_initial_configuration", {
    p_full_name: configuration.fullName,
    p_license_number: configuration.licenseNumber ?? "",
    p_license_jurisdiction: configuration.licenseJurisdiction ?? "",
    p_grid_interval_minutes: configuration.gridIntervalMinutes,
    p_default_appointment_duration_minutes:
      configuration.defaultAppointmentDurationMinutes,
    p_default_cleanup_minutes: configuration.defaultCleanupMinutes,
    p_availability: configuration.availability.map((block) => ({
      day_of_week: block.dayOfWeek,
      start_time: block.startTime,
      end_time: block.endTime,
    })),
  });

  if (error) {
    throw new Error("Could not save the initial configuration");
  }
}
