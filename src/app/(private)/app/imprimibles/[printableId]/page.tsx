import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrintableDocumentView } from "@/components/printable-document-view";
import { isPrintableId } from "@/modules/printables/domain/printable";

export const metadata: Metadata = {
  title: "Vista imprimible | OdontoSync",
  description: "Revisá e imprimí la historia clínica odontológica vacía.",
};

type PrintablePageProps = {
  params: Promise<{ printableId: string }>;
};

export default async function PrintablePage({ params }: PrintablePageProps) {
  const { printableId } = await params;

  if (!isPrintableId(printableId)) {
    notFound();
  }

  return (
    <PrintableDocumentView printableId={printableId} />
  );
}
