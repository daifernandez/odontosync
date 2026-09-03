import { createClient } from "@/lib/supabase/server";

import type {
  InstructionListStyle,
  InstructionTemplate,
  InstructionTemplateInput,
} from "./domain/instruction-template";
import type { AppointmentSpecialty } from "@/modules/appointments/domain/appointment";

type InstructionTemplateRow = {
  id: string;
  title: string;
  specialty: AppointmentSpecialty;
  introduction: string | null;
  list_style: InstructionListStyle;
  points: string[];
  updated_at: string;
};

const instructionTemplateColumns =
  "id, title, specialty, introduction, list_style, points, updated_at";

function mapInstructionTemplate(
  row: InstructionTemplateRow,
): InstructionTemplate {
  return {
    id: row.id,
    title: row.title,
    specialty: row.specialty,
    introduction: row.introduction,
    listStyle: row.list_style,
    points: row.points,
    updatedAt: row.updated_at,
  };
}

export async function listInstructionTemplates(
  userId: string,
): Promise<InstructionTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruction_templates")
    .select(instructionTemplateColumns)
    .eq("user_id", userId)
    .order("specialty")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error("Could not read instruction templates");
  }

  return (data as InstructionTemplateRow[]).map(mapInstructionTemplate);
}

export async function getInstructionTemplate(
  templateId: string,
  userId: string,
): Promise<InstructionTemplate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruction_templates")
    .select(instructionTemplateColumns)
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read instruction template");
  }

  return data ? mapInstructionTemplate(data as InstructionTemplateRow) : null;
}

export async function createInstructionTemplate(
  template: InstructionTemplateInput,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruction_templates")
    .insert({
      user_id: userId,
      title: template.title,
      specialty: template.specialty,
      introduction: template.introduction,
      list_style: template.listStyle,
      points: template.points,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create instruction template");
  }

  return data.id as string;
}

export async function updateInstructionTemplate(
  templateId: string,
  template: InstructionTemplateInput,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruction_templates")
    .update({
      title: template.title,
      specialty: template.specialty,
      introduction: template.introduction,
      list_style: template.listStyle,
      points: template.points,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not update instruction template");
  }

  return data !== null;
}

export async function deleteInstructionTemplate(
  templateId: string,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruction_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not delete instruction template");
  }

  return data !== null;
}
