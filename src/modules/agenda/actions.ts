"use server";

import { createClient } from "@/lib/supabase/server";

import { parseOptionalAgendaView } from "./domain/weekly-schedule";
import { saveLastAgendaView } from "./repository";

export async function saveAgendaViewPreferenceAction(view: string) {
  const validatedView = parseOptionalAgendaView(view);

  if (!validatedView) {
    return false;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (typeof userId !== "string") {
    return false;
  }

  try {
    await saveLastAgendaView(validatedView, userId);
    return true;
  } catch {
    return false;
  }
}
