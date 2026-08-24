import {
  formatArgentinaDateInput,
  getAppointmentSpecialtyLabel,
  parseArgentinaDateTime,
  type Appointment,
  type AppointmentStatus,
} from "@/modules/appointments/domain/appointment";

const argentinaTimeZone = "America/Argentina/Buenos_Aires";

const statusLabels = {
  pending_confirmation: "Pendiente",
  confirmed: "Confirmado",
  completed: "Atendido",
  no_show: "No asistió",
  cancelled: "Cancelado",
  rescheduled: "Reprogramado",
} as const satisfies Record<AppointmentStatus, string>;

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: argentinaTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: argentinaTimeZone,
  weekday: "short",
  day: "numeric",
  month: "short",
});

export type DashboardAppointment = {
  id: string;
  date: string;
  dateLabel: string;
  time: string;
  patient: string;
  specialty: string;
  status: (typeof statusLabels)[AppointmentStatus];
};

export type DashboardData = {
  todayAppointments: number;
  confirmedToday: number;
  availableSlotsToday: number;
  upcomingAppointments: DashboardAppointment[];
};

type DashboardDataInput = {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
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

function formatDateLabel(startsAt: Date, today: string) {
  if (formatArgentinaDateInput(startsAt) === today) {
    return "Hoy";
  }

  const value = dateFormatter.format(startsAt).replaceAll(".", "");

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildDashboardData({
  todayAppointments,
  upcomingAppointments,
  availableSlotsToday,
  now = new Date(),
}: DashboardDataInput): DashboardData {
  const today = formatArgentinaDateInput(now);

  return {
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
        dateLabel: formatDateLabel(startsAt, today),
        time: timeFormatter.format(startsAt),
        patient: `${appointment.patientLastName}, ${appointment.patientFirstName}`,
        specialty:
          getAppointmentSpecialtyLabel(appointment.specialty) ??
          "Sin especialidad",
        status: statusLabels[appointment.status],
      };
    }),
  };
}
