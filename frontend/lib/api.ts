const BASE_URL = '/api/apps-script';
const REQUEST_TIMEOUT_MS = 15000;

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

const TOKEN_KEY = 'tcc_super_admin_token';
const EMAIL_KEY = 'tcc_super_admin_email';
const REQUEST_ACCESS_KEY = 'tcc_request_access_token';
const ROLE_KEY = 'tcc_auth_role';
const USER_ID_KEY = 'tcc_auth_user_id';
const USER_NAME_KEY = 'tcc_auth_user_name';
const MUST_CHANGE_KEY = 'tcc_must_change_password';

// Fitur upgrade: localStorage bisa throw di browser privasi ketat (mode
// incognito tertentu / kebijakan perusahaan). Kalau itu terjadi, kita jatuh
// ke penyimpanan in-memory supaya sesi login tetap jalan untuk tab yang
// sedang aktif (tidak akan persist setelah refresh, tapi user tidak
// "terkunci" di layar loading walau sudah berhasil login di backend).
const memoryStore = new Map<string, string>();
let localStorageBroken = false;
const safeStorage = {
  get(key: string): string {
    if (typeof window === 'undefined') return '';
    if (localStorageBroken) return memoryStore.get(key) || '';
    try { return window.localStorage.getItem(key) || ''; }
    catch { localStorageBroken = true; return memoryStore.get(key) || ''; }
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    if (!localStorageBroken) {
      try { window.localStorage.setItem(key, value); return; }
      catch { localStorageBroken = true; }
    }
    memoryStore.set(key, value);
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
    memoryStore.delete(key);
  },
};

export function getSuperAdminToken(): string { return safeStorage.get(TOKEN_KEY); }
export function getSuperAdminEmail(): string { return safeStorage.get(EMAIL_KEY); }
export function saveAuthSession(token:string,email:string,role:string,userId?:string,userName?:string,mustChangePassword=false){
  safeStorage.set(TOKEN_KEY,token);
  safeStorage.set(EMAIL_KEY,email);
  safeStorage.set(ROLE_KEY,role);
  if(userId) safeStorage.set(USER_ID_KEY,userId);
  if(userName) safeStorage.set(USER_NAME_KEY,userName);
  safeStorage.set(MUST_CHANGE_KEY,mustChangePassword?'1':'0');
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tcc-auth-changed'));
}
export function saveSuperAdminSession(token: string, email: string) { saveAuthSession(token,email,'SUPER_ADMIN',email,email); }
export function clearSuperAdminSession() {
  if (typeof window === 'undefined') return;
  [TOKEN_KEY,EMAIL_KEY,ROLE_KEY,USER_ID_KEY,USER_NAME_KEY,MUST_CHANGE_KEY,REQUEST_ACCESS_KEY].forEach(k=>safeStorage.remove(k));
  window.dispatchEvent(new Event('tcc-auth-changed'));
}
export function getAuthRole(){return safeStorage.get(ROLE_KEY);}
export function getAuthUserId(){return safeStorage.get(USER_ID_KEY);}
export function mustChangePassword(){return safeStorage.get(MUST_CHANGE_KEY)==='1';}
export function getAuthUserName(){return safeStorage.get(USER_NAME_KEY);}
export function getAuthToken(){return getSuperAdminToken();}
export function getRequestAccessToken(): string { return safeStorage.get(REQUEST_ACCESS_KEY); }
export function saveRequestAccessToken(token: string) { safeStorage.set(REQUEST_ACCESS_KEY, token); }

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  let json: ApiResponse<T>;
  try { json = JSON.parse(text); } catch { throw new Error(`Server mengembalikan respons tidak valid (${res.status}).`); }
  if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
  return json;
}

