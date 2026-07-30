import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OdontoSync",
  description:
    "Agenda, organización y materiales imprimibles para odontólogos independientes.",
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
