import { describe, expect, it } from "vitest";

import { createAppointmentAction } from "./actions";
import { appointmentFormState } from "./domain/appointment";

describe("createAppointmentAction", () => {
  it("returns submitted values when validation fails", async () => {
    const formData = new FormData();
    formData.set("patientId", "00000000-0000-4000-8000-000000000001");
    formData.set("startsAt", "");
    formData.set("durationMinutes", "45");
    formData.set("cleanupMinutes", "10");
    formData.set("specialty", "orthodontics");

    const result = await createAppointmentAction(
      appointmentFormState,
      formData,
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors).toEqual({
      startsAt: "Elegí una fecha y hora futuras válidas.",
    });
    expect(result.values).toEqual({
      patientId: "00000000-0000-4000-8000-000000000001",
      startsAt: "",
      durationMinutes: "45",
      cleanupMinutes: "10",
      specialty: "orthodontics",
    });
  });
});
