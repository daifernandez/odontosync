"use client";

import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { AccountAvatar } from "@/components/account-avatar";
import { useUnsavedChanges } from "@/components/use-unsaved-changes";
import {
  profileAvatarFormState,
  removeProfileAvatarAction,
  uploadProfileAvatarAction,
} from "@/modules/profile-avatar/actions";

function ActionButton({
  children,
  pendingLabel,
  secondary = false,
}: Readonly<{
  children: React.ReactNode;
  pendingLabel: string;
  secondary?: boolean;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
        secondary
          ? "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:bg-[var(--color-brand-subtle)]"
          : "border-0 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]"
      }`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ProfileAvatarForm({
  avatarUrl,
  embedded = false,
  fullName,
}: Readonly<{
  avatarUrl: string | null;
  embedded?: boolean;
  fullName: string;
}>) {
  const [uploadState, uploadAction] = useActionState(
    uploadProfileAvatarAction,
    profileAvatarFormState,
  );
  const [removeState, removeAction] = useActionState(
    removeProfileAvatarAction,
    profileAvatarFormState,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { clearDirty, markDirty } = useUnsavedChanges(uploadState);
  const feedback =
    removeState.status !== "idle" ? removeState : uploadState;
  const displayedAvatarUrl =
    previewUrl ?? (removeState.status === "success" ? null : avatarUrl);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const file = event.target.files?.[0];
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!file || !acceptedTypes.includes(file.type) || file.size > 2_000_000) {
      setPreviewUrl(null);
      clearDirty();
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    markDirty();
  }

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setPreviewUrl(null);
    clearDirty();
  }

  const content = (
    <>
      <h2 className="m-0 text-xl" id="profile-avatar-title">
        Foto de perfil
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        Es opcional. Si no agregás una foto, mostraremos tus iniciales.
      </p>

      <div className="mt-4 grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-4 sm:mt-5 sm:flex sm:items-center sm:gap-5">
        <AccountAvatar
          avatarUrl={displayedAvatarUrl}
          className="size-16 text-base sm:size-20 sm:text-lg"
          fullName={fullName}
        />
        <div className="min-w-0 flex-1">
          {feedback.message ? (
            <p
              className={`mt-0 mb-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.status === "error"
                  ? "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-dark)]"
              }`}
              role={feedback.status === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          ) : null}

          <form action={uploadAction} noValidate>
            <input
              aria-describedby="profile-avatar-help"
              accept="image/jpeg,image/png,image/webp"
              className="peer sr-only"
              id="profile-avatar"
              name="avatar"
              onChange={handleAvatarChange}
              ref={inputRef}
              required
              type="file"
            />
            <div className="flex flex-wrap gap-2">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-brand-subtle)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-brand)]"
                htmlFor="profile-avatar"
              >
                <Camera aria-hidden="true" size={17} strokeWidth={1.8} />
                {previewUrl
                  ? "Elegir otra"
                  : avatarUrl
                    ? "Cambiar foto"
                    : "Elegir foto"}
              </label>
              {previewUrl ? (
                <>
                  <ActionButton pendingLabel="Guardando…">
                    Guardar cambio
                  </ActionButton>
                  <button
                    className="min-h-11 cursor-pointer rounded-xl border-0 bg-transparent px-3 text-sm font-semibold text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
                    onClick={clearPreview}
                    type="button"
                  >
                    Cancelar
                  </button>
                </>
              ) : null}
            </div>
            <p
              aria-live="polite"
              className="mt-2 mb-0 text-xs text-[var(--color-muted)]"
              id="profile-avatar-help"
            >
              {previewUrl
                ? "Así se verá tu foto. Guardala para aplicar el cambio."
                  : avatarUrl
                    ? "Podés reemplazarla o quitarla para volver a tus iniciales."
                  : "JPG, PNG o WebP · Máximo 2 MB."}
            </p>
          </form>

          {avatarUrl && !previewUrl ? (
            <form action={removeAction} className="mt-2">
              <ActionButton pendingLabel="Restaurando…" secondary>
                Quitar foto
              </ActionButton>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div aria-labelledby="profile-avatar-title" className="pb-6" id="foto">
        {content}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="profile-avatar-title"
      className="mb-5 scroll-mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-7"
      id="foto"
    >
      <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
        Cuenta
      </p>
      {content}
    </section>
  );
}
