import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getPatient: vi.fn(),
  listPatientAppointments: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/modules/patients/repository", () => ({
  getPatient: mocks.getPatient,
}));

vi.mock("@/modules/appointments/repository", () => ({
  listPatientAppointments: mocks.listPatientAppointments,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));

import PatientDetailPage from "./page";

const patientId = "00000000-0000-4000-8000-000000000010";

describe("PatientDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "owner-id" } },
        }),
      },
    });
    mocks.getPatient.mockResolvedValue({
      id: patientId,
      firstName: "Lucía",
      lastName: "Prueba",
      phone: "11 5555-0101",
      email: "lucia@example.com",
      isActive: true,
    });
    mocks.listPatientAppointments.mockResolvedValue([
      {
        id: "future-appointment",
        patientId,
        patientFirstName: "Lucía",
        patientLastName: "Prueba",
        startsAt: "2099-09-01T13:30:00.000Z",
        occupiedUntil: "2099-09-01T14:05:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "orthodontics",
        status: "confirmed",
      },
      {
        id: "past-appointment",
        patientId,
        patientFirstName: "Lucía",
        patientLastName: "Prueba",
        startsAt: "2025-09-01T13:30:00.000Z",
        occupiedUntil: "2025-09-01T14:05:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "general",
        status: "completed",
      },
      {
        id: "cancelled-appointment",
        patientId,
        patientFirstName: "Lucía",
        patientLastName: "Prueba",
        startsAt: "2025-08-01T13:30:00.000Z",
        occupiedUntil: "2025-08-01T14:05:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "general",
        status: "cancelled",
      },
      {
        id: "rescheduled-appointment",
        patientId,
        patientFirstName: "Lucía",
        patientLastName: "Prueba",
        startsAt: "2025-07-01T13:30:00.000Z",
        occupiedUntil: "2025-07-01T14:05:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "general",
        status: "rescheduled",
      },
      {
        id: "pending-past-appointment",
        patientId,
        patientFirstName: "Lucía",
        patientLastName: "Prueba",
        startsAt: "2025-06-01T13:30:00.000Z",
        occupiedUntil: "2025-06-01T14:05:00.000Z",
        durationMinutes: 30,
        cleanupMinutes: 5,
        specialty: "general",
        status: "pending_confirmation",
      },
    ]);
  });

  it("renders upcoming links and only terminal outcomes in history", async () => {
    const page = await PatientDetailPage({
      params: Promise.resolve({ patientId }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("Paciente activo");
    expect(markup).toContain("11 5555-0101");
    expect(markup).toContain("lucia@example.com");
    expect(markup).toContain("Próximos turnos");
    expect(markup).toContain("Historial de turnos");
    expect(markup).toContain("Ortodoncia");
    expect(markup).toContain("Odontología general");
    expect(markup).toContain(
      `/app/pacientes/${patientId}/editar`,
    );
    expect(markup).toContain("vista=dia");
    expect(markup).toContain("fecha=2099-09-01");
    expect(markup).toContain("turno=future-appointment");
    expect(markup).toContain("Ver en Agenda");
    expect(markup).not.toContain("Ver detalle histórico");
    expect(markup).toContain("Cancelado");
    expect(markup).toContain("Reprogramado");
    expect(markup).not.toContain("Pendiente de confirmación");
  });

  it("shows clear empty states when the patient has no appointments", async () => {
    mocks.listPatientAppointments.mockResolvedValue([]);

    const page = await PatientDetailPage({
      params: Promise.resolve({ patientId }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("No hay próximos turnos");
    expect(markup).toContain("Este paciente todavía no tiene historial");
    expect(markup).toContain("Crear turno");
    expect(markup).toContain(
      `/app/agenda?nuevo=1&amp;paciente=${patientId}#nuevo-turno`,
    );
  });

  it("uses the authenticated owner in both database reads", async () => {
    await PatientDetailPage({ params: Promise.resolve({ patientId }) });

    expect(mocks.getPatient).toHaveBeenCalledWith(patientId, "owner-id");
    expect(mocks.listPatientAppointments).toHaveBeenCalledWith(
      patientId,
      "owner-id",
    );
  });

  it("returns not found for an invalid patient id before reading data", async () => {
    await expect(
      PatientDetailPage({
        params: Promise.resolve({ patientId: "not-a-patient-id" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.getPatient).not.toHaveBeenCalled();
  });

  it("redirects an expired session before reading patient data", async () => {
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: {} } }),
      },
    });

    await expect(
      PatientDetailPage({ params: Promise.resolve({ patientId }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.redirect).toHaveBeenCalledWith("/ingresar");
    expect(mocks.getPatient).not.toHaveBeenCalled();
    expect(mocks.listPatientAppointments).not.toHaveBeenCalled();
  });

  it("returns not found when the patient is missing or belongs to another owner", async () => {
    mocks.getPatient.mockResolvedValue(null);
    mocks.listPatientAppointments.mockResolvedValue([]);

    await expect(
      PatientDetailPage({ params: Promise.resolve({ patientId }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalled();
  });
});
