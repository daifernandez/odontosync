import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DailyAgenda } from "./daily-agenda";

const appointment = {
  id: "appointment-1",
  patientId: "patient-1",
  patientFirstName: "Ana",
  patientLastName: "Prueba",
  startsAt: "2026-09-14T12:00:00Z",
  occupiedUntil: "2026-09-14T12:35:00Z",
  durationMinutes: 30,
  cleanupMinutes: 5,
  specialty: "control" as const,
  status: "confirmed" as const,
};
const props = {
  date: "2026-09-14",
  weekStartDate: "2026-09-14",
  currentTime: "2026-09-13T12:00:00Z",
  appointments: [appointment],
  appointmentOccupancy: [appointment],
  exceptionalBlocks: [],
  availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "11:00" }],
  durationMinutes: 30,
  cleanupMinutes: 5,
  gridIntervalMinutes: 15,
};

describe("DailyAgenda", () => {
  it("interleaves appointments and bookable gaps in time order with date context", () => {
    const html = renderToStaticMarkup(<DailyAgenda {...props} />);
    expect(html.indexOf("Prueba, Ana")).toBeLessThan(
      html.indexOf("Libre · 09:35–11:00"),
    );
    expect(html).toContain("Acondicionamiento hasta 09:35");
    expect(html).toContain("Reservar 09:45");
    expect(html).toContain(
      "vista=dia&amp;fecha=2026-09-14&amp;nuevo=1&amp;hora=09:45",
    );
    expect(html).toContain("Reprogramar");
    expect(html).not.toContain("hora=09:15");
  });
  it("keeps cancelled appointments out of the active day and reports a day off", () => {
    const html = renderToStaticMarkup(
      <DailyAgenda
        {...props}
        appointments={[{ ...appointment, status: "cancelled" }]}
        appointmentOccupancy={[]}
        availability={[]}
      />,
    );
    expect(html).not.toContain("Prueba, Ana");
    expect(html).toContain("No hay horarios configurados para este día");
  });
  it("offers no bookings for a past day and uses read-only context in a form", () => {
    const past = renderToStaticMarkup(
      <DailyAgenda {...props} currentTime="2026-09-15T12:00:00Z" />,
    );
    expect(past).not.toContain("Reservar ");
    expect(past).not.toContain(">Reprogramar<");
    const preview = renderToStaticMarkup(<DailyAgenda {...props} preview />);
    expect(preview).toContain("Prueba, Ana");
    expect(preview).not.toContain("<a ");
  });
});
