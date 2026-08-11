const BASE_URL = '/api/apps-script';

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

function getBaseUrl() { return BASE_URL; }

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Server mengembalikan respons tidak valid (${res.status}).`);
  }
  if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
  return json;
}

async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${getBaseUrl()}?${query}`, { cache: 'no-store' });
  const json = await parseResponse<T>(res);
  if (!json.success) throw new Error(json.error || 'Request gagal');
  return json.data as T;
}

// Apps Script Web App menerima GET/POST; PUT/DELETE dipetakan lewat field method.
// B dibuat generic (extends object) supaya bisa menerima tipe apa pun sebagai body
// (Record<string, unknown>, EventPayload, dll) tanpa error assignability seperti sebelumnya.
async function apiSend<T, B extends object = Record<string, unknown>>(
  action: string,
  body: B,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<T> {
  const res = await fetch(getBaseUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, method, ...body })
  });
  const json = await parseResponse<T>(res);
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

// EventItem & EventPayload diimpor dari types/event supaya tidak ada
// definisi ganda dan supaya createEvent bisa type-safe menerima EventPayload.
import type { EventItem, EventPayload } from '@/types/event';
export type { EventItem };

export const api = {
  getDashboard: () => apiGet<Dashboard>('dashboard'),
  getTransactions: (params: Record<string, string> = {}) => apiGet<Transaction[]>('transactions', params),
  getEvents: (params: Record<string, string> = {}) => apiGet<EventItem[]>('events', params),
  getCategories: () => apiGet<{ category_id: string; nama_kategori: string; tipe: string }[]>('categories'),

  createIncome: (data: Record<string, unknown>) => apiSend('income', data),
  createExpense: (data: Record<string, unknown>) => apiSend('expense', data),

  // Menerima EventPayload langsung — tidak lagi dipaksa ke Record<string, unknown>
  createEvent: (data: EventPayload) => apiSend<EventItem, EventPayload>('event', data),

  updateTransaction: (sheet: 'income' | 'expense', id: string, fields: Record<string, unknown>) =>
    apiSend('transaction', { sheet, id, fields }, 'PUT'),
  deleteTransaction: (sheet: 'income' | 'expense', id: string) =>
    apiSend('transaction', { sheet, id }, 'DELETE'),

  updateEvent: (id: string, fields: Record<string, unknown>) => apiSend('event', { id, fields }, 'PUT'),
  deleteEvent: (id: string) => apiSend('event', { id }, 'DELETE')
};
