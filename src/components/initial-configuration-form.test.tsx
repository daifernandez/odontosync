import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/initial-configuration/actions", () => ({
  saveInitialConfigurationAction: vi.fn(),
}));

import { InitialConfigurationForm } from "./initial-configuration-form";

describe("InitialConfigurationForm", () => {
  it("offers optional patient-facing profile data, explicit consent, and a preview", () => {
    const markup = renderToStaticMarkup(
      <InitialConfigurationForm
        initialConfiguration={{
          fullName: "Evaluación OdontoSync",
          licenseNumber: null,
          licenseJurisdiction: null,
          clinicName: null,
          officeAddress: null,
          contactPhone: null,
          contactEmail: null,
          additionalInformation: null,
          gridIntervalMinutes: 15,
          defaultAppointmentDurationMinutes: 30,
          defaultCleanupMinutes: 5,
          availability: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
          ],
        }}
        isInitialSetup={false}
      />,
    );

    expect(markup).toContain("Datos para tus pacientes");
    expect(markup).toContain('name="clinicName"');
    expect(markup).toContain('name="officeAddress"');
    expect(markup).toContain('name="contactPhone"');
    expect(markup).toContain('name="contactEmail"');
    expect(markup).toContain('name="additionalInformation"');
    expect(markup).not.toContain(
      'name="showProfessionalDataOnInstructions"',
    );
    expect(markup).toContain("Vista previa de tus datos");
    expect(markup).toContain(
      "Podrás decidir si incluirlos antes de cada impresión.",
    );
    expect(markup).toContain("instruction-document-footer");
  });
});
