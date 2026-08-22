import type { Metadata } from "next";

import { DemoPatients } from "@/components/demo-patients";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Pacientes ficticios para recorrer el modo demostración.",
};

export default function DemoPatientsPage() {
  return <DemoPatients />;
}
