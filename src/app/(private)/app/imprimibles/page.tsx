import type { Metadata } from "next";

import { PrintableLibrary } from "@/components/printable-library";

export const metadata: Metadata = {
  title: "Imprimibles | OdontoSync",
  description: "Consultá la historia clínica odontológica vacía para imprimir.",
};

export default function PrintablesPage() {
  return <PrintableLibrary />;
}
