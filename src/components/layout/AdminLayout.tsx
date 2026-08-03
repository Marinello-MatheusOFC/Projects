import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastProvider } from '@/hooks/admin/useToast';
import { ConfirmProvider } from '@/hooks/admin/useConfirm';
import { SkipToContent } from '@/components/admin/SkipToContent';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Alert } from '@/components/feedback/Alert';

const COLLAPSED_STORAGE_KEY = 'admin-sidebar-collapsed';

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      return stored === '1';
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { authMode } = useAuth();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // armazenamento falhou — segue sem persistir
      }
      return next;
    });
  }, []);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div
          className={`admin-layout ${drawerOpen ? 'admin-layout--drawer-open' : ''} ${collapsed ? 'admin-layout--sidebar-collapsed' : ''}`}
        >
          <SkipToContent />
          <div className="admin-layout__overlay" onClick={closeDrawer} aria-hidden="true" />
          <AdminSidebar
            open={drawerOpen}
            onClose={closeDrawer}
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
            menuButtonRef={menuButtonRef as React.RefObject<HTMLElement>}
          />
          <div id="admin-main" tabIndex={-1} className="admin-main" role="region" aria-label="Conteúdo principal">
            {authMode === 'demo' && (
              <Alert
                type="warning"
                dismissible={false}
                className="admin-demo-banner"
                icon={<ShieldAlert size={18} aria-hidden="true" />}
                title="Modo Demonstração"
                message="Você está usando o painel sem conexão com o banco. Todas as alterações ficam apenas no seu navegador e serão descartadas ao sair."
              />
            )}
            <AdminHeader
              onMenuClick={() => setDrawerOpen(true)}
              menuButtonRef={menuButtonRef}
            />
            <main className="admin-content">
              <div className="admin-announcements" aria-live="polite" aria-atomic="true" />
              <Outlet />
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
