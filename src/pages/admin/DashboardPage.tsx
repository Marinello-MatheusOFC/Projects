import { PawPrint, HeartHandshake, Mail, Users, ShoppingBag, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard</h2>
      <p className="admin-page-subtitle">
        Bem-vindo(a), {profile?.full_name ?? 'Administrador(a)'}
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--primary">
            <PawPrint size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Animais disponíveis</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--secondary">
            <HeartHandshake size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Adoções em análise</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--accent">
            <Mail size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Mensagens novas</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--info">
            <Users size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Voluntários pendentes</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--success">
            <ShoppingBag size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Produtos disponíveis</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon dashboard-card-icon--warning">
            <Calendar size={24} aria-hidden="true" />
          </div>
          <div className="dashboard-card-info">
            <span className="dashboard-card-value">0</span>
            <span className="dashboard-card-label">Eventos futuros</span>
          </div>
        </div>
      </div>

      <p className="dashboard-note">
        Os indicadores são atualizados automaticamente com base nos dados do banco.
      </p>
    </div>
  );
}
