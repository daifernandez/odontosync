import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getInitialConfiguration: vi.fn(),
  listPatients: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/modules/initial-configuration/repository", () => ({
  getInitialConfiguration: mocks.getInitialConfiguration,
}));

vi.mock("@/modules/patients/repository", () => ({
  listPatients: mocks.listPatients,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  useRouter: () => ({ replace: vi.fn() }),
}));

import PatientsPage from "./page";

describe("PatientsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getInitialConfiguration.mockResolvedValue({
      availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }],
    });
    mocks.listPatients.mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000010",
        firstName: "Lucía",
        lastName: "Prueba",
        phone: "11 5555-0101",
        email: "lucia@example.com",
        isActive: false,
      },
    ]);
  });

  it("renders patients as a compact list and preserves search across statuses", async () => {
    const page = await PatientsPage({
      searchParams: Promise.resolve({
        buscar: "Lucía",
        estado: "inactivos",
      }),
    });
    const markup = renderToStaticMarkup(page);

    expect(mocks.listPatients).toHaveBeenCalledWith("Lucía", "inactive");
    expect(markup).toContain("Lista de pacientes inactivos");
    expect(markup).toContain("Prueba, Lucía");
    expect(markup).toContain("11 5555-0101");
    expect(markup).toContain("lucia@example.com");
    expect(markup).toContain(
      'href="/app/pacientes?buscar=Luc%C3%ADa">Activos',
    );
    expect(markup).toContain(
      'href="/app/pacientes?estado=inactivos&amp;buscar=Luc%C3%ADa"',
    );
  });
});
