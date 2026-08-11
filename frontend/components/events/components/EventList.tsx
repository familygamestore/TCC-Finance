import { EventItem } from '@/types/event';
import { EVENT_TABLE_COLUMNS } from '@/constants/eventConstants';
import EventRow from './EventRow';

interface EventListProps {
  events: EventItem[];
  onDelete: (id: string) => void;
}

export default function EventList({ events, onDelete }: EventListProps) {
  return (
    <>
      <h2>Daftar event</h2>
      <table>
        <thead>
          <tr>
            {EVENT_TABLE_COLUMNS.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <EventRow key={ev.event_id} event={ev} onDelete={onDelete} />
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={EVENT_TABLE_COLUMNS.length} className="muted">
                Belum ada event.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
