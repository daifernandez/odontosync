"use client";

import { useState } from "react";

import { getProfileInitials } from "@/modules/profile-avatar/domain/profile-avatar";

export function AccountAvatar({
  avatarUrl,
  className = "size-9.5 text-[0.68rem]",
  fullName,
}: Readonly<{
  avatarUrl?: string | null;
  className?: string;
  fullName: string;
}>) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl) && avatarUrl !== failedUrl;

  return (
    <span
      aria-label={fullName}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--color-foreground)] font-bold text-white ${className}`}
      role="img"
    >
      {showImage ? (
        // The source is a short-lived URL from the authenticated storage client.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedUrl(avatarUrl ?? null)}
          src={avatarUrl ?? undefined}
        />
      ) : (
        getProfileInitials(fullName)
      )}
    </span>
  );
}
