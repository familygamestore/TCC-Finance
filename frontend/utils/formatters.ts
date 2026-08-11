export function formatRupiah(n: number | string | null | undefined): string {
  const value = Number(n) || 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function parseLocalDate(value: string | Date): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  if (!raw) return null;
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const raw = String(value);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  const d = parseLocalDate(value);
  if (!d) return raw;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

export function formatTimeOnly(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const raw = String(value).trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) return raw.slice(0, 8);
  const d = parseLocalDate(value);
  if (!d) return raw;
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
}

export function formatDateTimeDisplay(date: string | Date | null | undefined, time?: string | Date | null): string {
  if (!date && !time) return '-';
  const dateText = formatDateOnly(date);
  const timeText = time ? formatTimeOnly(time) : '';
  return timeText && timeText !== '-' ? `${dateText} • ${timeText}` : dateText;
}

export function formatDateRange(start: string, end: string): string {
  if (!start && !end) return '-';
  return `${formatDateOnly(start)} — ${formatDateOnly(end)}`;
}
