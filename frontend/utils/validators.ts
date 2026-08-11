import { EventFormData } from '@/types/event';

// Returns an error message in Indonesian, or null when the form is valid.
export function validateEventForm(form: EventFormData): string | null {
  if (!form.nama_event.trim()) return 'Nama event wajib diisi';

  const numericFields: (keyof EventFormData)[] = [
    'jumlah_peserta',
    'biaya_registrasi',
    'target_pemasukan',
    'budget',
    'prize_pool'
  ];

  for (const field of numericFields) {
    const value = form[field];
    if (value !== '' && isNaN(Number(value))) {
      return `${field} harus berupa angka`;
    }
  }

  if (form.tanggal_mulai && form.tanggal_selesai && form.tanggal_mulai > form.tanggal_selesai) {
    return 'Tanggal mulai tidak boleh setelah tanggal selesai';
  }

  return null;
}
