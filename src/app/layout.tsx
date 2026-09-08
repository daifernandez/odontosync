import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OdontoSync",
  description:
    "Agenda, disponibilidad y pacientes para odontólogos independientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
