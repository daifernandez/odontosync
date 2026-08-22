import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";
import type { ExceptionalBlock } from "@/modules/exceptional-blocks/domain/exceptional-block";

import {
  getArgentinaDateTimeParts,
  parseArgentinaDateTime,
  type Appointment,
} from "./appointment";

export type AppointmentOccupancy = Pick<
  Appointment,
  "startsAt" | "durationMinutes" | "cleanupMinutes"
>;

export type ExceptionalBlockOccupancy = Pick<
  ExceptionalBlock,
  "startsAt" | "endsAt"
>;

type AvailableSlotsInput = {
  date: string;
  availability: AvailabilityBlock[];
  appointments: AppointmentOccupancy[];
  exceptionalBlocks: ExceptionalBlockOccupancy[];
  durationMinutes: number;
  cleanupMinutes: number;
  gridIntervalMinutes: number;
  now?: Date;
};

const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour <= 23 && minute <= 59 ? hour * 60 + minute : null;
}

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function getDayOfWeek(date: string) {
  const match = localDatePattern.exec(date);

  if (!match) {
    return null;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed.getUTCDay() || 7;
}

function hasValidDuration(
  durationMinutes: number,
  cleanupMinutes: number,
  gridIntervalMinutes: number,
) {
  return (
    Number.isInteger(durationMinutes) &&
    durationMinutes > 0 &&
    Number.isInteger(cleanupMinutes) &&
    cleanupMinutes >= 0 &&
    Number.isInteger(gridIntervalMinutes) &&
    gridIntervalMinutes > 0
  );
}

function overlapsAppointment(
  startsAt: Date,
  occupiedUntil: Date,
  appointment: AppointmentOccupancy,
) {
  const appointmentStart = new Date(appointment.startsAt);
  const appointmentEnd = new Date(
    appointmentStart.getTime() +
      (appointment.durationMinutes + appointment.cleanupMinutes) * 60_000,
  );

  return (
    !Number.isNaN(appointmentStart.getTime()) &&
    startsAt < appointmentEnd &&
    appointmentStart < occupiedUntil
  );
}

export function doesAppointmentOverlapExceptionalBlock(
  appointment: AppointmentOccupancy,
  exceptionalBlocks: ExceptionalBlockOccupancy[],
) {
  const startsAt = new Date(appointment.startsAt);
  const occupiedUntil = new Date(
    startsAt.getTime() +
      (appointment.durationMinutes + appointment.cleanupMinutes) * 60_000,
  );

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(occupiedUntil.getTime())
  ) {
    return false;
  }

  return exceptionalBlocks.some((block) => {
    const blockStart = new Date(block.startsAt);
    const blockEnd = new Date(block.endsAt);

    return (
      !Number.isNaN(blockStart.getTime()) &&
      !Number.isNaN(blockEnd.getTime()) &&
      startsAt < blockEnd &&
      blockStart < occupiedUntil
    );
  });
}

export function getExceptionalBlockSegmentForDate(
  block: ExceptionalBlockOccupancy,
  date: string,
) {
  if (getDayOfWeek(date) === null) {
    return null;
  }

  const dateParts = date.split("-").map(Number);
  const nextDate = new Date(
    Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2] + 1),
  )
    .toISOString()
    .slice(0, 10);
  const dayStart = parseArgentinaDateTime(`${date}T00:00`);
  const dayEnd = parseArgentinaDateTime(`${nextDate}T00:00`);
  const blockStart = new Date(block.startsAt);
  const blockEnd = new Date(block.endsAt);

  if (
    !dayStart ||
    !dayEnd ||
    Number.isNaN(blockStart.getTime()) ||
    Number.isNaN(blockEnd.getTime()) ||
    blockStart >= dayEnd ||
    blockEnd <= dayStart
  ) {
    return null;
  }

  const clippedStart = blockStart > dayStart ? blockStart : dayStart;
  const clippedEnd = blockEnd < dayEnd ? blockEnd : dayEnd;

  return {
    startMinutes: Math.round(
      (clippedStart.getTime() - dayStart.getTime()) / 60_000,
    ),
    endMinutes: Math.round(
      (clippedEnd.getTime() - dayStart.getTime()) / 60_000,
    ),
  };
}

export function getAvailableAppointmentSlots({
  date,
  availability,
  appointments,
  exceptionalBlocks,
  durationMinutes,
  cleanupMinutes,
  gridIntervalMinutes,
  now = new Date(),
}: AvailableSlotsInput) {
  const dayOfWeek = getDayOfWeek(date);

  if (
    dayOfWeek === null ||
    !hasValidDuration(
      durationMinutes,
      cleanupMinutes,
      gridIntervalMinutes,
    )
  ) {
    return [];
  }

  const occupiedMinutes = durationMinutes + cleanupMinutes;
  const slots: string[] = [];

  for (const block of availability) {
    if (block.dayOfWeek !== dayOfWeek) {
      continue;
    }

    const blockStart = parseTime(block.startTime);
    const blockEnd = parseTime(block.endTime);

    if (blockStart === null || blockEnd === null) {
      continue;
    }

    for (
      let startMinutes = blockStart;
      startMinutes + occupiedMinutes <= blockEnd;
      startMinutes += gridIntervalMinutes
    ) {
      const time = formatTime(startMinutes);
      const startsAt = parseArgentinaDateTime(`${date}T${time}`);

      if (!startsAt || startsAt <= now) {
        continue;
      }

      const occupiedUntil = new Date(
        startsAt.getTime() + occupiedMinutes * 60_000,
      );

      if (
        appointments.some((appointment) =>
          overlapsAppointment(startsAt, occupiedUntil, appointment),
        )
      ) {
        continue;
      }

      if (
        doesAppointmentOverlapExceptionalBlock(
          {
            startsAt: startsAt.toISOString(),
            durationMinutes,
            cleanupMinutes,
          },
          exceptionalBlocks,
        )
      ) {
        continue;
      }

      slots.push(time);
    }
  }

  return slots;
}

export function isAppointmentWithinWeeklyAvailability(
  appointment: AppointmentOccupancy,
  availability: AvailabilityBlock[],
  gridIntervalMinutes: number,
  exceptionalBlocks: ExceptionalBlockOccupancy[],
) {
  if (
    !hasValidDuration(
      appointment.durationMinutes,
      appointment.cleanupMinutes,
      gridIntervalMinutes,
    )
  ) {
    return false;
  }

  const startsAt = new Date(appointment.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return false;
  }

  const parts = getArgentinaDateTimeParts(startsAt);
  const dayOfWeek =
    new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() || 7;
  const startMinutes = parts.hour * 60 + parts.minute;
  const occupiedMinutes =
    appointment.durationMinutes + appointment.cleanupMinutes;

  if (
    doesAppointmentOverlapExceptionalBlock(appointment, exceptionalBlocks)
  ) {
    return false;
  }

  return availability.some((block) => {
    const blockStart = parseTime(block.startTime);
    const blockEnd = parseTime(block.endTime);

    return (
      block.dayOfWeek === dayOfWeek &&
      blockStart !== null &&
      blockEnd !== null &&
      parts.second === 0 &&
      startMinutes >= blockStart &&
      startMinutes + occupiedMinutes <= blockEnd &&
      (startMinutes - blockStart) % gridIntervalMinutes === 0
    );
  });
}
