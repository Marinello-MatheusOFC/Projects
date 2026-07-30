import { ErrorState } from '@/components/feedback/ErrorState';

export default function AdminMessagesPage() {
  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Mensagens</h2>
      <ErrorState message="Funcionalidade em desenvolvimento." />
    </div>
  );
}
