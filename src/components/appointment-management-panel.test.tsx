import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { AppointmentManagementPanel } from "./appointment-management-panel";

describe("AppointmentManagementPanel", () => {
  it("keeps the patient fixed and provides safe rescheduling and cancellation", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementPanel
        appointment={{
          id: "00000000-0000-4000-8000-000000000010",
          patientId: "00000000-0000-4000-8000-000000000001",
          patientFirstName: "Lucía",
          patientLastName: "Prueba",
          startsAt: "2026-08-11T12:00:00.000Z",
          durationMinutes: 50,
          cleanupMinutes: 10,
          specialty: "implantology",
          status: "pending_confirmation",
        }}
        appointmentOccupancy={[]}
        availability={[
          { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
        ]}
        currentTime="2026-08-10T12:00:00.000Z"
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("Guardar cambios");
    expect(markup).toContain("Quiero cancelar el turno");
    expect(markup).toContain("El horario se liberará");
    expect(markup).not.toContain('name="patientId"');
    expect(markup).toMatch(
      /<input[^>]*name="startsAt"[^>]*checked=""[^>]*value="2026-08-11T09:00"/,
    );
  });
});
