import { AgendaPreferencesForm } from "@/components/agenda-preferences-form";
import { defaultInitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export default async function AgendaConfigurationPage() {
  const configuration = (await getInitialConfiguration()) ?? defaultInitialConfiguration;

  return (
    <section aria-labelledby="agenda-configuration-title">
      <h2 className="m-0 text-2xl leading-tight tracking-[-0.03em] sm:text-[1.75rem]" id="agenda-configuration-title">Preferencias de agenda</h2>
      <p className="mt-1.5 mb-4 text-sm leading-6 text-[var(--color-muted)] sm:mt-2 sm:mb-5">
        Definí los valores que se completan automáticamente al crear turnos.
      </p>
      <AgendaPreferencesForm
        initialPreferences={{
          gridIntervalMinutes: configuration.gridIntervalMinutes,
          defaultAppointmentDurationMinutes: configuration.defaultAppointmentDurationMinutes,
          defaultCleanupMinutes: configuration.defaultCleanupMinutes,
        }}
      />
    </section>
  );
}
