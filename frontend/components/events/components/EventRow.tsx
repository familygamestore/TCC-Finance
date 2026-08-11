import { EventItem } from '@/types/event';
import { formatRupiah, formatDateRange } from '@/utils/formatters';
import { EVENT_STATUS_LABELS } from '@/constants/eventConstants';

interface EventRowProps {
  event: EventItem;
  onDelete: (id: string) => void;
}

export default function EventRow({ event, onDelete }: EventRowProps) {
  return (
    <tr>
      <td>{event.nama_event}</td>
      <td>{event.game}</td>
      <td>{formatDateRange(event.tanggal_mulai, event.tanggal_selesai)}</td>
      <td>{formatRupiah(event.budget)}</td>
      <td>{EVENT_STATUS_LABELS[event.status] || event.status}</td>
      <td className="row-actions">
        <button onClick={() => onDelete(event.event_id)}>Hapus</button>
      </td>
    </tr>
  );
}
