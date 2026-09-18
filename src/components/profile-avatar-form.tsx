"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { AccountAvatar } from "@/components/account-avatar";
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
  fullName,
}: Readonly<{
  avatarUrl: string | null;
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
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
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
      <h2 className="m-0 text-xl" id="profile-avatar-title">
        Foto de perfil
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        Es opcional. Si no agregás una foto, mostraremos tus iniciales.
      </p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <AccountAvatar
          avatarUrl={displayedAvatarUrl}
          className="size-20 text-lg"
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

          <form action={uploadAction} className="grid gap-3" noValidate>
            <label className="text-sm font-semibold" htmlFor="profile-avatar">
              Elegir imagen
            </label>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-brand-soft)] file:px-3 file:py-2 file:font-semibold file:text-[var(--color-brand-dark)]"
              id="profile-avatar"
              name="avatar"
              onChange={handleAvatarChange}
              ref={inputRef}
              required
              type="file"
            />
            <p
              aria-live="polite"
              className="m-0 text-xs text-[var(--color-muted)]"
            >
              {previewUrl
                ? "Vista previa de la imagen seleccionada."
                : "JPEG, PNG o WebP, hasta 2 MB."}
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton pendingLabel="Guardando…">
                Guardar foto
              </ActionButton>
              {previewUrl ? (
                <button
                  className="min-h-11 cursor-pointer rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-brand-subtle)]"
                  onClick={clearPreview}
                  type="button"
                >
                  Cancelar selección
                </button>
              ) : null}
            </div>
          </form>

          {avatarUrl ? (
            <form action={removeAction} className="mt-2">
              <ActionButton pendingLabel="Restaurando…" secondary>
                Quitar foto y usar iniciales
              </ActionButton>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
