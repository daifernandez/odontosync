import { createClient } from "@/lib/supabase/server";

import type {
  ExceptionalBlock,
  ExceptionalBlockCategory,
  ExceptionalBlockInput,
} from "./domain/exceptional-block";

type ExceptionalBlockRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  category: ExceptionalBlockCategory;
};

const exceptionalBlockColumns = "id, starts_at, ends_at, category";

function mapExceptionalBlock(row: ExceptionalBlockRow): ExceptionalBlock {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    category: row.category,
  };
}

export async function listExceptionalBlocks(
  from = new Date(),
  userId?: string,
): Promise<ExceptionalBlock[]> {
  const supabase = await createClient();
  let query = supabase
    .from("exceptional_availability_blocks")
    .select(exceptionalBlockColumns);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query
    .gt("ends_at", from.toISOString())
    .order("starts_at")
    .limit(100);

  if (error) {
    throw new Error("Could not read exceptional blocks");
  }

  return (data as ExceptionalBlockRow[]).map(mapExceptionalBlock);
}

export type CreateExceptionalBlockResult =
  | "created"
  | "conflict"
  | "unavailable";

export async function createExceptionalBlock(
  block: ExceptionalBlockInput,
  userId: string,
): Promise<CreateExceptionalBlockResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exceptional_availability_blocks")
    .insert({
      user_id: userId,
      starts_at: block.startsAt,
      ends_at: block.endsAt,
      category: block.category,
    });

  if (!error) {
    return "created";
  }

  if (error.code === "23P01") {
    return "conflict";
  }

  if (["23514", "42501"].includes(error.code)) {
    return "unavailable";
  }

  throw new Error("Could not create exceptional block");
}

export async function deleteExceptionalBlock(blockId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exceptional_availability_blocks")
    .delete()
    .eq("id", blockId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not delete exceptional block");
  }

  return data !== null;
}
