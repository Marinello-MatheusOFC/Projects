import { ErrorState } from '@/components/feedback/ErrorState';

export default function AdminNewsPage() {
  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Notícias</h2>
      <ErrorState message="Funcionalidade em desenvolvimento." />
    </div>
  );
}
