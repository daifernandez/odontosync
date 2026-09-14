import { ContactRound, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContactForm, ContactStatusForm } from "@/components/contact-form";
import { createClient } from "@/lib/supabase/server";
import { buildContactDirectoryPath, normalizeContactSearch, normalizeContactStatus, normalizeContactTypeFilter, type Contact, type ContactType, validateContactId } from "@/modules/contacts/domain/contact";
import { listContacts } from "@/modules/contacts/repository";

export const metadata: Metadata = { title: "Contactos | OdontoSync", description: "Directorio privado de proveedores y laboratorios." };

type Params = Record<string, string | string[] | undefined>;
function text(value: string | string[] | undefined) { return typeof value === "string" ? value : ""; }
function typeLabel(type: ContactType) {
  return type === "supplier" ? "Proveedor" : type === "laboratory" ? "Laboratorio" : "Proveedor y laboratorio";
}
function withParam(path: string, name: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${name}=${encodeURIComponent(value)}`;
}
function extraDetails(contact: Contact) {
  return ([
    ["Persona de contacto", contact.contactName],
    ["Correo", contact.email],
    ["Dirección", contact.address],
    ["Notas", contact.notes],
  ] as const).filter(([, value]) => Boolean(value));
}

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const search = normalizeContactSearch(text(params.buscar));
  const type = normalizeContactTypeFilter(text(params.tipo));
  const status = normalizeContactStatus(text(params.estado));
  const directory = { search, type, status };
  const directoryPath = buildContactDirectoryPath(directory);
  const isCreating = text(params.nuevo) === "1";
  const editingId = isCreating ? null : validateContactId(text(params.editar));
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const owner = data?.claims?.sub;
  if (typeof owner !== "string") redirect("/ingresar");

  let contacts: Awaited<ReturnType<typeof listContacts>> = [];
  let loadError = false;
  try { contacts = await listContacts(search, type, status, owner); } catch { loadError = true; }
  const feedback = text(params.creado) === "1" ? "Contacto guardado correctamente." : text(params.actualizado) === "1" ? "Cambios guardados correctamente." : text(params.desactivado) === "1" ? "Contacto desactivado sin borrar sus datos." : text(params.reactivado) === "1" ? "Contacto reactivado correctamente." : null;

  return <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
    <header className="flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">Consultorio</p>
      <h1 className="m-0 text-[clamp(1.8rem,3vw,2.55rem)] leading-[1.1] tracking-[-0.045em]">Agenda de contactos</h1>
      <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">Proveedores y laboratorios, con sus datos a mano.</p></div>
      {!isCreating ? <Link className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-brand)] px-4 text-sm font-semibold text-white no-underline" href={withParam(directoryPath, "nuevo", "1")}>Nuevo contacto</Link> : null}
    </header>
    <aside className="mt-7 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-xs leading-6 text-[var(--color-warning-foreground)]">Prototipo académico: cargá sólo contactos ficticios. No ingreses datos personales reales.</aside>
    {feedback ? <p role="status" className="mt-5 rounded-xl bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-brand-dark)]">{feedback}</p> : null}
    {isCreating ? <section aria-labelledby="new-contact-title" className="mt-6 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="m-0 text-xl" id="new-contact-title">Nuevo contacto</h2><Link className="inline-flex min-h-10 items-center text-sm font-semibold text-[var(--color-brand-dark)]" href={directoryPath}>Cancelar</Link></div>
      <p className="mt-2 mb-0 text-xs leading-5 text-[var(--color-muted)]">Sólo nombre y tipo son obligatorios.</p><ContactForm directory={directory} />
    </section> : null}
      <section aria-labelledby="contact-list-title" className="mt-6 min-w-0 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:p-6">
        <h2 className="m-0 text-xl" id="contact-list-title">Contactos {status === "active" ? "activos" : "inactivos"}</h2>
        <form action="/app/contactos" className="mt-5 flex flex-wrap items-end gap-3" method="get" role="search">
          {status === "inactive" ? <input name="estado" type="hidden" value="inactivos" /> : null}
          {type !== "all" ? <input name="tipo" type="hidden" value={type === "supplier" ? "proveedores" : "laboratorios"} /> : null}
          <label className="min-w-0 basis-48 flex-1 text-sm font-semibold">Buscar por nombre
            <span className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3"><Search aria-hidden="true" className="text-[var(--color-muted)]" size={17} /><input className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" defaultValue={search} maxLength={80} name="buscar" type="search" /></span>
          </label>
          <button className="min-h-11 cursor-pointer rounded-xl border border-[var(--color-brand)] bg-[var(--color-brand)] px-4 text-sm font-semibold text-white" type="submit">Buscar</button>
        </form>
        <nav aria-label="Tipo de contacto" className="mt-5 flex flex-wrap gap-2">
          {([ ["all", "Todos"], ["supplier", "Proveedores"], ["laboratory", "Laboratorios"] ] as const).map(([value, label]) => <Link aria-current={type === value ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-xl border px-3 text-sm no-underline ${type === value ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-dark)]" : "border-[var(--color-border)] text-[var(--color-muted)]"}`} href={buildContactDirectoryPath({ search, type: value, status })} key={value}>{label}</Link>)}
        </nav>
        <nav aria-label="Estado de contactos" className="mt-3 flex gap-4 border-b border-[var(--color-border)] text-sm">
          {([ ["active", "Activos"], ["inactive", "Inactivos"] ] as const).map(([value, label]) => <Link aria-current={status === value ? "page" : undefined} className={`min-h-11 border-b-2 py-3 no-underline ${status === value ? "border-[var(--color-brand)] font-semibold text-[var(--color-brand-dark)]" : "border-transparent text-[var(--color-muted)]"}`} href={buildContactDirectoryPath({ search, type, status: value })} key={value}>{label}</Link>)}
        </nav>
        {loadError ? <div role="alert" className="mt-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-5 text-sm">No pudimos cargar los contactos. Actualizá la página e intentá nuevamente.</div> : contacts.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-5 py-10 text-center">
          <ContactRound aria-hidden="true" className="mx-auto text-[var(--color-brand)]" size={28} />
          <h3 className="mt-3 mb-0 text-base">{search || type !== "all" ? "No encontramos coincidencias" : status === "active" ? "Todavía no hay contactos activos" : "No hay contactos inactivos"}</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{search || type !== "all" ? "Probá con otro nombre o cambiá los filtros." : status === "inactive" ? "Los contactos desactivados aparecen aquí." : "Podés agregar el primero con Nuevo contacto."}</p>
          {search || type !== "all" ? <Link className="inline-flex min-h-10 items-center font-semibold text-[var(--color-brand-dark)]" href={status === "inactive" ? "/app/contactos?estado=inactivos" : "/app/contactos"}>Limpiar filtros</Link> : null}
        </div> : <ul aria-label="Lista de contactos" className="mt-3 grid gap-3 p-0">
          {contacts.map(contact => {
            const isEditing = editingId === contact.id;
            const details = extraDetails(contact);
            return <li className="min-w-0 list-none scroll-mt-6" id={`contacto-${contact.id}`} key={contact.id}><details className="group min-w-0 rounded-xl border border-[var(--color-border)] bg-white open:border-[var(--color-brand)]" open={isEditing}>
              <summary className="flex min-h-20 cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold">{contact.name}</span><span className="mt-1 block break-words text-xs text-[var(--color-muted)]">{typeLabel(contact.type)}{contact.specialty ? ` · ${contact.specialty}` : ""}</span></span>
                <span className="min-w-0 basis-full break-words text-sm text-[var(--color-foreground)] sm:basis-auto">{contact.phone ? <span className="block">{contact.phone}</span> : null}{contact.hours ? <span className="block text-[var(--color-muted)]">{contact.hours}</span> : null}</span>
                <span className="text-sm font-semibold text-[var(--color-brand-dark)] group-open:hidden">Más datos ↓</span><span className="hidden text-sm font-semibold text-[var(--color-brand-dark)] group-open:inline">Menos datos ↑</span>
              </summary>
              <div className="min-w-0 border-t border-[var(--color-border)] px-4 py-4">
                {isEditing ? <div><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="m-0 scroll-mt-6 text-lg" id={`editar-contacto-${contact.id}`} tabIndex={-1}>Editar contacto</h3><div className="flex flex-wrap items-center gap-2"><Link className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-[var(--color-brand-dark)]" href={`${directoryPath}#contacto-${contact.id}`}>Cancelar</Link><ContactStatusForm contact={contact} directory={directory} /></div></div><ContactForm contact={contact} directory={directory} /></div> : <>
                  {details.length ? <dl className="grid gap-3 sm:grid-cols-2">{details.map(([label, value]) => <div className="min-w-0" key={label}><dt className="text-xs font-semibold text-[var(--color-muted)]">{label}</dt><dd className="mt-1 ml-0 break-words text-sm">{value}</dd></div>)}</dl> : <p className="m-0 text-sm text-[var(--color-muted)]">No hay más datos cargados.</p>}
                  <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--color-brand-dark)]" href={`${withParam(directoryPath, "editar", contact.id)}#editar-contacto-${contact.id}`}>Editar</Link>
                </>}
              </div>
            </details></li>;
          })}
        </ul>}
      </section>
  </main>;
}
