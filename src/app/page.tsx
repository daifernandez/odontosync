const mvpFeatures = [
  "Agenda y disponibilidad",
  "Pacientes ficticios",
  "Búsqueda de turnos asistida",
  "Materiales imprimibles",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
      <section
        aria-labelledby="page-title"
        className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] sm:p-12"
      >
        <p className="mb-4 text-sm font-semibold tracking-[0.16em] text-[var(--color-brand)] uppercase">
          Prototipo académico
        </p>
        <h1
          id="page-title"
          className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-6xl"
        >
          La organización diaria del consultorio, en un solo lugar.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
          OdontoSync comienza como una herramienta para odontólogos
          independientes, enfocada en la agenda, la disponibilidad y los
          materiales imprimibles.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {mvpFeatures.map((feature) => (
            <li
              key={feature}
              className="rounded-[var(--radius-medium)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)]"
            >
              {feature}
            </li>
          ))}
        </ul>

        <aside className="mt-10 rounded-[var(--radius-medium)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4 text-sm leading-6 text-[var(--color-warning-foreground)]">
          Esta versión admite únicamente información ficticia. No ingreses datos
          de pacientes reales.
        </aside>
      </section>
    </main>
  );
}
