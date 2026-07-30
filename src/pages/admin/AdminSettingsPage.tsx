import { ErrorState } from '@/components/feedback/ErrorState';

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Configurações</h2>
      <ErrorState message="Funcionalidade em desenvolvimento." />
    </div>
  );
}
