import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
  redirect("/demo/agenda");
}
