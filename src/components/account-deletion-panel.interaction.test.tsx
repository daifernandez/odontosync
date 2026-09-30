// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/account-deletion/actions", () => ({ deleteAccountAction: vi.fn() }));

import { deleteAccountAction } from "@/modules/account-deletion/actions";
import { AccountDeletionPanel } from "./account-deletion-panel";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AccountDeletionPanel", () => {
  it("shows consequences and requires an explicit confirmation", async () => {
    vi.mocked(deleteAccountAction).mockResolvedValue({ status: "error", message: "No pudimos eliminar tu cuenta." });
    render(<AccountDeletionPanel email="ana@example.com" />);
    expect(screen.queryByLabelText(/Escribí el correo/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar mi cuenta" }));
    expect(screen.getByText(/Esta acción es permanente/i)).toBeTruthy();
    expect(screen.getByText(/pacientes/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Escribí el correo/i), { target: { value: "ana@example.com" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Entiendo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar cuenta definitivamente" }));
    await waitFor(() => expect(deleteAccountAction).toHaveBeenCalled());
    expect(screen.getByRole("alert").textContent).toContain("No pudimos eliminar");
  });
});
