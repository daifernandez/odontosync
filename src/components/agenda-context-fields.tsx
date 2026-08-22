import type { AgendaView } from "@/modules/agenda/domain/weekly-schedule";

export function AgendaContextFields({
  selectedDate,
  view,
  weekStartDate,
}: {
  selectedDate: string;
  view: AgendaView;
  weekStartDate: string;
}) {
  return (
    <>
      <input name="weekStartDate" type="hidden" value={weekStartDate} />
      <input name="agendaView" type="hidden" value={view} />
      <input name="agendaDate" type="hidden" value={selectedDate} />
    </>
  );
}
