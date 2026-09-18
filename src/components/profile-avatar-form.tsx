"use client";

import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { AccountAvatar } from "@/components/account-avatar";
import { useConfigurationDraft } from "@/components/configuration-drafts";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { value: file, setDraft: setFile, discardDraft, restored } = useConfigurationDraft<File | null>("avatar", null, profileAvatarFormState);
  const [uploadState, uploadAction, uploading] = useActionState(
    async (previous: typeof profileAvatarFormState, data: FormData) => {
      if (file) data.set("avatar", file);
      const result = await uploadProfileAvatarAction(previous, data);
      if (result.status === "success") {
        discardDraft(null);
        if (inputRef.current) inputRef.current.value = "";
      }
      return result;
    },
    profileAvatarFormState,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeProfileAvatarAction,
    profileAvatarFormState,
  );
  const { clearDirty, markDirty } = useUnsavedChanges(uploadState, restored);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [lastOperation, setLastOperation] = useState<"upload" | "remove" | null>(null);
  const feedback = lastOperation === "remove" ? removeState : lastOperation === "upload" ? uploadState : profileAvatarFormState;
  const hasPhoto = lastOperation === "remove" && removeState.status === "success" ? false : Boolean(avatarUrl);
  const displayedAvatarUrl = file ? previewUrl : hasPhoto ? avatarUrl : null;
  const pending = uploading || removing;

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Synchronize the browser-owned object URL and release it when the file changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    const error = selected.size > 2 * 1024 * 1024
      ? "La imagen debe pesar 2 MB o menos."
      : !acceptedTypes.includes(selected.type)
        ? "Usá una imagen JPEG, PNG o WebP."
        : selected.size === 0 ? "Elegí una imagen que no esté vacía." : "";
    setFileError(error);
    setLastOperation(null);
    if (error) {
      discardDraft(null);
      clearDirty();
      event.target.value = "";
      return;
    }
    setFile(selected);
    markDirty();
  }

  function clearPreview() {
    if (inputRef.current) inputRef.current.value = "";
    discardDraft(null);
    setFileError("");
    setLastOperation(null);
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
          {fileError || feedback.message ? (
            <p
              className={`mt-0 mb-4 rounded-xl border px-4 py-3 text-sm ${
                fileError || feedback.status === "error"
                  ? "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-dark)]"
              }`}
              role={fileError || feedback.status === "error" ? "alert" : "status"}
            >
              {fileError || feedback.message}
            </p>
          ) : null}

          <form action={uploadAction} noValidate onSubmit={() => setLastOperation("upload")}>
            <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
              <div className="flex flex-wrap gap-2">
                <label
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-brand-subtle)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-brand)]"
                  htmlFor="profile-avatar"
                >
                  <input
                    aria-describedby="profile-avatar-help"
                    aria-invalid={Boolean(fileError)}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id="profile-avatar"
                    name="avatar"
                    onChange={handleAvatarChange}
                    ref={inputRef}
                    required
                    type="file"
                  />
                  <Camera aria-hidden="true" size={17} strokeWidth={1.8} />
                  {file
                    ? "Elegir otra"
                    : hasPhoto
                      ? "Cambiar foto"
                      : "Elegir foto"}
                </label>
                {file ? (
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
                className="mt-2 mb-0 text-sm text-[var(--color-muted)]"
                id="profile-avatar-help"
              >
                {file
                  ? "Así se verá tu foto. Guardala para aplicar el cambio."
                  : hasPhoto ? "Podés reemplazarla o quitarla para volver a tus iniciales." : null}
                <span className="block">JPG, PNG o WebP · Máximo 2 MB.</span>
              </p>
            </fieldset>
          </form>

          {hasPhoto && !file ? (
            <form action={removeAction} className="mt-2" onSubmit={() => setLastOperation("remove")}>
              <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
                <ActionButton pendingLabel="Restaurando…" secondary>
                  Quitar foto
                </ActionButton>
              </fieldset>
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
      className="scroll-mt-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-7"
      id="foto"
    >
      <p className="mb-2 text-xs font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
        Identidad visual
      </p>
      {content}
    </section>
  );
}
