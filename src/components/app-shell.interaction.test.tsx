// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/app/agenda" }));
vi.mock("@/modules/auth/actions", () => ({ logoutAction: vi.fn() }));

import { AppShell } from "./app-shell";

afterEach(cleanup);
it.each(["Contactos", "Indicaciones", "Configuración"])("closes the mobile menu when navigating to %s", (name) => {
  render(<AppShell user={{ fullName: "QA", email: "qa@example.test" }}>Contenido</AppShell>);
  fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
  const menu = screen.getByRole("complementary", { name: "Navegación principal" });
  expect(menu.className).not.toContain("invisible");
  const link = screen.getByRole("link", { name });
  link.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(link);
  expect(menu.className).toContain("invisible");
});
