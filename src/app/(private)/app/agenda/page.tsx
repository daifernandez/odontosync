import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WeeklyAgenda } from "@/components/weekly-agenda";
import { getAgendaWeekRange } from "@/modules/agenda/domain/weekly-schedule";
import { isAppointmentClosureStatus } from "@/modules/appointments/domain/appointment";
import {
  listAppointmentsForRange,
  listAppointmentOccupancy,
} from "@/modules/appointments/repository";
import { listExceptionalBlocks } from "@/modules/exceptional-blocks/repository";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import { listPatients } from "@/modules/patients/repository";

export const metadata: Metadata = {
  title: "Agenda | OdontoSync",
  description: "Consultá tus horarios habituales de atención.",
};

type AgendaPageProps = {
  searchParams: Promise<{
    actualizado?: string | string[];
    bloqueoCreado?: string | string[];
    bloqueoEliminado?: string | string[];
    bloqueoError?: string | string[];
    bloqueos?: string | string[];
    cancelado?: string | string[];
    cierre?: string | string[];
    confirmado?: string | string[];
    creado?: string | string[];
    errorGestion?: string | string[];
    fecha?: string | string[];
    hora?: string | string[];
    nuevo?: string | string[];
    reprogramado?: string | string[];
    semana?: string | string[];
    turno?: string | string[];
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const selectedWeek = Array.isArray(params.semana)
    ? params.semana[0]
    : params.semana;
  const { from, to, week } = getAgendaWeekRange(selectedWeek);
  const [
    configuration,
    patients,
    appointments,
    appointmentOccupancy,
    exceptionalBlocks,
  ] =
    await Promise.all([
      getInitialConfiguration(),
      listPatients("", "active"),
      listAppointmentsForRange(from, to),
      listAppointmentOccupancy(),
      listExceptionalBlocks(),
    ]);

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  const selectedAppointment =
    typeof params.turno === "string"
      ? appointments.find((appointment) => appointment.id === params.turno)
      : undefined;

  return (
    <WeeklyAgenda
      appointments={appointments}
      appointmentOccupancy={appointmentOccupancy}
      autoOpenNewAppointment={params.nuevo === "1" || params.creado === "1"}
      cancelled={params.cancelado === "1"}
      closureStatus={
        isAppointmentClosureStatus(params.cierre) ? params.cierre : undefined
      }
      confirmed={params.confirmado === "1"}
      configuration={configuration}
      created={params.creado === "1"}
      exceptionalBlockCreated={params.bloqueoCreado === "1"}
      exceptionalBlockDeleted={params.bloqueoEliminado === "1"}
      exceptionalBlockManagementError={params.bloqueoError === "1"}
      exceptionalBlockPanelOpen={params.bloqueos === "1"}
      exceptionalBlocks={exceptionalBlocks}
      managementError={params.errorGestion === "1"}
      initialDate={typeof params.fecha === "string" ? params.fecha : undefined}
      initialTime={typeof params.hora === "string" ? params.hora : undefined}
      patients={patients.map(({ id, firstName, lastName }) => ({
        id,
        firstName,
        lastName,
      }))}
      selectedAppointment={selectedAppointment}
      rescheduled={params.reprogramado === "1"}
      updated={params.actualizado === "1"}
      week={week}
    />
  );
}
