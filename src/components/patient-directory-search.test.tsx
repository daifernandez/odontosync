import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import {
  buildPatientDirectoryPath,
  PatientDirectorySearch,
  PATIENT_SEARCH_DELAY_MS,
} from "./patient-directory-search";

describe("PatientDirectorySearch", () => {
  it("keeps the active status and search in a shareable URL", () => {
    expect(
      buildPatientDirectoryPath({ search: "Lucía", status: "active" }),
    ).toBe("/app/pacientes?buscar=Luc%C3%ADa");
    expect(
      buildPatientDirectoryPath({ search: "Lucía", status: "inactive" }),
    ).toBe("/app/pacientes?estado=inactivos&buscar=Luc%C3%ADa");
    expect(
      buildPatientDirectoryPath({ search: "", status: "active" }),
    ).toBe("/app/pacientes");
  });

  it("renders an accessible instant search with a clear action", () => {
    const markup = renderToStaticMarkup(
      <PatientDirectorySearch initialSearch="Lucía" status="active" />,
    );

    expect(markup).toContain('type="search"');
    expect(markup).toContain('value="Lucía"');
    expect(markup).toContain("Buscar por nombre o apellido");
    expect(markup).toContain("Limpiar búsqueda");
    expect(markup).toContain("Los resultados se actualizan automáticamente");
    expect(PATIENT_SEARCH_DELAY_MS).toBe(300);
  });
});
