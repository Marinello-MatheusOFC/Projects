import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <a href="#admin-content" className="skip-to-content">
        Pular para o conteúdo
      </a>
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main id="admin-content" className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
