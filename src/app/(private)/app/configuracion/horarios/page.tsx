import { WeeklyAvailabilityForm } from "@/components/weekly-availability-form";
import { defaultInitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";

export default async function AvailabilityConfigurationPage() {
  const configuration = (await getInitialConfiguration()) ?? defaultInitialConfiguration;

  return (
    <section aria-labelledby="availability-configuration-title">
      <h2 className="m-0 text-xl tracking-[-0.03em] sm:text-2xl" id="availability-configuration-title">Horarios habituales</h2>
      <p className="mt-1.5 mb-4 text-sm leading-6 text-[var(--color-muted)] sm:mt-2 sm:mb-5">
        Esta semana base determina qué horarios aparecen disponibles en la agenda.
      </p>
      <WeeklyAvailabilityForm initialAvailability={configuration.availability} />
    </section>
  );
}
