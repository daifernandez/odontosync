type OccupiedUntilInput = {
  startsAt: Date;
  durationMinutes: number;
  turnoverMinutes: number;
};

export function calculateOccupiedUntil({
  startsAt,
  durationMinutes,
  turnoverMinutes,
}: OccupiedUntilInput): Date {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new RangeError("durationMinutes must be a positive integer");
  }

  if (!Number.isInteger(turnoverMinutes) || turnoverMinutes < 0) {
    throw new RangeError("turnoverMinutes must be a non-negative integer");
  }

  const occupiedMinutes = durationMinutes + turnoverMinutes;

  return new Date(startsAt.getTime() + occupiedMinutes * 60_000);
}
