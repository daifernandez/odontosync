import {
  formatArgentinaDateInput,
  getAppointmentSpecialtyLabel,
  parseArgentinaDateTime,
  type Appointment,
} from "@/modules/appointments/domain/appointment";

const argentinaTimeZone = "America/Argentina/Buenos_Aires";

const upcomingStatusLabels = {
  pending_confirmation: "Pendiente de confirmación",
  confirmed: "Confirmado",
} as const;

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: argentinaTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type DashboardAppointment = {
  id: string;
  date: string;
  durationMinutes: number;
  time: string;
  patient: string;
  specialty: string;
  status: (typeof upcomingStatusLabels)[keyof typeof upcomingStatusLabels];
};

export type DashboardData = {
  date: string;
  todayAppointments: number;
  confirmedToday: number;
  availableSlotsToday: number;
  upcomingAppointments: DashboardAppointment[];
};

type DashboardDataInput = {
  todayAppointments: Appointment[];
  availableSlotsToday: number;
  now?: Date;
};

function getNextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);
}

export function getDashboardDayRange(now = new Date()) {
  const date = formatArgentinaDateInput(now);
  const from = parseArgentinaDateTime(`${date}T00:00`);
  const to = parseArgentinaDateTime(`${getNextDate(date)}T00:00`);

  if (!from || !to) {
    throw new Error("Could not calculate dashboard day range");
  }

  return { date, from, to };
}

export function buildDashboardData({
  todayAppointments,
  availableSlotsToday,
  now = new Date(),
}: DashboardDataInput): DashboardData {
  const today = formatArgentinaDateInput(now);
  const upcomingAppointments = todayAppointments
    .filter(
      (appointment) =>
        new Date(appointment.startsAt) >= now &&
        (appointment.status === "pending_confirmation" ||
          appointment.status === "confirmed"),
    )
    .toSorted((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, 3);

  return {
    date: today,
    todayAppointments: todayAppointments.length,
    confirmedToday: todayAppointments.filter(
      (appointment) => appointment.status === "confirmed",
    ).length,
    availableSlotsToday,
    upcomingAppointments: upcomingAppointments.map((appointment) => {
      const startsAt = new Date(appointment.startsAt);

      return {
        id: appointment.id,
        date: formatArgentinaDateInput(startsAt),
        durationMinutes: appointment.durationMinutes,
        time: timeFormatter.format(startsAt),
        patient: `${appointment.patientLastName}, ${appointment.patientFirstName}`,
        specialty:
          getAppointmentSpecialtyLabel(appointment.specialty) ??
          "Sin especialidad",
        status:
          appointment.status === "confirmed"
            ? upcomingStatusLabels.confirmed
            : upcomingStatusLabels.pending_confirmation,
      };
    }),
  };
}
