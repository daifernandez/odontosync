"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type DemoAppointment = {
  id: string;
  patient: string;
  specialty: string;
  status: "Confirmado" | "Pendiente";
  time: string;
};

export type DemoPatient = {
  id: string;
  lastVisit: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
};

const initialAppointments: DemoAppointment[] = [
  {
    id: "demo-appointment-1",
    patient: "Paciente de ejemplo",
    specialty: "Odontología general",
    status: "Confirmado",
    time: "09:00",
  },
  {
    id: "demo-appointment-2",
    patient: "Paciente de muestra",
    specialty: "Ortodoncia",
    status: "Pendiente",
    time: "10:30",
  },
];

const initialPatients: DemoPatient[] = [
  {
    id: "demo-patient-1",
    lastVisit: "12 ago 2026",
    name: "Paciente de ejemplo",
    phone: "11 0000 0001",
    status: "active",
  },
  {
    id: "demo-patient-2",
    lastVisit: "4 ago 2026",
    name: "Paciente de muestra",
    phone: "11 0000 0002",
    status: "active",
  },
  {
    id: "demo-patient-3",
    lastVisit: "18 jul 2026",
    name: "Paciente inactivo de prueba",
    phone: "11 0000 0003",
    status: "inactive",
  },
];

type DemoState = {
  addAppointment: (appointment: Omit<DemoAppointment, "id" | "status">) => void;
  addPatient: (patient: Pick<DemoPatient, "name" | "phone">) => void;
  appointments: DemoAppointment[];
  patients: DemoPatient[];
};

const DemoStateContext = createContext<DemoState | undefined>(undefined);

export function DemoStateProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [patients, setPatients] = useState(initialPatients);

  function addAppointment(
    appointment: Omit<DemoAppointment, "id" | "status">,
  ) {
    setAppointments((current) =>
      [
        ...current,
        {
          ...appointment,
          id: `demo-appointment-${current.length + 1}`,
          status: "Pendiente" as const,
        },
      ].toSorted((first, second) => first.time.localeCompare(second.time)),
    );
  }

  function addPatient(patient: Pick<DemoPatient, "name" | "phone">) {
    setPatients((current) => [
      {
        ...patient,
        id: `demo-patient-${current.length + 1}`,
        lastVisit: "Sin turnos",
        status: "active",
      },
      ...current,
    ]);
  }

  return (
    <DemoStateContext value={{ addAppointment, addPatient, appointments, patients }}>
      {children}
    </DemoStateContext>
  );
}

export function useDemoState() {
  const state = useContext(DemoStateContext);

  if (!state) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }

  return state;
}
