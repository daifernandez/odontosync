"use client";

import { CalendarPlus, Settings2, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { AppointmentForm } from "@/components/appointment-form";
import {
  buildAgendaPath,
  type AgendaView,
} from "@/modules/agenda/domain/weekly-schedule";
import type {
  AppointmentOccupancy,
  ExceptionalBlockOccupancy,
} from "@/modules/appointments/domain/availability";
import type { AvailabilityBlock } from "@/modules/initial-configuration/domain/initial-configuration";
import type { Patient } from "@/modules/patients/domain/patient";

type AppointmentPatientOption = Pick<
  Patient,
  "id" | "firstName" | "lastName"
>;

export function AppointmentPanel({
  autoOpen,
  appointmentOccupancy,
  availability,
  created,
  currentTime,
  exceptionalBlocks,
  initialPatientId,
  patients,
  defaultDurationMinutes,
  defaultCleanupMinutes,
  gridIntervalMinutes,
  initialDate,
  initialTime,
  minimumDate,
  selectedDate,
  view = "week",
  weekStartDate,
}: Readonly<{
  autoOpen: boolean;
  appointmentOccupancy: AppointmentOccupancy[];
  availability: AvailabilityBlock[];
  created: boolean;
  currentTime: string;
  exceptionalBlocks: ExceptionalBlockOccupancy[];
  initialPatientId?: string;
  patients: AppointmentPatientOption[];
  defaultDurationMinutes: number;
  defaultCleanupMinutes: number;
  gridIntervalMinutes: number;
  initialDate?: string;
  initialTime?: string;
  minimumDate: string;
  selectedDate?: string;
  view?: AgendaView;
  weekStartDate: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (autoOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [autoOpen]);

  function openPanel() {
    dialogRef.current?.showModal();
  }

  function closePanel() {
    dialogRef.current?.close();
  }

  function clearPanelQuery() {
    if (autoOpen) {
      router.replace(
        buildAgendaPath({ weekStartDate, view, selectedDate }),
        { scroll: false },
      );
    }
  }

  return (
    <>
      <button
        className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-brand)] px-4 text-sm font-bold text-white shadow-[0_0.45rem_1.2rem_rgb(20_125_115/18%)] hover:bg-[var(--color-brand-dark)] sm:w-auto"
        onClick={openPanel}
        type="button"
      >
        <CalendarPlus aria-hidden="true" size={17} />
        Nuevo turno
      </button>

      <dialog
        aria-labelledby="new-appointment-title"
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-xl overflow-hidden border-0 bg-white p-0 text-[var(--color-foreground)] shadow-[-1rem_0_3rem_rgb(24_51_48/18%)] backdrop:bg-[rgb(24_51_48/45%)]"
        id="nuevo-turno"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePanel();
          }
        }}
        onClose={clearPanelQuery}
        ref={dialogRef}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 md:px-7">
            <div>
              <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--color-brand)] uppercase">
                Agenda
              </p>
              <h2 className="m-0 text-2xl" id="new-appointment-title">
                Nuevo turno
              </h2>
              <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                Revisá los datos antes de guardar el turno como pendiente.
              </p>
            </div>
            <button
              aria-label="Cerrar nuevo turno"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-dark)]"
              onClick={closePanel}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
            {patients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-6 text-center">
                <UsersRound
                  aria-hidden="true"
                  className="mx-auto text-[var(--color-brand)]"
                  size={28}
                />
                <h3 className="mt-3 mb-0 text-base">
                  Primero necesitás un paciente
                </h3>
                <p className="mt-2 mb-0 text-sm leading-6 text-[var(--color-muted)]">
                  Solo podés asociar pacientes ficticios que estén activos.
                </p>
                <Link
                  className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-brand-dark)] no-underline hover:bg-[var(--color-brand-soft)]"
                  href="/app/pacientes"
                >
                  Ir a pacientes
                </Link>
              </div>
            ) : (
              <AppointmentForm
                appointmentOccupancy={appointmentOccupancy}
                availability={availability}
                created={created}
                currentTime={currentTime}
                defaultCleanupMinutes={defaultCleanupMinutes}
                defaultDurationMinutes={defaultDurationMinutes}
                gridIntervalMinutes={gridIntervalMinutes}
                exceptionalBlocks={exceptionalBlocks}
                initialDate={initialDate}
                initialPatientId={initialPatientId}
                initialTime={initialTime}
                minimumDate={minimumDate}
                onClose={closePanel}
                patients={patients}
                selectedDate={selectedDate ?? weekStartDate}
                view={view}
                weekStartDate={weekStartDate}
              />
            )}

            <Link
              className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-brand-dark)]"
              href="/app/configuracion#agenda"
            >
              <Settings2 aria-hidden="true" size={16} />
              Ajustar duración y acondicionamiento habituales
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
