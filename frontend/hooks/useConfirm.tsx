'use client';
import { useCallback, useRef, useState } from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

type ConfirmOptions = { title?: string; message: string; confirmLabel?: string; cancelLabel?: string };

/**
 * Pengganti window.confirm() bawaan browser yang tampilannya "lepas" dari
 * desain aplikasi (tidak ikut dark mode, gaya beda sendiri). Pakai:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   ...
 *   if (!(await confirm({ message: 'Hapus data ini?' }))) return;
 *   ...
 * lalu render {ConfirmDialog} sekali di dalam komponen.
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setState(options);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const close = useCallback((result: boolean) => {
    setState(null);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  useEscapeKey(!!state, () => close(false));

  const ConfirmDialog = state ? (
    <>
      <button className="confirm-backdrop-btn" aria-label="Tutup" onClick={() => close(false)} />
      <div className="confirm-backdrop" aria-hidden="true">
        <div className="confirm-dialog" role="alertdialog" aria-modal="true">
          <h3>{state.title || 'Konfirmasi'}</h3>
          <p>{state.message}</p>
          <div className="actions">
            <button className="btn secondary" onClick={() => close(false)}>{state.cancelLabel || 'Batal'}</button>
            <button className="btn danger" onClick={() => close(true)}>{state.confirmLabel || 'Hapus'}</button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return { confirm, ConfirmDialog };
}
