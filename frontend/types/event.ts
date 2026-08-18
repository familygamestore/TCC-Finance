export interface EventItem {
  event_id:string; brand_id:string; nama_event:string; game:string; kategori_event:string; sistem_turnamen:string;
  tanggal_mulai:string; tanggal_selesai:string; jumlah_peserta:number; biaya_registrasi:number; target_pemasukan:number; budget:number; prize_pool:number; sponsor_revenue?:number; other_income?:number; other_expense?:number; expected_profit?:number; status:string;
}
export interface EventFormData {
  brand_id:string; nama_event:string; game:string; kategori_event:string; sistem_turnamen:string; tanggal_mulai:string; tanggal_selesai:string;
  jumlah_peserta:string; biaya_registrasi:string; target_pemasukan:string; budget:string; prize_pool:string; sponsor_revenue:string; other_income:string; other_expense:string;
}
export interface EventPayload extends Omit<EventFormData,'jumlah_peserta'|'biaya_registrasi'|'target_pemasukan'|'budget'|'prize_pool'|'sponsor_revenue'|'other_income'|'other_expense'> {
  jumlah_peserta:number; biaya_registrasi:number; target_pemasukan:number; budget:number; prize_pool:number; sponsor_revenue?:number; other_income?:number; other_expense?:number; expected_profit?:number;
}
