import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  Printer,
  SmilePlus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OdontoSync | Organización para odontólogos independientes",
  description:
    "Agenda, disponibilidad y materiales imprimibles para organizar el trabajo diario del consultorio.",
};

const features = [
  {
    title: "Agenda flexible",
    description:
      "Organizá turnos, especialidades y tiempos de acondicionamiento según tu forma de trabajar.",
    icon: CalendarDays,
  },
  {
    title: "Imprimibles útiles",
    description:
      "Accedé a planes de tratamiento y odontogramas preparados para completar en papel.",
    icon: Printer,
  },
  {
    title: "Indicaciones ordenadas",
    description:
      "Encontrá indicaciones generales agrupadas por área odontológica, sin asociarlas a pacientes.",
    icon: ClipboardList,
  },
];

const demoAppointments = [
  { time: "09:00", area: "Odontología general", status: "Confirmado" },
  { time: "10:30", area: "Ortodoncia", status: "Pendiente" },
  { time: "12:00", area: "Horario disponible", status: "Libre" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-background)]">
      <header className="relative z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          className="flex items-center gap-3 text-[var(--color-foreground)] no-underline"
          href="/"
        >
          <span className="grid size-10 place-items-center rounded-[0.8rem] bg-[var(--color-brand)] text-white">
            <SmilePlus aria-hidden="true" size={22} strokeWidth={1.8} />
          </span>
          <span className="flex flex-col">
            <strong className="text-[0.95rem] tracking-[-0.02em]">
              OdontoSync
            </strong>
            <small className="text-[0.65rem] text-[var(--color-muted)]">
              Gestión odontológica
            </small>
          </span>
        </Link>

        <nav
          aria-label="Navegación de la presentación"
          className="hidden items-center gap-8 text-sm text-[var(--color-muted)] md:flex"
        >
          <a
            className="transition-colors hover:text-[var(--color-brand)]"
            href="#funciones"
          >
            Funciones
          </a>
          <a
            className="transition-colors hover:text-[var(--color-brand)]"
            href="#alcance"
          >
            Alcance
          </a>
        </nav>

        <Link
          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[0.68rem] font-bold text-[var(--color-brand-dark)] no-underline transition-colors hover:border-[var(--color-brand)] sm:px-4 sm:text-xs"
          href="/ingresar"
        >
          Ingresar
        </Link>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-14 px-5 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-48 size-[34rem] rounded-full bg-[var(--color-brand-soft)] blur-3xl"
        />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3.5 py-2 text-[0.68rem] font-bold tracking-[0.1em] text-[var(--color-brand)] uppercase shadow-sm">
            <span className="size-1.5 rounded-full bg-[var(--color-brand)]" />
            Para odontólogos independientes
          </p>
          <h1 className="m-0 text-[clamp(2.65rem,6vw,5.2rem)] leading-[0.98] font-bold tracking-[-0.065em] text-[var(--color-foreground)]">
            Tu consultorio en orden.{" "}
            <span className="text-[var(--color-brand)]">
              Tu tiempo donde importa.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg md:leading-8">
            OdontoSync reúne agenda, disponibilidad y materiales imprimibles en
            un espacio simple, pensado para quienes atienden y gestionan su
            consultorio.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 text-sm font-bold text-white no-underline shadow-[0_0.65rem_1.8rem_rgb(20_125_115/18%)] transition-colors hover:bg-[var(--color-brand-dark)]"
              href="/registro"
            >
              Crear cuenta
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-5 text-sm font-bold text-[var(--color-foreground)] transition-colors hover:border-[var(--color-brand)]"
              href="#funciones"
            >
              Conocer las funciones
            </a>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <FileText
              aria-hidden="true"
              className="text-[var(--color-brand)]"
              size={15}
            />
            Versión académica: utiliza exclusivamente datos ficticios.
          </p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-xl lg:ml-auto">
          <div className="absolute -inset-4 rotate-2 rounded-[2rem] bg-[var(--color-brand-soft)]" />
          <article className="relative rounded-[1.75rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_2rem_5rem_rgb(28_66_61/14%)] md:p-7">
            <header className="flex items-center justify-between border-b border-[var(--color-border)] pb-5">
              <div>
                <p className="m-0 text-[0.65rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                  Agenda
                </p>
                <h2 className="mt-1.5 mb-0 text-xl tracking-[-0.035em]">
                  Resumen de hoy
                </h2>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <CalendarDays aria-hidden="true" size={21} />
              </span>
            </header>

            <div className="flex flex-col">
              {demoAppointments.map((appointment) => (
                <div
                  className="grid min-h-20 grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-[var(--color-border)] last:border-b-0"
                  key={appointment.time}
                >
                  <time className="text-xs font-bold">{appointment.time}</time>
                  <span className="flex min-w-0 flex-col gap-1">
                    <strong className="overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                      {appointment.area}
                    </strong>
                    <small className="text-[0.65rem] text-[var(--color-muted)]">
                      Datos de demostración
                    </small>
                  </span>
                  <span className="hidden rounded-full bg-[var(--color-brand-subtle)] px-2.5 py-1.5 text-[0.62rem] font-bold text-[var(--color-brand-dark)] sm:inline">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>

            <footer className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-4 py-3 text-xs text-[var(--color-muted)]">
              <Clock3
                aria-hidden="true"
                className="shrink-0 text-[var(--color-brand)]"
                size={17}
              />
              Incluye tiempo de acondicionamiento entre turnos.
            </footer>
          </article>
        </div>
      </section>

      <section
        className="border-y border-[var(--color-border)] bg-white py-20 md:py-28"
        id="funciones"
      >
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
              Lo esencial, en un solo lugar
            </p>
            <h2 className="m-0 text-3xl leading-tight tracking-[-0.045em] md:text-5xl">
              Herramientas para el trabajo cotidiano.
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--color-muted)]">
              Una base clara para organizar el consultorio sin convertirla en
              una historia clínica digital.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <article
                className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-7"
                key={title}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                  <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 mb-0 text-lg tracking-[-0.025em]">
                  {title}
                </h3>
                <p className="mt-3 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center"
        id="alcance"
      >
        <div>
          <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Un alcance consciente
          </p>
          <h2 className="m-0 max-w-xl text-3xl leading-tight tracking-[-0.045em] md:text-5xl">
            Organización administrativa, sin registrar información clínica.
          </h2>
        </div>

        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
          <ul className="m-0 flex list-none flex-col gap-5 p-0">
            {[
              "Agenda configurable para la dinámica del consultorio.",
              "Plantillas en blanco para completar y conservar en papel.",
              "Indicaciones generales organizadas por área odontológica.",
              "Prototipo académico limitado a información ficticia.",
            ].map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                  <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                </span>
                <span className="text-sm leading-6 text-[var(--color-muted)]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-7 rounded-[2rem] bg-[var(--color-foreground)] p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.12em] text-[#91d8d0] uppercase">
              Prototipo en evolución
            </p>
            <h2 className="mt-3 mb-0 max-w-2xl text-2xl tracking-[-0.04em] md:text-4xl">
              Conocé la experiencia inicial de OdontoSync.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[var(--color-foreground)] no-underline hover:bg-[var(--color-brand-soft)]"
            href="/registro"
          >
            Crear cuenta
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© 2026 OdontoSync</span>
          <span>Proyecto académico · No ingreses datos de pacientes reales</span>
        </div>
      </footer>
    </main>
  );
}
