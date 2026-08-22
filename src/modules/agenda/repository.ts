import { createClient } from "@/lib/supabase/server";

import {
  parseAgendaView,
  type AgendaDisplayView,
} from "./domain/weekly-schedule";

type AgendaViewRow = {
  last_agenda_view: string;
};

export async function getLastAgendaView(
  userId: string,
): Promise<AgendaDisplayView> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_settings")
    .select("last_agenda_view")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read the agenda view preference");
  }

  return parseAgendaView((data as AgendaViewRow | null)?.last_agenda_view);
}

export async function saveLastAgendaView(
  view: AgendaDisplayView,
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_settings")
    .update({ last_agenda_view: view })
    .eq("user_id", userId)
    .select("user_id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Could not save the agenda view preference");
  }
}
