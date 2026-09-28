// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ patient: vi.fn(), contact: vi.fn() }));
vi.mock("@/modules/patients/actions", () => ({
  createPatientAction: mocks.patient,
  updatePatientAction: mocks.patient,
  setPatientActiveAction: vi.fn(),
}));
vi.mock("@/modules/contacts/actions", () => ({
  createContactAction: mocks.contact,
  updateContactAction: mocks.contact,
  setContactActiveAction: vi.fn(),
}));

import { PatientForm } from "./patient-form";
import { ContactForm } from "./contact-form";

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("directory form validation", () => {
  it("keeps the patient edit after validation and submits corrected values", async () => {
    mocks.patient.mockResolvedValue({ status: "error", message: "Revisá los campos.", fieldErrors: { email: "Correo inválido" } });
    render(<PatientForm patient={{ id: "patient-1", firstName: "Ana", lastName: "Prueba", email: null, phone: null, isActive: true }} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), { target: { value: "Ana editada" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Correo/ }), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await screen.findByRole("alert");
    expect((screen.getByRole("textbox", { name: "Nombre" }) as HTMLInputElement).value).toBe("Ana editada");
    expect((screen.getByRole("textbox", { name: /Correo/ }) as HTMLInputElement).value).toBe("invalid");
    fireEvent.change(screen.getByRole("textbox", { name: /Correo/ }), { target: { value: "qa@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(mocks.patient).toHaveBeenCalledTimes(2));
    expect(mocks.patient.mock.calls[1][2].get("firstName")).toBe("Ana editada");
    expect(mocks.patient.mock.calls[1][2].get("email")).toBe("qa@example.test");
  });

  it("keeps contact name, type and optional fields after validation", async () => {
    mocks.contact.mockResolvedValue({ status: "error", message: "Revisá los campos.", fieldErrors: { email: "Correo inválido" } });
    render(<ContactForm directory={{ search: "", type: "all", status: "active" }} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), { target: { value: "Proveedor QA" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "both" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Correo/ }), { target: { value: "invalid" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Notas/ }), { target: { value: "Nota ficticia" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar contacto ficticio" }));
    await screen.findByRole("alert");
    const values = new FormData(document.querySelector("form")!);
    expect(Object.fromEntries(values)).toMatchObject({ name: "Proveedor QA", type: "both", email: "invalid", notes: "Nota ficticia" });
    fireEvent.change(screen.getByRole("textbox", { name: /Correo/ }), { target: { value: "qa@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar contacto ficticio" }));
    await waitFor(() => expect(mocks.contact).toHaveBeenCalledTimes(2));
    expect(mocks.contact.mock.calls[1][1].get("type")).toBe("both");
  });
});
