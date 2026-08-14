import { EventFormData } from '@/types/event';

export const EMPTY_EVENT_FORM: EventFormData = {
  brand_id:'', nama_event:'', game:'', kategori_event:'', sistem_turnamen:'Single Elimination',
  jumlah_peserta:'16', biaya_registrasi:'', target_pemasukan:'', budget:'', prize_pool:'', sponsor_revenue:'', other_income:'', other_expense:'',
  tanggal_mulai:'', tanggal_selesai:''
};

export const GAME_SUGGESTIONS = ['Mobile Legends: Bang Bang','Free Fire','PUBG Mobile','Valorant','Honor of Kings','Blood Strike','eFootball','EA SPORTS FC Mobile','Call of Duty: Mobile','Dota 2','League of Legends','Apex Legends','Counter-Strike 2','Rocket League','Tekken 8','Game Lainnya'];
export const SLOT_OPTIONS = [4,8,16,32,64,128,256];
export const TOURNAMENT_SYSTEMS = ['Single Elimination','Double Elimination','Round Robin','Swiss System','Group Stage + Knockout','Best of Series','Custom'];
export const QUICK_MONEY = {registration:[25000,50000,75000,100000,150000,200000],budget:[500000,1000000,1500000,2000000,3000000,5000000,10000000],prize:[500000,1000000,1500000,2000000,3000000,5000000,10000000]};

export const EVENT_STATUS_LABELS: Record<string,string>={upcoming:'Akan datang',ongoing:'Berlangsung',completed:'Selesai',cancelled:'Dibatalkan'};
export const EVENT_TABLE_COLUMNS=['Nama','Game','Tim','Tanggal','Budget','Prize pool','Status',''];
