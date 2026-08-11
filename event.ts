export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventItem {
  event_id: string;
  nama_event: string;
  game: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_peserta: number;
  biaya_registrasi: number;
  target_pemasukan: number;
  budget: number;
  prize_pool: number;
  status: string;
}

// Shape of the controlled form state (all values are strings, since they
// come straight out of <input> elements before being cast to numbers).
export interface EventFormData {
  nama_event: string;
  game: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_peserta: string;
  biaya_registrasi: string;
  target_pemasukan: string;
  budget: string;
  prize_pool: string;
}

// Shape sent to the API: numeric fields converted from strings.
export interface EventPayload {
  nama_event: string;
  game: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_peserta: number;
  biaya_registrasi: number;
  target_pemasukan: number;
  budget: number;
  prize_pool: number;
}
