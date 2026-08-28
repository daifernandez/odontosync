"use client";

import { CalendarDays, CalendarOff, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  buildAgendaPath,
  type AgendaMonth,
} from "@/modules/agenda/domain/weekly-schedule";
import type { AppointmentSpecialty } from "@/modules/appointments/domain/appointment";

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const weekDayLabels = [
  ["Lun", "Lunes"],
  ["Mar", "Martes"],
  ["Mié", "Miércoles"],
  ["Jue", "Jueves"],
  ["Vie", "Viernes"],
  ["Sáb", "Sábado"],
  ["Dom", "Domingo"],
] as const;

const monthlySpecialties = [
  {
    value: "restorative",
    label: "Operatoria / restauradora",
    shortLabel: "Operatoria",
    mobileLabel: "Oper.",
    className: "bg-[#ddf3ef] text-[#0f675e]",
  },
  {
    value: "pediatric_dentistry",
    label: "Odontopediatría",
    shortLabel: "Odontoped.",
    mobileLabel: "Odont.",
    className: "bg-[#fbf0dc] text-[#805000]",
  },
  {
    value: "orthodontics",
    label: "Ortodoncia",
    shortLabel: "Ortod.",
    mobileLabel: "Ortod.",
    className: "bg-[#e7eefb] text-[#355da0]",
  },
  {
    value: "surgery",
    label: "Cirugía",
    shortLabel: "Cirugía",
    mobileLabel: "Cir.",
    className: "bg-[#fbe8df] text-[#914327]",
  },
  {
    value: "implantology",
    label: "Implantología",
    shortLabel: "Impl.",
    mobileLabel: "Impl.",
    className: "bg-[#e8edf0] text-[#425a63]",
  },
  {
    value: "endodontics",
    label: "Endodoncia",
    shortLabel: "Endo.",
    mobileLabel: "Endo.",
    className: "bg-[#f1e8f7] text-[#6c4682]",
  },
  {
    value: "periodontics",
    label: "Periodoncia",
    shortLabel: "Perio.",
    mobileLabel: "Perio.",
    className: "bg-[#eaf3e2] text-[#4f6f34]",
  },
  {
    value: "prosthodontics",
    label: "Prótesis / rehabilitación",
    shortLabel: "Prótesis",
    mobileLabel: "Prót.",
    className: "bg-[#e2f2f5] text-[#286878]",
  },
  {
    value: "control",
    label: "Control",
    shortLabel: "Control",
    mobileLabel: "Ctrl.",
    className: "bg-[#edf2f1] text-[#455f5c]",
  },
  {
    value: "aesthetic",
    label: "Estética",
    shortLabel: "Estética",
    mobileLabel: "Est.",
    className: "bg-[#f8e6ef] text-[#8c4168]",
  },
  {
    value: "whitening",
    label: "Blanqueamiento",
    shortLabel: "Blanq.",
    mobileLabel: "Blanq.",
    className: "bg-[#fff5c9] text-[#765e00]",
  },
] as const;

type MonthlySpecialty = (typeof monthlySpecialties)[number];

function getSpecialtySummaries(
  counts: Partial<Record<AppointmentSpecialty, number>>,
) {
  return monthlySpecialties
    .map((specialty, order) => ({
      ...specialty,
      count:
        (counts[specialty.value] ?? 0) +
        (specialty.value === "restorative" ? (counts.general ?? 0) : 0),
      order,
    }))
    .filter((specialty) => specialty.count > 0)
    .sort(
      (first, second) =>
        second.count - first.count || first.order - second.order,
    );
}

