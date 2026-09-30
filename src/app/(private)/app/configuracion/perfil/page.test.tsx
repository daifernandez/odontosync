import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock("@/modules/initial-configuration/repository", () => ({
  getInitialConfiguration: vi.fn(async () => null),
}));
vi.mock("@/modules/profile-avatar/repository", () => ({
  getProfileAvatarPath: vi.fn(async () => null),
  getProfileAvatarUrl: vi.fn(async () => null),
}));
vi.mock("@/components/profile-avatar-form", () => ({
  ProfileAvatarForm: () => null,
}));
vi.mock("@/components/profile-settings-form", () => ({
  ProfileSettingsForm: () => null,
}));
vi.mock("@/components/account-deletion-panel", () => ({
  AccountDeletionPanel: () => <p>Eliminar mi cuenta</p>,
}));

import ProfileConfigurationPage from "./page";

describe("ProfileConfigurationPage", () => {
  beforeEach(() => {
    mocks.getUser.mockResolvedValue({ data: { user: { email: "ana@example.com" } } });
  });

  it("shows deletion for the evaluation account", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { email: "Evaluacion@OdontoSync.Test" } } });
    const html = renderToStaticMarkup(await ProfileConfigurationPage());
    expect(html).toContain("Eliminar mi cuenta");
  });

  it("keeps deletion available for other accounts", async () => {
    const html = renderToStaticMarkup(await ProfileConfigurationPage());
    expect(html).toContain("Eliminar mi cuenta");
  });
});
