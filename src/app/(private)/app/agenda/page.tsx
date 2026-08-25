import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MonthlyAgenda } from "@/components/monthly-agenda";
import { WeeklyAgenda } from "@/components/weekly-agenda";
import { createClient } from "@/lib/supabase/server";
import {
  buildAgendaDay,
  getAgendaMonthRange,
  getAgendaWeekRange,
  parseOptionalAgendaView,
} from "@/modules/agenda/domain/weekly-schedule";
import { getLastAgendaView } from "@/modules/agenda/repository";
import {
  formatArgentinaDateInput,
  isAppointmentClosureStatus,
} from "@/modules/appointments/domain/appointment";
import {
  listAppointmentsForRange,
  listAppointmentOccupancy,
} from "@/modules/appointments/repository";
import {
  listExceptionalBlocks,
  listExceptionalBlocksForRange,
} from "@/modules/exceptional-blocks/repository";
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
    consulta?: string | string[];
    creado?: string | string[];
    errorGestion?: string | string[];
    fecha?: string | string[];
    hora?: string | string[];
    paciente?: string | string[];
    nuevo?: string | string[];
    reprogramado?: string | string[];
    semana?: string | string[];
    turno?: string | string[];
    vista?: string | string[];
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const selectedWeek = Array.isArray(params.semana)
    ? params.semana[0]
    : params.semana;
  const requestedDate =
    typeof params.fecha === "string" ? params.fecha : undefined;
  const initialPatientId =
    typeof params.paciente === "string" ? params.paciente : undefined;
  const explicitView =
    parseOptionalAgendaView(
      typeof params.vista === "string" ? params.vista : undefined,
    ) ?? (selectedWeek || params.nuevo === "1" ? "week" : null);

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (typeof userId !== "string") {
    redirect("/ingresar");
  }

  const view =
    explicitView ?? (await getLastAgendaView(userId).catch(() => "week" as const));

  if (view === "month") {
    const { from, to, month } = getAgendaMonthRange(
      requestedDate ?? selectedWeek,
    );
    const [configuration, appointments, exceptionalBlocks] =
      await Promise.all([
        getInitialConfiguration(),
        listAppointmentsForRange(from, to, userId),
        listExceptionalBlocksForRange(from, to, userId),
      ]);

    if (!configuration || configuration.availability.length === 0) {
      redirect("/app/configuracion");
    }

    return (
      <MonthlyAgenda
        appointments={appointments}
        currentTime={new Date()}
        exceptionalBlocks={exceptionalBlocks}
        month={month}
      />
    );
  }

  const selectedDate = buildAgendaDay(
    view === "day" ? requestedDate : requestedDate ?? selectedWeek,
  ).date;
  const { from, to, week } = getAgendaWeekRange(
    view === "day" ? selectedDate : selectedWeek,
  );
  const [
    configuration,
    patients,
    appointments,
    appointmentOccupancy,
    exceptionalBlocks,
  ] =
    await Promise.all([
      getInitialConfiguration(),
      listPatients("", "active", userId),
      listAppointmentsForRange(from, to, userId, { includeChanges: true }),
      listAppointmentOccupancy(undefined, userId),
      listExceptionalBlocks(undefined, userId),
    ]);

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  const selectedAppointment =
    typeof params.turno === "string"
      ? appointments.find(
          (appointment) =>
            appointment.id === params.turno &&
            (view === "week" ||
              formatArgentinaDateInput(new Date(appointment.startsAt)) ===
                selectedDate),
        )
      : undefined;

  return (
    <WeeklyAgenda
      appointments={appointments}
      appointmentOccupancy={appointmentOccupancy}
      autoOpenNewAppointment={params.nuevo === "1"}
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
      initialDate={view === "day" ? selectedDate : requestedDate}
      initialPatientId={initialPatientId}
      initialTime={typeof params.hora === "string" ? params.hora : undefined}
      patients={patients.map(({ id, firstName, lastName }) => ({
        id,
        firstName,
        lastName,
      }))}
      readOnlyAppointment={params.consulta === "1"}
      selectedAppointment={selectedAppointment}
      selectedDate={selectedDate}
      rescheduled={params.reprogramado === "1"}
      updated={params.actualizado === "1"}
      view={view}
      week={week}
    />
  );
}
