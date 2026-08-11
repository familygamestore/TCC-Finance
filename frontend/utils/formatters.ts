export function formatRupiah(n: number): string {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export function formatDateRange(start: string, end: string): string {
  if (!start && !end) return '-';
  return `${start || '?'} - ${end || '?'}`;
}
