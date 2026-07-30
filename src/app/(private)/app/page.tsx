import type { Metadata } from "next";

import { DashboardHome } from "@/components/dashboard-home";

export const metadata: Metadata = {
  title: "Inicio | OdontoSync",
  description: "Resumen de agenda y herramientas de OdontoSync.",
};

export default function HomePage() {
  return <DashboardHome />;
}
