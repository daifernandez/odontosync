import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard-home";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export const metadata: Metadata = {
  title: "Inicio | OdontoSync",
  description: "Resumen de agenda y herramientas de OdontoSync.",
};

export default async function HomePage() {
  const configuration = await getInitialConfiguration();

  if (!configuration || configuration.availability.length === 0) {
    redirect("/app/configuracion");
  }

  return <DashboardHome />;
}
