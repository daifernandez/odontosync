import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard-home";
import { createClient } from "@/lib/supabase/server";
import { getAvailableAppointmentSlots } from "@/modules/appointments/domain/availability";
import {
  listAppointmentOccupancy,
  listAppointmentsForRange,
} from "@/modules/appointments/repository";
import {
  buildDashboardData,
  getDashboardDayRange,
} from "@/modules/dashboard/domain/dashboard";
import { listExceptionalBlocks } from "@/modules/exceptional-blocks/repository";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export const metadata: Metadata = {
  title: "Inicio | OdontoSync",
  description: "Resumen de agenda y herramientas de OdontoSync.",
};

export default async function HomePage() {
  const configuration = await getInitialConfiguration();

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (typeof userId !== "string") {
    redirect("/ingresar");
  }

  const now = new Date();
  const { date, from, to } = getDashboardDayRange(now);
  const [todayAppointments, occupancy, exceptionalBlocks] = await Promise.all([
    listAppointmentsForRange(from, to, userId),
    listAppointmentOccupancy(now, userId),
    listExceptionalBlocks(now, userId),
  ]);
  const availableSlotsToday = getAvailableAppointmentSlots({
    date,
    availability: configuration.availability,
    appointments: occupancy,
    exceptionalBlocks,
    durationMinutes: configuration.defaultAppointmentDurationMinutes,
    cleanupMinutes: configuration.defaultCleanupMinutes,
    gridIntervalMinutes: configuration.gridIntervalMinutes,
    now,
  }).length;

  return (
    <DashboardHome
      data={buildDashboardData({
        todayAppointments,
        availableSlotsToday,
        now,
      })}
    />
  );
}
