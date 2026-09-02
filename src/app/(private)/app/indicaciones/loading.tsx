export default function InstructionsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando indicaciones"
      className="mx-auto w-full max-w-[90rem] animate-pulse px-4 py-7 md:px-[clamp(1.5rem,3.5vw,4rem)] md:py-12"
    >
      <div className="h-64 rounded-[2rem] bg-[#d9e8e5]" />
      <div className="mt-7 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="h-64 rounded-[var(--radius-large)] bg-white" />
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-56 rounded-[var(--radius-large)] bg-white" />
          <div className="h-56 rounded-[var(--radius-large)] bg-white" />
        </div>
      </div>
    </main>
  );
}
