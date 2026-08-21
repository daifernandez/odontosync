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
          occupiedUntil: "2026-08-11T13:00:00.000Z",
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
    expect(markup).toContain("Confirmar turno");
    expect(markup).toContain("Guardar cambios");
    expect(markup).toContain("Quiero cancelar el turno");
    expect(markup).toContain("El horario se liberará");
    expect(markup).not.toContain('name="patientId"');
    expect(markup).toMatch(
      /<input[^>]*name="startsAt"[^>]*checked=""[^>]*value="2026-08-11T09:00"/,
    );
  });

  it("offers cancellation for a future confirmed appointment", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementPanel
        appointment={{
          id: "00000000-0000-4000-8000-000000000010",
          patientId: "00000000-0000-4000-8000-000000000001",
          patientFirstName: "Lucía",
          patientLastName: "Prueba",
          startsAt: "2026-08-11T12:00:00.000Z",
          occupiedUntil: "2026-08-11T13:00:00.000Z",
          durationMinutes: 50,
          cleanupMinutes: 10,
          specialty: "implantology",
          status: "confirmed",
        }}
        appointmentOccupancy={[
          {
            startsAt: "2026-08-11T13:00:00.000Z",
            durationMinutes: 30,
            cleanupMinutes: 5,
          },
        ]}
        availability={[
          { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
        ]}
        currentTime="2026-08-10T12:00:00.000Z"
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain("Turno confirmado");
    expect(markup).toContain("Implantología");
    expect(markup).not.toContain("Confirmar turno");
    expect(markup).not.toContain("Guardar cambios");
    expect(markup).toContain("Quiero cancelar el turno");
    expect(markup).toContain("Reprogramar turno");
    expect(markup).toContain("Elegí la nueva fecha y el nuevo horario");
    expect(markup).toContain("Ocupado");
    expect(markup).toContain('name="startsAt"');
    expect(markup).not.toContain('name="durationMinutes"');
    expect(markup).not.toContain('name="cleanupMinutes"');
    expect(markup).not.toContain('name="specialty"');
    expect(markup).toContain("El horario se liberará");
    expect(markup).toContain("Podrás cerrarlo cuando finalice");
    expect(markup).not.toContain("Marcar como atendido");
  });

  it("keeps an ongoing confirmed appointment read-only", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementPanel
        appointment={{
          id: "00000000-0000-4000-8000-000000000010",
          patientId: "00000000-0000-4000-8000-000000000001",
          patientFirstName: "Lucía",
          patientLastName: "Prueba",
          startsAt: "2026-08-10T12:00:00.000Z",
          occupiedUntil: "2026-08-10T13:00:00.000Z",
          durationMinutes: 50,
          cleanupMinutes: 10,
          specialty: "implantology",
          status: "confirmed",
        }}
        appointmentOccupancy={[]}
        availability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        ]}
        currentTime="2026-08-10T12:30:00.000Z"
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain("Turno confirmado");
    expect(markup).toContain("Podrás cerrarlo cuando finalice");
    expect(markup).not.toContain("Quiero cancelar el turno");
    expect(markup).not.toContain("Reprogramar turno");
    expect(markup).not.toContain("Marcar como atendido");
  });

  it("offers irreversible closure actions for a finished confirmed appointment", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementPanel
        appointment={{
          id: "00000000-0000-4000-8000-000000000010",
          patientId: "00000000-0000-4000-8000-000000000001",
          patientFirstName: "Lucía",
          patientLastName: "Prueba",
          startsAt: "2026-08-10T12:00:00.000Z",
          occupiedUntil: "2026-08-10T13:00:00.000Z",
          durationMinutes: 50,
          cleanupMinutes: 10,
          specialty: "implantology",
          status: "confirmed",
        }}
        appointmentOccupancy={[]}
        availability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        ]}
        currentTime="2026-08-10T13:00:00.000Z"
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain("Cerrar turno");
    expect(markup).toContain("Esta decisión no se puede deshacer");
    expect(markup).toContain("Marcar como atendido");
    expect(markup).toContain("Marcar como ausente");
    expect(markup).not.toContain("Quiero cancelar el turno");
  });

  it.each([
    ["completed", "Turno atendido"],
    ["no_show", "Paciente ausente"],
  ] as const)("renders %s as read-only history", (status, label) => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementPanel
        appointment={{
          id: "00000000-0000-4000-8000-000000000010",
          patientId: "00000000-0000-4000-8000-000000000001",
          patientFirstName: "Lucía",
          patientLastName: "Prueba",
          startsAt: "2026-08-10T12:00:00.000Z",
          occupiedUntil: "2026-08-10T13:00:00.000Z",
          durationMinutes: 50,
          cleanupMinutes: 10,
          specialty: "implantology",
          status,
        }}
        appointmentOccupancy={[]}
        availability={[
          { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        ]}
        currentTime="2026-08-10T14:00:00.000Z"
        gridIntervalMinutes={15}
        minimumDate="2026-08-10"
        weekStartDate="2026-08-10"
      />,
    );

    expect(markup).toContain(label);
    expect(markup).not.toContain("Cerrar turno");
    expect(markup).not.toContain("Guardar cambios");
  });
});
