# Struktur Google Spreadsheet

Buat 1 spreadsheet (`TCC_DATABASE`) dengan 7 sheet di bawah ini. Baris pertama tiap sheet **harus** berisi header persis seperti ini (huruf besar/kecil dan urutan kolom penting, karena `Code.gs` membaca berdasarkan urutan kolom).

## USERS
| id | nama | email | role | status | created_at |

## EVENTS
| event_id | nama_event | game | tanggal_mulai | tanggal_selesai | jumlah_peserta | biaya_registrasi | target_pemasukan | budget | prize_pool | status |

## INCOME
| transaction_id | tanggal | jam | nama_transaksi | kategori | event_id | sumber_dana | nominal | metode_pembayaran | penginput | catatan | bukti | created_at |

## EXPENSE
| transaction_id | tanggal | jam | nama_pengeluaran | kategori | event_id | vendor | nominal | metode_pembayaran | status | penginput | catatan | bukti | created_at |

## CATEGORIES
| category_id | nama_kategori | tipe | status |

`tipe` diisi `income` atau `expense`.

## PAYMENT_METHODS
| id | nama | status |

## AUDIT_LOGS
| log_id | user | aktivitas | transaction_id | waktu | detail |

---

Diisi otomatis oleh `Code.gs` saat ada transaksi baru: `transaction_id`, `created_at`, `AUDIT_LOGS`. Kolom `bukti` diisi otomatis dengan link file Google Drive setelah upload.

Timezone semua timestamp: `Asia/Jakarta`, format `DD/MM/YYYY` untuk tanggal dan `HH:mm:ss` untuk jam.
