import type { Metadata } from "next";

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
  return <DashboardHome demoMode />;
}
