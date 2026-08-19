'use client';
import { useEffect, useState } from 'react';
import { api, getSuperAdminToken, getAuthRole } from '@/lib/api';

const WARNING_WINDOW_MS = 2 * 60 * 1000; // tampilkan peringatan 2 menit sebelum sesi habis
const CHECK_INTERVAL_MS = 30 * 1000; // cek setiap 30 detik, hemat request ke Apps Script

/**
 * Banner kecil yang muncul 2 menit sebelum sesi Super Admin/Admin berakhir,
 * supaya user tidak kehilangan draft form karena tiba-tiba ter-logout tanpa
 * peringatan. Dipasang sekali di root layout.
 */
export default function SessionExpiryWarning() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let expiresAt: number | null = null;

    async function check() {
      const token = getSuperAdminToken();
      const role = getAuthRole();
      if (!token || !role) { if (!cancelled) setSecondsLeft(null); return; }
      try {
        if (expiresAt === null) {
          const s = await api.session();
          expiresAt = s.expires_at;
        }
        const remaining = expiresAt - Date.now();
        if (!cancelled) setSecondsLeft(Math.max(0, Math.round(remaining / 1000)));
      } catch {
        // Sesi sudah invalid/expired di backend — biarkan halaman yang sedang
        // dibuka menangani redirect ke login seperti biasa, banner cukup diam.
        if (!cancelled) setSecondsLeft(null);
        expiresAt = null;
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (secondsLeft === null || secondsLeft > WARNING_WINDOW_MS / 1000 || dismissed) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="session-warning" role="status">
      <span>⏱ Sesi Anda akan berakhir dalam {minutes}:{String(seconds).padStart(2,'0')}. Simpan pekerjaan Anda dan login ulang bila perlu.</span>
      <button className="icon-button" onClick={() => setDismissed(true)} aria-label="Tutup peringatan">×</button>
    </div>
  );
}
