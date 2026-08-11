import { EventFormData } from '@/types/event';

export const EMPTY_EVENT_FORM: EventFormData = {
  nama_event: '',
  game: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  jumlah_peserta: '',
  biaya_registrasi: '',
  target_pemasukan: '',
  budget: '',
  prize_pool: ''
};

// Single source of truth for the create-event form: EventForm renders
// this list instead of hardcoding nine <label>/<input> pairs.
export const EVENT_FORM_FIELDS: {
  name: keyof EventFormData;
  label: string;
  type: 'text' | 'date' | 'number';
  required?: boolean;
}[] = [
  { name: 'nama_event', label: 'Nama event', type: 'text', required: true },
  { name: 'game', label: 'Game', type: 'text' },
  { name: 'tanggal_mulai', label: 'Tanggal mulai', type: 'date' },
  { name: 'tanggal_selesai', label: 'Tanggal selesai', type: 'date' },
  { name: 'jumlah_peserta', label: 'Jumlah peserta', type: 'number' },
  { name: 'biaya_registrasi', label: 'Biaya registrasi (Rp)', type: 'number' },
  { name: 'target_pemasukan', label: 'Target pemasukan (Rp)', type: 'number' },
  { name: 'budget', label: 'Budget (Rp)', type: 'number' },
  { name: 'prize_pool', label: 'Prize pool (Rp)', type: 'number' }
];

export const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Akan datang',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const EVENT_TABLE_COLUMNS = ['Nama', 'Game', 'Tanggal', 'Budget', 'Status', ''];
