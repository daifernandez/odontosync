/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/modules/initial-configuration/actions", () => ({saveAgendaPreferencesAction: vi.fn()}));
import { saveAgendaPreferencesAction } from "@/modules/initial-configuration/actions";
import { ConfigurationDraftProvider } from "./configuration-drafts";
import { AgendaPreferencesForm } from "./agenda-preferences-form";
afterEach(cleanup);
const preferences = {gridIntervalMinutes:15,defaultAppointmentDurationMinutes:30,defaultCleanupMinutes:5} as const;
function Page({show, user = "one"}: {show:boolean; user?:string}) {
  return <ConfigurationDraftProvider key={user}>{show ? <AgendaPreferencesForm initialPreferences={preferences} /> : <p>Otra sección</p>}</ConfigurationDraftProvider>;
}
it("restores unsaved edits after route unmount and isolates another user", () => {
  const view = render(<Page show />);
  fireEvent.click(screen.getByRole("button",{name:"45 minutos"}));
  view.rerender(<Page show={false} />);
  view.rerender(<Page show />);
  expect((screen.getByLabelText("Duración personalizada") as HTMLInputElement).value).toBe("45");
  expect(screen.getByText("Tenés cambios sin guardar")).toBeTruthy();
  view.rerender(<Page show user="two" />);
  expect((screen.getByLabelText("Duración personalizada") as HTMLInputElement).value).toBe("30");
});
it("clears a saved draft so later visits use fresh server data", async () => {
  vi.mocked(saveAgendaPreferencesAction).mockResolvedValue({status:"success",message:"Guardado",fieldErrors:{}});
  const view = render(<Page show />);
  fireEvent.click(screen.getByRole("button",{name:"45 minutos"}));
  fireEvent.click(screen.getByRole("button",{name:"Guardar preferencias"}));
  await waitFor(()=>expect(screen.getByText("Guardado")).toBeTruthy());
  view.rerender(<Page show={false} />);
  view.rerender(<Page show />);
  expect((screen.getByLabelText("Duración personalizada") as HTMLInputElement).value).toBe("30");
});

it("can discard a draft and no longer warn after navigating away", () => {
  const view = render(<Page show />);
  fireEvent.click(screen.getByRole("button",{name:"45 minutos"}));
  view.rerender(<Page show={false} />);
  const pendingUnload = new Event("beforeunload", {cancelable:true});
  window.dispatchEvent(pendingUnload);
  expect(pendingUnload.defaultPrevented).toBe(true);
  view.rerender(<Page show />);
  fireEvent.click(screen.getByRole("button",{name:"Descartar cambios"}));
  expect((screen.getByLabelText("Duración personalizada") as HTMLInputElement).value).toBe("30");
  view.rerender(<Page show={false} />);
  const cleanUnload = new Event("beforeunload", {cancelable:true});
  window.dispatchEvent(cleanUnload);
  expect(cleanUnload.defaultPrevented).toBe(false);
});
