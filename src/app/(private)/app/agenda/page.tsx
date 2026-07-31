import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WeeklyAgenda } from "@/components/weekly-agenda";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export const metadata: Metadata = {
  title: "Agenda | OdontoSync",
  description: "Consultá tus horarios habituales de atención.",
};

export default async function AgendaPage() {
  const configuration = await getInitialConfiguration();

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  return <WeeklyAgenda configuration={configuration} />;
}
