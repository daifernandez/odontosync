"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useTransition } from "react";

import { saveAgendaViewPreferenceAction } from "@/modules/agenda/actions";
import type { AgendaDisplayView } from "@/modules/agenda/domain/weekly-schedule";

export function AgendaViewPreferenceLink({
  ariaCurrent,
  children,
  className,
  href,
  view,
}: Readonly<{
  ariaCurrent?: "page";
  children: ReactNode;
  className: string;
  href: string;
  view: AgendaDisplayView;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    startTransition(async () => {
      try {
        await saveAgendaViewPreferenceAction(view);
      } finally {
        router.push(href);
      }
    });
  }

  return (
    <Link
      aria-busy={isPending || undefined}
      aria-current={ariaCurrent}
      className={className}
      href={href}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
