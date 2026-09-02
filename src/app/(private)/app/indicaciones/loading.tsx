export default function InstructionsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando indicaciones"
      className="mx-auto w-full max-w-[90rem] animate-pulse px-3 py-5 motion-reduce:animate-none md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12"
    >
      <div className="h-52 rounded-[1.5rem] bg-[#d9e8e5] md:h-44 md:rounded-[1.75rem]" />
      <div className="mt-4 grid gap-2 md:mt-6 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-8">
        <div className="h-11 border-b border-[var(--color-border)]" />
        <div className="h-11 border-b border-[var(--color-border)]" />
      </div>
      <div className="mt-8 md:mt-14">
        <div className="mb-3 h-6 w-44 rounded-lg bg-[#d9e8e5]" />
        <div className="min-h-24 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white sm:min-h-32" />
      </div>
    </main>
  );
}
