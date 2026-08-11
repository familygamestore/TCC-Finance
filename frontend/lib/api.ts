const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${BASE_URL}?${query}`, { cache: 'no-store' });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request gagal');
  return json.data as T;
}

// Apps Script Web App hanya menerima GET & POST secara native,
// jadi PUT/DELETE dikirim sebagai POST dengan field "method".
// B dibuat generic (extends object) supaya bisa menerima tipe apa pun
// (Record<string, unknown>, EventPayload, dll) tanpa error assignability.
async function apiSend<T, B extends object = Record<string, unknown>>(
  action: string,
  body: B,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<T> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // hindari CORS preflight ke Apps Script
    body: JSON.stringify({ action, method, ...body })
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request gagal');
  return json.data as T;
}

export type Dashboard = {
  saldo: number;
  total_income: number;
  total_expense: number;
  jumlah_event: number;
  jumlah_transaksi: number;
  transaksi_terbaru: Transaction[];
};

export type Transaction = {
  transaction_id: string;
  type: 'income' | 'expense';
  tanggal: string;
  jam: string;
  kategori: string;
  event_id: string;
  nominal: number;
  metode_pembayaran: string;
  penginput: string;
  catatan: string;
  bukti: string;
  created_at: string;
  [key: string]: unknown;
};

export type EventItem = {
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
};

// Import EventPayload dari types/event supaya createEvent type-safe
import type { EventPayload } from '@/types/event';

export const api = {
  getDashboard: () => apiGet<Dashboard>('dashboard'),
  getTransactions: (params: Record<string, string> = {}) => apiGet<Transaction[]>('transactions', params),
  getEvents: (params: Record<string, string> = {}) => apiGet<EventItem[]>('events', params),
  getCategories: () => apiGet<{ category_id: string; nama_kategori: string; tipe: string }[]>('categories'),

  createIncome: (data: Record<string, unknown>) => apiSend('income', data, 'POST'),
  createExpense: (data: Record<string, unknown>) => apiSend('expense', data, 'POST'),

  // Sekarang menerima EventPayload langsung — tidak dipaksa ke Record<string, unknown>
  createEvent: (data: EventPayload) => apiSend<EventItem, EventPayload>('event', data, 'POST'),

  updateTransaction: (sheet: 'income' | 'expense', id: string, fields: Record<string, unknown>) =>
    apiSend('transaction', { sheet, id, fields }, 'PUT'),
  deleteTransaction: (sheet: 'income' | 'expense', id: string) =>
    apiSend('transaction', { sheet, id }, 'DELETE'),

  updateEvent: (id: string, fields: Record<string, unknown>) => apiSend('event', { id, fields }, 'PUT'),
  deleteEvent: (id: string) => apiSend('event', { id }, 'DELETE')
};
