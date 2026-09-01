import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  createInstructionTemplate,
  getInstructionTemplate,
  listInstructionTemplates,
  updateInstructionTemplate,
} from "./repository";

const templateInput = {
  title: "Cuidados posteriores",
  specialty: "surgery" as const,
  introduction: "Indicaciones generales",
  listStyle: "numbered" as const,
  points: ["Descansá durante las primeras horas."],
};

describe("instruction template repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only the owner's templates ordered for the library", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "template-id",
            title: templateInput.title,
            specialty: templateInput.specialty,
            introduction: templateInput.introduction,
            list_style: templateInput.listStyle,
            points: templateInput.points,
            updated_at: "2026-09-01T03:00:00+00:00",
          },
        ],
        error: null,
      }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(listInstructionTemplates("owner-id")).resolves.toEqual([
      {
        id: "template-id",
        ...templateInput,
        updatedAt: "2026-09-01T03:00:00+00:00",
      },
    ]);
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(query.order).toHaveBeenNthCalledWith(1, "specialty");
    expect(query.order).toHaveBeenNthCalledWith(2, "updated_at", {
      ascending: false,
    });
  });

  it("reads one template only when it belongs to the owner", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(
      getInstructionTemplate("template-id", "owner-id"),
    ).resolves.toBeNull();
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "template-id");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "owner-id");
  });

  it("creates a template with fixed fields and its authenticated owner", async () => {
    const query = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn().mockResolvedValue({
        data: { id: "template-id" },
        error: null,
      }),
    };
    query.insert.mockReturnValue(query);
    query.select.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(
      createInstructionTemplate(templateInput, "owner-id"),
    ).resolves.toBe("template-id");
    expect(query.insert).toHaveBeenCalledWith({
      user_id: "owner-id",
      title: templateInput.title,
      specialty: templateInput.specialty,
      introduction: templateInput.introduction,
      list_style: templateInput.listStyle,
      points: templateInput.points,
    });
  });

  it("updates only editable fields on a template visible to the owner", async () => {
    const query = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "template-id" },
        error: null,
      }),
    };
    query.update.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.select.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(
      updateInstructionTemplate("template-id", templateInput, "owner-id"),
    ).resolves.toBe(true);
    expect(query.update).toHaveBeenCalledWith({
      title: templateInput.title,
      specialty: templateInput.specialty,
      introduction: templateInput.introduction,
      list_style: templateInput.listStyle,
      points: templateInput.points,
      updated_at: expect.any(String),
    });
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "template-id");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "owner-id");
  });
});
