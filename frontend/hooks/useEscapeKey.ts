import { useEffect } from 'react';

/**
 * Menutup drawer/panel/modal saat tombol Esc ditekan, tapi hanya saat
 * `active` true (drawer sedang terbuka). Dipakai di semua form-drawer
 * (Event Hub, Requests, Cash) supaya konsisten bisa ditutup lewat keyboard,
 * bukan cuma klik backdrop / tombol ×.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onEscape]);
}
