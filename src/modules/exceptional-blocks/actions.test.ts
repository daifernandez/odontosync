import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createExceptionalBlock: vi.fn(),
  deleteExceptionalBlock: vi.fn(),
  getClaims: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));

vi.mock("./repository", () => ({
  createExceptionalBlock: mocks.createExceptionalBlock,
  deleteExceptionalBlock: mocks.deleteExceptionalBlock,
}));

import {
  createExceptionalBlockAction,
  deleteExceptionalBlockAction,
} from "./actions";
import { exceptionalBlockFormState } from "./domain/exceptional-block";

describe("createExceptionalBlockAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-08-10T14:00:00.000Z"));
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.createExceptionalBlock.mockResolvedValue("created");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns submitted values and field errors before authenticating", async () => {
    const formData = new FormData();
    formData.set("startsAt", "");
    formData.set("endsAt", "2099-08-10T12:00");
    formData.set("category", "custom");

    const result = await createExceptionalBlockAction(
      exceptionalBlockFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: {
        startsAt: "Elegí una fecha y hora de inicio válidas.",
        category: "Elegí un tipo de bloqueo válido.",
      },
      values: {
        startsAt: "",
        endsAt: "2099-08-10T12:00",
        category: "custom",
      },
    });
    expect(mocks.getClaims).not.toHaveBeenCalled();
    expect(mocks.createExceptionalBlock).not.toHaveBeenCalled();
  });

  it("does not write when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    const formData = validFormData();

    const result = await createExceptionalBlockAction(
      exceptionalBlockFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    });
    expect(mocks.createExceptionalBlock).not.toHaveBeenCalled();
  });

  it("explains an overlap without exposing database details", async () => {
    mocks.createExceptionalBlock.mockResolvedValue("conflict");

    const result = await createExceptionalBlockAction(
      exceptionalBlockFormState,
      validFormData(),
    );

    expect(result).toMatchObject({
      status: "error",
      message:
        "Ese período se superpone con otro bloqueo o con un turno activo.",
    });
  });

  it("creates the owner block and returns to the selected week", async () => {
    await expect(
      createExceptionalBlockAction(
        exceptionalBlockFormState,
        validFormData(),
      ),
    ).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&bloqueos=1&bloqueoCreado=1",
    );
    expect(mocks.createExceptionalBlock).toHaveBeenCalledWith(
      {
        startsAt: "2099-08-11T12:00:00.000Z",
        endsAt: "2099-08-11T15:00:00.000Z",
        category: "vacation",
      },
      "00000000-0000-4000-8000-000000000002",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/agenda");
  });

  it("preserves the selected daily view after creating a block", async () => {
    const formData = validFormData();
    formData.set("agendaView", "day");
    formData.set("agendaDate", "2099-08-11");

    await expect(
      createExceptionalBlockAction(exceptionalBlockFormState, formData),
    ).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&vista=dia&fecha=2099-08-11&bloqueos=1&bloqueoCreado=1",
    );
  });
});

describe("deleteExceptionalBlockAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.deleteExceptionalBlock.mockResolvedValue(true);
  });

  it("deletes only through the authenticated owner filter", async () => {
    const formData = new FormData();
    formData.set("blockId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2099-08-10");

    await expect(deleteExceptionalBlockAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&bloqueos=1&bloqueoEliminado=1",
    );
    expect(mocks.deleteExceptionalBlock).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000010",
      "00000000-0000-4000-8000-000000000002",
    );
  });

  it("rejects an invalid, foreign, or unavailable block generically", async () => {
    mocks.deleteExceptionalBlock.mockResolvedValue(false);
    const formData = new FormData();
    formData.set("blockId", "00000000-0000-4000-8000-000000000010");
    formData.set("weekStartDate", "2099-08-10");

    await expect(deleteExceptionalBlockAction(formData)).rejects.toThrow(
      "redirect:/app/agenda?semana=2099-08-10&bloqueos=1&bloqueoError=1",
    );
  });
});

function validFormData() {
  const formData = new FormData();
  formData.set("startsAt", "2099-08-11T09:00");
  formData.set("endsAt", "2099-08-11T12:00");
  formData.set("category", "vacation");
  formData.set("weekStartDate", "2099-08-10");
  return formData;
}
