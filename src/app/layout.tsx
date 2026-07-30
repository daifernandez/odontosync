import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OdontoSync",
  description: "Organización de agenda para odontólogos independientes.",
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
