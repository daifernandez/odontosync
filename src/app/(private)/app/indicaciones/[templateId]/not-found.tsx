import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

export default function InstructionNotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 text-center md:px-8 md:py-20">
      <FileQuestion
        aria-hidden="true"
        className="mx-auto text-[var(--color-brand)]"
        size={36}
      />
      <h1 className="mt-4 mb-0 text-2xl">No encontramos esta indicación</h1>
      <p className="mx-auto mt-3 mb-0 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
        La plantilla no existe o no pertenece a tu cuenta.
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 text-sm font-bold text-white no-underline hover:bg-[var(--color-brand-dark)]"
        href="/app/indicaciones"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Volver a la biblioteca
      </Link>
    </main>
  );
}
