import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`admin-layout ${drawerOpen ? 'admin-layout--drawer-open' : ''}`}>
      <a href="#admin-content" className="skip-to-content">
        Pular para o conteúdo
      </a>
      <div className="admin-layout__overlay" onClick={closeDrawer} aria-hidden="true" />
      <AdminSidebar open={drawerOpen} onClose={closeDrawer} />
      <div className="admin-main">
        <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
        <main id="admin-content" className="admin-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
