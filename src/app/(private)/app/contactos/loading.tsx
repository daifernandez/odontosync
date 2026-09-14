export default function ContactsLoading() {
  return <main aria-busy="true" aria-label="Cargando contactos" className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12">
    <p className="m-0 text-sm text-[var(--color-muted)]" role="status">Cargando contactos…</p>
    <div aria-hidden="true" className="mt-5 h-12 w-64 max-w-full animate-pulse rounded-xl bg-[var(--color-brand-soft)] motion-reduce:animate-none" />
    <div aria-hidden="true" className="mt-7 h-52 animate-pulse rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] motion-reduce:animate-none" />
  </main>;
}
