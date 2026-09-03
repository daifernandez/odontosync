import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createInstructionTemplate: vi.fn(),
  deleteInstructionTemplate: vi.fn(),
  getClaims: vi.fn(),
  getInstructionTemplate: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  revalidatePath: vi.fn(),
  updateInstructionTemplate: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
  })),
}));
vi.mock("./repository", () => ({
  createInstructionTemplate: mocks.createInstructionTemplate,
  deleteInstructionTemplate: mocks.deleteInstructionTemplate,
  getInstructionTemplate: mocks.getInstructionTemplate,
  updateInstructionTemplate: mocks.updateInstructionTemplate,
}));

import {
  createInstructionTemplateAction,
  deleteInstructionTemplateAction,
  duplicateInstructionTemplateAction,
  updateInstructionTemplateAction,
} from "./actions";
import {
  instructionTemplateFormState,
  instructionTemplateManagementState,
} from "./domain/instruction-template";

function buildValidFormData() {
  const formData = new FormData();
  formData.set("title", "Cuidados posteriores");
  formData.set("specialty", "surgery");
  formData.set("introduction", "Indicaciones generales");
  formData.set("listStyle", "checks");
  formData.append("points", "Descansá durante las primeras horas.");
  formData.append("points", "Evitá realizar actividad física intensa.");
  return formData;
}

describe("instruction template actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000002" } },
    });
    mocks.createInstructionTemplate.mockResolvedValue(
      "00000000-0000-4000-8000-000000000010",
    );
    mocks.getInstructionTemplate.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000011",
      title: "Cuidados posteriores",
      specialty: "surgery",
      introduction: "Indicaciones generales",
      listStyle: "checks",
      points: ["Descansá durante las primeras horas."],
      updatedAt: "2026-09-01T03:00:00.000Z",
    });
    mocks.deleteInstructionTemplate.mockResolvedValue(true);
    mocks.updateInstructionTemplate.mockResolvedValue(true);
  });

  it("returns all submitted points when validation fails", async () => {
    const formData = buildValidFormData();
    formData.set("title", "");

    const result = await createInstructionTemplateAction(
      instructionTemplateFormState,
      formData,
    );

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: {
        title: "Escribí un título para identificar la indicación.",
      },
      values: {
        title: "",
        specialty: "surgery",
        introduction: "Indicaciones generales",
        listStyle: "checks",
        points: [
          "Descansá durante las primeras horas.",
          "Evitá realizar actividad física intensa.",
        ],
      },
    });
    expect(mocks.createInstructionTemplate).not.toHaveBeenCalled();
  });

  it("creates a private template and opens its printable preview", async () => {
    await expect(
      createInstructionTemplateAction(
        instructionTemplateFormState,
        buildValidFormData(),
      ),
    ).rejects.toThrow(
      "redirect:/app/indicaciones/00000000-0000-4000-8000-000000000010/imprimir?creada=1",
    );
    expect(mocks.createInstructionTemplate).toHaveBeenCalledWith(
      {
        title: "Cuidados posteriores",
        specialty: "surgery",
        introduction: "Indicaciones generales",
        listStyle: "checks",
        points: [
          "Descansá durante las primeras horas.",
          "Evitá realizar actividad física intensa.",
        ],
      },
      "00000000-0000-4000-8000-000000000002",
    );
  });

  it("does not write when the session is unavailable", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });

    await expect(
      createInstructionTemplateAction(
        instructionTemplateFormState,
        buildValidFormData(),
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    });
    expect(mocks.createInstructionTemplate).not.toHaveBeenCalled();
  });

  it("rejects an invalid or inaccessible template during update", async () => {
    await expect(
      updateInstructionTemplateAction(
        "not-an-id",
        instructionTemplateFormState,
        buildValidFormData(),
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "No pudimos guardar los cambios. Volvé a intentarlo.",
    });
    expect(mocks.updateInstructionTemplate).not.toHaveBeenCalled();

    mocks.updateInstructionTemplate.mockResolvedValue(false);
    await expect(
      updateInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000010",
        instructionTemplateFormState,
        buildValidFormData(),
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "No pudimos guardar los cambios. Volvé a intentarlo.",
    });
  });

  it("duplicates an owned template and opens the copy for editing", async () => {
    await expect(
      duplicateInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000011",
        instructionTemplateManagementState,
      ),
    ).rejects.toThrow(
      "redirect:/app/indicaciones/00000000-0000-4000-8000-000000000010/editar?duplicada=1",
    );

    expect(mocks.getInstructionTemplate).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000011",
      "00000000-0000-4000-8000-000000000002",
    );
    expect(mocks.createInstructionTemplate).toHaveBeenCalledWith(
      {
        title: "Copia de Cuidados posteriores",
        specialty: "surgery",
        introduction: "Indicaciones generales",
        listStyle: "checks",
        points: ["Descansá durante las primeras horas."],
      },
      "00000000-0000-4000-8000-000000000002",
    );
  });

  it("does not duplicate an invalid or inaccessible template", async () => {
    mocks.getInstructionTemplate.mockResolvedValue(null);

    await expect(
      duplicateInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000011",
        instructionTemplateManagementState,
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "No pudimos duplicar la plantilla. Volvé a intentarlo.",
    });
    expect(mocks.createInstructionTemplate).not.toHaveBeenCalled();
  });

  it("deletes an owned template and refreshes the library", async () => {
    await expect(
      deleteInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000011",
        instructionTemplateManagementState,
      ),
    ).resolves.toEqual({
      status: "success",
      message: "La plantilla se eliminó correctamente.",
    });

    expect(mocks.deleteInstructionTemplate).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000011",
      "00000000-0000-4000-8000-000000000002",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/indicaciones");
  });

  it("does not delete with an expired session or an inaccessible identifier", async () => {
    mocks.getClaims.mockResolvedValueOnce({ data: { claims: null } });

    await expect(
      deleteInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000011",
        instructionTemplateManagementState,
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "Tu sesión venció. Volvé a ingresar para continuar.",
    });

    mocks.deleteInstructionTemplate.mockResolvedValueOnce(false);
    await expect(
      deleteInstructionTemplateAction(
        "00000000-0000-4000-8000-000000000011",
        instructionTemplateManagementState,
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "No pudimos eliminar la plantilla. Volvé a intentarlo.",
    });
  });
});
