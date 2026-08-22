import type { Metadata } from "next";

import { DemoAgenda } from "@/components/demo-agenda";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda interactiva con datos ficticios y sin persistencia.",
};

type DemoAgendaPageProps = {
  searchParams: Promise<{ nuevo?: string | string[] }>;
};

export default async function DemoAgendaPage({
  searchParams,
}: DemoAgendaPageProps) {
  const { nuevo } = await searchParams;

  return <DemoAgenda initialOpen={nuevo === "1"} />;
}
