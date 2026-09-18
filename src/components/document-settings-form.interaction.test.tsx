/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/initial-configuration/actions", () => ({
  saveDocumentSettingsAction: vi.fn(),
}));

import { saveDocumentSettingsAction } from "@/modules/initial-configuration/actions";

import { DocumentSettingsForm } from "./document-settings-form";

afterEach(cleanup);

describe("DocumentSettingsForm", () => {
  it("switches between editing and the live preview on mobile", () => {
    render(
      <DocumentSettingsForm
        initialDocuments={{
          clinicName: "Consultorio Río",
          officeAddress: "Av. Ejemplo 2450",
          contactPhone: "11 5555 0182",
          contactEmail: "turnos@consultoriorio.test",
          additionalInformation: "Atención con turno previo",
        }}
        profile={{
          fullName: "Dra. Valentina Rossi",
          licenseNumber: "MN 00000",
          licenseJurisdiction: "CABA",
        }}
      />,
    );

    const editButton = screen.getByRole("button", { name: "Editar datos" });
    const previewButton = screen.getByRole("button", { name: "Vista previa" });

    expect(editButton.getAttribute("aria-pressed")).toBe("true");
    expect(previewButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.change(screen.getByLabelText(/Clínica o consultorio/), {
      target: { value: "Consultorio del Parque" },
    });
    fireEvent.click(previewButton);

    expect(previewButton.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Consultorio del Parque")).toBeTruthy();
  });
});

it("returns to editing and focuses the invalid field after saving from preview", async () => {
  vi.mocked(saveDocumentSettingsAction).mockResolvedValue({status: "error", message: "Revisá los datos.", fieldErrors: {contactEmail: "Ingresá un email válido."}});
  render(<DocumentSettingsForm initialDocuments={{clinicName: null, officeAddress: null, contactPhone: null, contactEmail: null, additionalInformation: null}} profile={{fullName:"Ana Pérez", licenseNumber:null, licenseJurisdiction:null}} />);
  const email = screen.getByLabelText(/Email/);
  fireEvent.change(email, {target: {value: "invalido"}});
  fireEvent.click(screen.getByRole("button", {name:"Vista previa"}));
  fireEvent.click(screen.getByRole("button", {name:"Guardar datos"}));
  await waitFor(() => expect(screen.getByText("Ingresá un email válido.")).toBeTruthy());
  expect(screen.getByRole("button", {name:"Editar datos"}).getAttribute("aria-pressed")).toBe("true");
  await waitFor(() => expect(document.activeElement).toBe(email));
  fireEvent.click(screen.getByRole("button", {name:"Descartar cambios"}));
  expect(screen.queryByText("Ingresá un email válido.")).toBeNull();
  expect(screen.getByText("Todos los cambios están guardados")).toBeTruthy();
});

it("opens a larger preview of the draft and returns focus without saving", async () => {
  const showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
  const close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); });
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;
  render(<DocumentSettingsForm initialDocuments={{clinicName: null, officeAddress: null, contactPhone: null, contactEmail: null, additionalInformation: null}} profile={{fullName:"Ana Pérez", licenseNumber:null, licenseJurisdiction:null}} />);
  fireEvent.change(screen.getByLabelText(/Clínica o consultorio/), {target:{value:"Consultorio de prueba"}});
  fireEvent.click(screen.getByRole("button",{name:"Vista previa"}));
  const trigger = screen.getByRole("button",{name:"Ampliar vista previa"});
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog",{name:"Vista previa ampliada"});
  expect(within(dialog).getByText("Consultorio de prueba")).toBeTruthy();
  expect(showModal).toHaveBeenCalledOnce();
  fireEvent.click(within(dialog).getByRole("button",{name:"Cerrar"}));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
  expect(screen.getByText("Tenés cambios sin guardar")).toBeTruthy();

});