async function apiGet<T>(action: string, params: Record<string, string> = {}, auth = false): Promise<T> {
  const all: Record<string, string> = { action, ...params };
  if (auth) all.token = getSuperAdminToken();
  const { signal, cancel } = withTimeout(REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}?${new URLSearchParams(all).toString()}`, { cache: 'no-store', signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Server tidak merespons (timeout). Coba lagi.');
    throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internet Anda.');
  } finally {
    cancel();
  }
  const json = await parseResponse<T>(res);
  if (!json.success) throw new Error(json.error || 'Request gagal');
  return json.data as T;
}

async function apiSend<T>(action: string, body: Record<string, unknown> = {}, method: 'POST'|'PUT'|'DELETE' = 'POST', auth = false): Promise<T> {
  const payload: Record<string, unknown> = { action, method, ...body };
  if (auth) payload.token = getSuperAdminToken();
  const { signal, cancel } = withTimeout(REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(BASE_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload), signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Server tidak merespons (timeout). Coba lagi.');
    throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internet Anda.');
  } finally {
    cancel();
  }
  const json = await parseResponse<T>(res);
  if (!json.success) throw new Error(json.error || 'Request gagal');
  return json.data as T;
}

export type Dashboard = { saldo:number; total_income:number; total_expense:number; jumlah_event:number; jumlah_transaksi:number; transaksi_terbaru:Transaction[]; cash_by_brand?:CashAccount[]; monthly_cashflow?:{key:string;label:string;income:number;expense:number}[] };
export type Category = { category_id:string; nama_kategori:string; tipe:string; status:string };
export type PaymentMethod = { id:string; nama:string; status:string };
export type Transaction = { transaction_id:string; type:'income'|'expense'; tanggal:string; jam:string; kategori:string; event_id:string; nominal:number; metode_pembayaran:string; penginput:string; catatan:string; bukti:string; created_at:string; brand_id:string; [key:string]:unknown };
export type Brand = { brand_id:string; nama_brand:string; status:string; created_at?:string };
export type CashAccount = { brand_id:string; nama_brand:string; saldo_awal:number; total_income:number; total_expense:number; saldo_sistem:number; saldo_aktual:number; updated_at:string };
export type FinanceRequest = { request_id:string; brand_id:string; user_id:string; user_name:string; type:'INCOME'|'EXPENSE'|'TOURNAMENT'|'SPONSOR'|'EVENT'; nama:string; kategori:string; event_id:string; nominal:number; metode_pembayaran:string; vendor:string; catatan:string; bukti:string; status:string; approved_by:string; approved_at:string; rejection_reason:string; created_at:string; game:string; kategori_event:string; sistem_turnamen:string; tanggal_mulai:string; tanggal_selesai:string; jumlah_peserta:number; biaya_registrasi:number; target_pemasukan:number; budget:number; prize_pool:number; whatsapp_url:string };
export type EventItem = { event_id:string; brand_id:string; nama_event:string; game:string; kategori_event:string; sistem_turnamen:string; tanggal_mulai:string; tanggal_selesai:string; jumlah_peserta:number; biaya_registrasi:number; target_pemasukan:number; budget:number; prize_pool:number; sponsor_revenue?:number; other_income?:number; other_expense?:number; expected_profit?:number; status:string; created_at?:string };
export type LoginResult = { token:string; role:'SUPER_ADMIN'|'ADMIN'; user_id?:string; user_name?:string; email:string; expires_at:number; must_change_password?:boolean; };

export const api = {
  login: (email:string,password:string) => apiSend<LoginResult>('login',{email,password}),
  logout: () => apiSend('logout',{token:getSuperAdminToken()}),
  getConfig: () => apiGet<{whatsapp_number_configured:boolean;whatsapp_number?:string}>('config',{},true),
  session: () => apiGet<{role:'SUPER_ADMIN'|'ADMIN';email:string;user_id?:string;user_name?:string;expires_at:number}>('session',{},true),
  setConfig: (whatsapp_number:string) => apiSend('config',{whatsapp_number},'PUT',true),
  changePassword: (current_password:string,new_password:string) => apiSend('auth_password',{current_password,new_password},'PUT',true),
  getDashboard: () => apiGet<Dashboard>('dashboard',{},true),
  getTransactions: (params:Record<string,string>={}) => apiGet<Transaction[]>('transactions',params,true),
  getEvents: (params:Record<string,string>={}) => apiGet<EventItem[]>('events',params,true),
  getEventDetail: (id:string) => apiGet<EventItem & Record<string,unknown>>('event_detail',{event_id:id},true),
  getCategories: () => apiGet<Category[]>('categories'),
  getPaymentMethods: () => apiGet<PaymentMethod[]>('payment_methods'),
  createIncome: (data:Record<string,unknown>) => apiSend('income',data,'POST',true),
  createExpense: (data:Record<string,unknown>) => apiSend('expense',data,'POST',true),
  createEvent: (data:Record<string,unknown>) => apiSend('event',data,'POST',true),
  updateTransaction: (sheet:'income'|'expense',id:string,fields:Record<string,unknown>) => apiSend('transaction',{sheet,id,fields},'PUT',true),
  deleteTransaction: (sheet:'income'|'expense',id:string) => apiSend('transaction',{sheet,id},'DELETE',true),
  updateEvent: (id:string,fields:Record<string,unknown>) => apiSend('event',{id,fields},'PUT',true),
  deleteEvent: (id:string) => apiSend('event',{id},'DELETE',true),
  getBrands: () => apiGet<Brand[]>('brands',{},true),
  getCash: () => apiGet<CashAccount[]>('cash',{},true),
  getRequests: (params:Record<string,string>={}) => apiGet<FinanceRequest[]>('requests',params,true),
  getRequestStatus: (id:string) => apiGet<FinanceRequest>('request_status',{request_id:id,request_access_token:getRequestAccessToken()}),
  getUsers: () => apiGet<Record<string,unknown>[]>('users',{},true),
  getAccessControl: () => apiGet<any>('access',{},true),
  updateBrandAccess: (data:Record<string,unknown>) => apiSend('access',data,'PUT',true),
  getAuditLogs: () => apiGet<Record<string,unknown>[]>('audit_logs',{},true),
  getReport: (params:Record<string,string>={}) => apiGet<any>('report',params,true),
  createAdmin: (data:Record<string,unknown>) => apiSend('auth_user',data,'POST',true),
  createRequest: (data:Record<string,unknown>) => apiSend<{request_id:string;status:string;type:string;request_access_token:string}>('request',data,'POST',true),
  approveRequest: (id:string,status:'APPROVED'|'REJECTED',reason='') => apiSend<{request_id:string;status:string;whatsapp_url:string}>('request',{id,status,reason},'PUT',true),
  cancelRequest: (id:string,reason='') => apiSend<{request_id:string;status:string}>('request',{id,status:'CANCELLED',reason},'PUT',true),
  createBrand: (data:Record<string,unknown>) => apiSend('brand',data,'POST',true),
  updateBrand: (id:string,fields:Record<string,unknown>) => apiSend('brand',{id,fields},'PUT',true),
  deleteBrand: (id:string) => apiSend('brand',{id},'DELETE',true),
  setupCash: (data:Record<string,unknown>) => apiSend('cash_setup',data,'POST',true),
  adjustCash: (data:Record<string,unknown>) => apiSend('cash_adjustment',data,'POST',true)
};
