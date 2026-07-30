import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { DashboardHome } from "@/components/dashboard-home";

export const metadata: Metadata = {
  title: "Demo | OdontoSync",
  description:
    "Recorrido público de OdontoSync con información completamente ficticia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoPage() {
  return (
    <AppShell
      mode="demo"
      user={{ fullName: "Cuenta demo", email: "Datos ficticios" }}
    >
      <DashboardHome demoMode />
    </AppShell>
  );
}