function specialtyCountLabel(
  specialty: Pick<MonthlySpecialty, "label"> & { count: number },
) {
  return `${specialty.count} ${specialty.count === 1 ? "turno" : "turnos"} de ${specialty.label}`;
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function MonthlyAgendaDaySelector({
  appointmentSpecialtyCounts,
  blockCounts,
  currentDate,
  month,
}: Readonly<{
  appointmentSpecialtyCounts: Record<
    string,
    Partial<Record<AppointmentSpecialty, number>>
  >;
  blockCounts: Record<string, number>;
  currentDate: string;
  month: AgendaMonth;
}>) {
  const initialSelectedDate = month.days.some(
    (day) => day.isCurrentMonth && day.date === currentDate,
  )
    ? currentDate
    : month.startDate;
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const selectedDateLabel = fullDateFormatter.format(
    new Date(`${selectedDate}T12:00:00-03:00`),
  );
  const selectedDayPath = buildAgendaPath({
    weekStartDate: selectedDate,
    view: "day",
    selectedDate,
  });
  const canCreateForSelectedDate = selectedDate >= currentDate;

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="m-0 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
            Día para gestionar
          </p>
          <p aria-live="polite" className="mt-1 mb-0 text-sm font-bold">
            {capitalizeFirst(selectedDateLabel)}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
              href={selectedDayPath}
            >
              <CalendarDays aria-hidden="true" size={17} />
              Abrir agenda diaria
            </Link>
            {canCreateForSelectedDate ? (
              <>
                <Link
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-4 text-sm font-bold text-white no-underline shadow-[0_0.45rem_1.2rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)]"
                  href={`${buildAgendaPath({
                    weekStartDate: selectedDate,
                    view: "day",
                    selectedDate,
                    params: { nuevo: "1" },
                  })}#nuevo-turno`}
                >
                  <CalendarPlus aria-hidden="true" size={17} />
                  Nuevo turno
                </Link>
                <Link
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                  href={buildAgendaPath({
                    weekStartDate: selectedDate,
                    view: "day",
                    selectedDate,
                    params: { bloqueos: "1" },
                  })}
                >
                  <CalendarOff aria-hidden="true" size={17} />
                  Bloquear horario
                </Link>
              </>
            ) : null}
          </div>
          {!canCreateForSelectedDate ? (
            <p
              className="m-0 px-1 text-right text-xs leading-5 text-[var(--color-muted)]"
              role="note"
            >
              Nota: en los días pasados podés consultar turnos y registrar
              resultados pendientes.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-brand-subtle)]">
        {weekDayLabels.map(([shortLabel, label]) => (
          <div className="px-1 py-3 text-center text-xs font-bold" key={label}>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-[var(--color-border)]">
        {month.days.map((day) => {
          const specialtySummaries = getSpecialtySummaries(
            appointmentSpecialtyCounts[day.date] ?? {},
          );
          const appointmentCount = specialtySummaries.reduce(
            (total, specialty) => total + specialty.count,
            0,
          );
          const blockCount = blockCounts[day.date] ?? 0;
          const appointmentText = countLabel(
            appointmentCount,
            "turno",
            "turnos",
          );
          const blockText = countLabel(blockCount, "bloqueo", "bloqueos");
          const accessibleAppointmentText =
            specialtySummaries.length > 0
              ? `${specialtySummaries.map(specialtyCountLabel).join(". ")}.`
              : `${appointmentText}.`;
          const visibleSpecialties = specialtySummaries.slice(0, 3);
          const hiddenSpecialtyCount =
            specialtySummaries.length - visibleSpecialties.length;
          const date = new Date(`${day.date}T12:00:00-03:00`);

          return (
            <button
              aria-current={day.date === currentDate ? "date" : undefined}
              aria-label={`${fullDateFormatter.format(date)}. ${day.isCurrentMonth ? `${accessibleAppointmentText} ${blockText}. ` : ""}Seleccionar día.`}
              aria-pressed={day.date === selectedDate}
              className={`min-h-24 cursor-pointer border-t-0 border-r border-b border-l-0 border-[var(--color-border)] p-0.5 text-left text-[var(--color-foreground)] hover:bg-[var(--color-brand-soft)] focus-visible:z-10 sm:min-h-32 sm:p-3 ${day.date === selectedDate ? "bg-[var(--color-brand-soft)] ring-2 ring-inset ring-[var(--color-brand)]" : day.isCurrentMonth ? "bg-white" : "bg-[var(--color-brand-subtle)] text-[var(--color-muted)]"}`}
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              type="button"
            >
              <span
                className={`grid size-7 place-items-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${day.date === currentDate ? "bg-[var(--color-brand)] text-white" : ""}`}
              >
                {day.dayOfMonth}
              </span>
              {day.isCurrentMonth &&
              (appointmentCount > 0 || blockCount > 0) ? (
                <span className="mt-1.5 flex flex-col gap-1 sm:mt-3">
                  {appointmentCount > 0 ? (
                    <>
                      {visibleSpecialties.map((specialty) => (
                        <span
                          className={`rounded-md px-1 py-1 text-center text-[0.55rem] leading-3 font-bold sm:text-[0.68rem] ${specialty.className}`}
                          data-label={`${specialty.shortLabel} · ${specialty.count}`}
                          data-specialty={specialty.value}
                          key={specialty.value}
                        >
                          <span className="sm:hidden">
                            <span className="block">{specialty.mobileLabel}</span>
                            <span className="block">{specialty.count}</span>
                          </span>
                          <span className="hidden sm:inline">
                            {specialty.shortLabel} · {specialty.count}
                          </span>
                        </span>
                      ))}
                      {hiddenSpecialtyCount > 0 ? (
                        <span className="rounded-md bg-[var(--color-neutral-soft)] px-1 py-1 text-center text-[0.55rem] leading-3 font-bold text-[var(--color-muted)] sm:text-[0.68rem]">
                          +{hiddenSpecialtyCount}{" "}
                          {hiddenSpecialtyCount === 1
                            ? "especialidad"
                            : "especialidades"}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                  {blockCount > 0 ? (
                    <span className="rounded-md bg-[var(--color-neutral-soft)] px-1 py-1 text-center text-[0.58rem] leading-3 font-bold text-[var(--color-muted)] sm:text-[0.68rem]">
                      {blockText}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
