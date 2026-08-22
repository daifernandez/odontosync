import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { DemoStateProvider } from "@/components/demo-state";

export const metadata: Metadata = {
  title: {
    default: "Demo | OdontoSync",
    template: "%s | Demo | OdontoSync",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell
      mode="demo"
      user={{ fullName: "Cuenta demo", email: "Datos ficticios" }}
    >
      <DemoStateProvider>{children}</DemoStateProvider>
    </AppShell>
  );
}
