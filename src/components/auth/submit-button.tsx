"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
}: Readonly<{
  children: React.ReactNode;
  pendingLabel: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 min-h-12 w-full cursor-pointer rounded-xl border-0 bg-[var(--color-brand)] px-5 text-sm font-bold text-white shadow-[0_0.65rem_1.8rem_rgb(20_125_115/18%)] transition-colors hover:bg-[var(--color-brand-dark)] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
