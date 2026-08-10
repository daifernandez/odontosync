import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WeeklyAgenda } from "@/components/weekly-agenda";
import {
  listAppointmentOccupancy,
  listUpcomingAppointments,
} from "@/modules/appointments/repository";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import { listPatients } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Agenda | OdontoSync",
  description: "Consultá tus horarios habituales de atención.",
};

type AgendaPageProps = {
  searchParams: Promise<{
    creado?: string | string[];
    nuevo?: string | string[];
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const [configuration, patients, appointments, appointmentOccupancy] =
    await Promise.all([
      getInitialConfiguration(),
      listPatients("", "active"),
      listUpcomingAppointments(),
      listAppointmentOccupancy(),
    ]);

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  return (
    <WeeklyAgenda
      appointments={appointments}
      appointmentOccupancy={appointmentOccupancy}
      autoOpenNewAppointment={params.nuevo === "1" || params.creado === "1"}
      configuration={configuration}
      created={params.creado === "1"}
      patients={patients.map(({ id, firstName, lastName }) => ({
        id,
        firstName,
        lastName,
      }))}
    />
  );
}
