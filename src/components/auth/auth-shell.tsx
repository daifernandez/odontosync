import { FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: Readonly<{
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <main className="grid min-h-screen bg-[var(--color-background)] lg:grid-cols-[minmax(22rem,0.8fr)_minmax(30rem,1.2fr)]">
      <section className="relative hidden overflow-hidden bg-[var(--color-foreground)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 size-96 rounded-full bg-[rgb(20_125_115/28%)] blur-3xl"
        />
        <Link
          className="relative flex items-center gap-3 text-white no-underline"
          href="/"
        >
          <span className="grid size-11 place-items-center rounded-[0.9rem] bg-white">
            <BrandMark aria-hidden="true" className="size-9" />
          </span>
          <span>
            <strong className="block">
              Odonto<span className="text-[#91d8d0]">Sync</span>
            </strong>
            <small className="text-[#b9ccc9]">Gestión odontológica</small>
          </span>
        </Link>

        <div className="relative max-w-lg">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-[#91d8d0] uppercase">
            Primera versión
          </p>
          <h2 className="mt-4 text-4xl leading-tight tracking-[-0.05em]">
            Un espacio simple para organizar el trabajo del consultorio.
          </h2>
          <ul className="mt-8 flex list-none flex-col gap-4 p-0 text-sm text-[#d5e2e0]">
            <li className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#91d8d0]"
                size={19}
              />
              Acceso individual protegido mediante correo y contraseña.
            </li>
            <li className="flex items-start gap-3">
              <FileText
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#91d8d0]"
                size={19}
              />
              Alcance académico: usá únicamente información ficticia.
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-[#93aaa7]">
          No ingreses información clínica ni datos de pacientes reales.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            className="mb-10 flex items-center gap-3 text-[var(--color-foreground)] no-underline lg:hidden"
            href="/"
          >
            <BrandMark aria-hidden="true" className="size-10" />
            <strong>
              Odonto<span className="text-[var(--color-brand)]">Sync</span>
            </strong>
          </Link>

          <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            {eyebrow}
          </p>
          <h1 className="m-0 text-3xl tracking-[-0.045em] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 mb-8 text-sm leading-6 text-[var(--color-muted)]">
            {description}
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}
