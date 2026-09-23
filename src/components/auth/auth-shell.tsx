import { FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { isEmailAuthEnabled } from "@/modules/auth/email-auth";

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
              {isEmailAuthEnabled()
                ? "Acceso individual protegido mediante correo, contraseña o Google."
                : "Acceso individual protegido con Google."}
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

      <section className="flex min-h-screen items-start justify-center px-4 pt-8 pb-6 sm:items-center sm:px-8 sm:py-10">
        <div className="flex min-h-[calc(100svh-3.5rem)] w-full max-w-md flex-col sm:min-h-0 sm:block">
          <Link
            className="mx-auto mb-6 flex min-h-11 w-fit items-center gap-3 text-[var(--color-foreground)] no-underline sm:mb-10 lg:hidden"
            href="/"
          >
            <BrandMark aria-hidden="true" className="size-10" />
            <strong>
              Odonto<span className="text-[var(--color-brand)]">Sync</span>
            </strong>
          </Link>

          <div className="flex flex-1 flex-col justify-center sm:block">
            <p className="mb-2 text-center text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase sm:mb-3 lg:text-left">
              {eyebrow}
            </p>
            <h1 className="m-0 text-center text-3xl tracking-[-0.045em] sm:text-4xl lg:text-left">
              {title}
            </h1>
            <p className="mt-3 mb-6 text-center text-sm leading-6 text-[var(--color-muted)] sm:mt-4 sm:mb-8 lg:text-left">
              {description}
            </p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
