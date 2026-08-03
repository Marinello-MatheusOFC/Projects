import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '@/components/ui/Button';

type ConfirmVariant = 'danger' | 'primary' | 'default';

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends Required<Pick<ConfirmOptions, 'confirmLabel' | 'cancelLabel' | 'variant'>> {
  open: boolean;
  title: string;
  message: ReactNode;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const elements = Array.from(focusable);
    if (elements.length === 0) return;

    const first = elements[0]!;
    const last = elements[elements.length - 1]!;
    const previous = document.activeElement as HTMLElement | null;

    first.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [active, containerRef]);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: null,
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'default',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(state.open, dialogRef);

  const resolve = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolvePromise) => {
      resolverRef.current = resolvePromise;
      setState({
        open: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        cancelLabel: options.cancelLabel ?? 'Cancelar',
        variant: options.variant ?? 'default',
      });
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resolve(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [state.open, resolve]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const buttonVariant = state.variant === 'danger' ? 'danger' : state.variant === 'primary' ? 'primary' : 'secondary';

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state.open && (
        <div
          className="modal-overlay"
          onClick={() => resolve(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 200,
          }}
        >
          <div
            ref={dialogRef}
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460 }}
          >
            <div className="modal-header">
              <h2 id="confirm-dialog-title" className="modal-title">
                {state.title}
              </h2>
            </div>
            <div className="modal-body">
              <div className="admin-confirm-text">{state.message}</div>
              <div className="admin-confirm-actions">
                <Button variant="ghost" onClick={() => resolve(false)}>
                  {state.cancelLabel}
                </Button>
                <Button variant={buttonVariant} onClick={() => resolve(true)}>
                  {state.confirmLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
  }
  return ctx;
}
