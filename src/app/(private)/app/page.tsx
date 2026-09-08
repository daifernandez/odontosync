import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Agenda | OdontoSync",
  description: "Organizá tu jornada en OdontoSync.",
};

export default async function HomePage() {
  redirect("/app/agenda?vista=dia");
}
