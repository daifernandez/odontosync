"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { SubmitButton } from "@/components/auth/submit-button";
import { createContactAction, setContactActiveAction, updateContactAction } from "@/modules/contacts/actions";
import { type Contact, type ContactInput, type ContactStatus, type ContactTypeFilter, contactFormState } from "@/modules/contacts/domain/contact";

export type ContactDirectoryContext = { search: string; type: ContactTypeFilter; status: ContactStatus };

function ContextFields({ directory }: { directory: ContactDirectoryContext }) {
  return <>
    <input name="buscar" type="hidden" value={directory.search} />
    <input name="tipo" type="hidden" value={directory.type === "supplier" ? "proveedores" : directory.type === "laboratory" ? "laboratorios" : ""} />
    <input name="estado" type="hidden" value={directory.status === "inactive" ? "inactivos" : ""} />
  </>;
}

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]";

const fields: { name: keyof Omit<ContactInput, "name" | "type" | "notes">; label: string; max: number; kind?: string }[] = [
  { name: "contactName", label: "Persona de contacto", max: 120 },
  { name: "phone", label: "Teléfono", max: 30, kind: "tel" },
  { name: "email", label: "Correo electrónico", max: 254, kind: "email" },
  { name: "address", label: "Dirección", max: 200 },
  { name: "hours", label: "Horarios de atención", max: 200 },
  { name: "specialty", label: "Rubro o especialidad", max: 120 },
];

export function ContactForm({ contact, directory }: { contact?: Contact; directory: ContactDirectoryContext }) {
  const [state, action] = useActionState(contact ? updateContactAction.bind(null, contact.id) : createContactAction, contactFormState);
  return (
    <form action={action} className="mt-5 grid gap-4" noValidate>
      <ContextFields directory={directory} />
      {state.message ? <p className="m-0 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm" role="alert">{state.message}</p> : null}
      <label className="text-sm font-semibold">Nombre
        <input aria-invalid={Boolean(state.fieldErrors.name)} aria-describedby={state.fieldErrors.name ? "contact-name-error" : undefined} className={inputClass} defaultValue={contact?.name} maxLength={120} name="name" required type="text" />
        {state.fieldErrors.name ? <span className="block text-xs text-red-700" id="contact-name-error">{state.fieldErrors.name}</span> : null}
      </label>
      <label className="text-sm font-semibold">Tipo
        <select aria-invalid={Boolean(state.fieldErrors.type)} aria-describedby={state.fieldErrors.type ? "contact-type-error" : undefined} className={inputClass} defaultValue={contact?.type ?? "supplier"} name="type" required>
          <option value="supplier">Proveedor</option><option value="laboratory">Laboratorio</option><option value="both">Proveedor y laboratorio</option>
        </select>
        {state.fieldErrors.type ? <span className="block text-xs text-red-700" id="contact-type-error">{state.fieldErrors.type}</span> : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, max, kind }) => (
          <label className="min-w-0 text-sm font-semibold" key={name}>{label} <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
            <input aria-invalid={Boolean(state.fieldErrors[name])} aria-describedby={state.fieldErrors[name] ? `contact-${name}-error` : undefined} autoComplete="off" className={inputClass} defaultValue={contact?.[name] ?? ""} maxLength={max} name={name} type={kind ?? "text"} />
            {state.fieldErrors[name] ? <span className="block text-xs text-red-700" id={`contact-${name}-error`}>{state.fieldErrors[name]}</span> : null}
          </label>
        ))}
      </div>
      <label className="text-sm font-semibold">Notas <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
        <textarea aria-invalid={Boolean(state.fieldErrors.notes)} aria-describedby={state.fieldErrors.notes ? "contact-notes-error" : undefined} className={`${inputClass} min-h-28 py-3`} defaultValue={contact?.notes ?? ""} maxLength={1000} name="notes" />
        {state.fieldErrors.notes ? <span className="block text-xs text-red-700" id="contact-notes-error">{state.fieldErrors.notes}</span> : null}
      </label>
      <SubmitButton pendingLabel="Guardando…">{contact ? "Guardar cambios" : "Guardar contacto ficticio"}</SubmitButton>
    </form>
  );
}

export function ContactStatusForm({ contact, directory }: { contact: Contact; directory: ContactDirectoryContext }) {
  const [state, action] = useActionState(setContactActiveAction.bind(null, contact.id, !contact.isActive), contactFormState);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function openConfirmation() {
    if (menuRef.current) menuRef.current.open = false;
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }

  return <>
    <details className="relative" ref={menuRef}>
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-[var(--color-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] [&::-webkit-details-marker]:hidden">Opciones <span aria-hidden="true">⌄</span></summary>
      <div className="absolute top-full right-0 z-10 mt-1 min-w-48 rounded-lg border border-[var(--color-border)] bg-white p-1 shadow-[var(--shadow-card)]">
        <button aria-label={contact.isActive ? "Desactivar contacto" : "Reactivar contacto"} className="min-h-11 w-full cursor-pointer whitespace-nowrap rounded-md border-0 bg-transparent px-3 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--color-brand-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]" onClick={openConfirmation} type="button">{contact.isActive ? "Desactivar contacto" : "Reactivar contacto"}</button>
      </div>
    </details>
    <dialog aria-labelledby={`contact-status-title-${contact.id}`} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(90vw,28rem)] max-w-none overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white p-5 text-[var(--color-foreground)] shadow-[var(--shadow-card)] backdrop:bg-[rgb(24_51_48/45%)]" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} onClose={() => menuRef.current?.querySelector("summary")?.focus()} ref={dialogRef}>
      <h4 className="m-0 text-lg" id={`contact-status-title-${contact.id}`}>{contact.isActive ? "¿Desactivar contacto?" : "¿Reactivar contacto?"}</h4>
      <p className="mt-3 mb-0 text-sm leading-6 text-[var(--color-muted)]">{contact.isActive ? "Saldrá de los activos sin perder sus datos." : "Volverá a aparecer entre los activos."} Los cambios de esta edición que no guardaste se perderán.</p>
      <form action={action} className="mt-5 flex flex-wrap justify-end gap-2">
        <ContextFields directory={directory} />
        {state.message ? <p role="alert" className="m-0 basis-full text-sm text-[var(--color-warning-foreground)]">{state.message}</p> : null}
        <button className="min-h-11 cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium" onClick={() => dialogRef.current?.close()} ref={cancelRef} type="button">Cancelar</button>
        <ContactStatusButton isActive={contact.isActive} />
      </form>
    </dialog>
  </>;
}

function ContactStatusButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();
  return <button className={`min-h-11 cursor-pointer rounded-lg border-0 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] disabled:cursor-wait disabled:opacity-60 ${isActive ? "bg-red-700 hover:bg-red-800" : "bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)]"}`} disabled={pending} type="submit">
    {pending ? isActive ? "Desactivando…" : "Reactivando…" : isActive ? "Desactivar" : "Reactivar"}
  </button>;
}
