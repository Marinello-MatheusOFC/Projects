import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, HeartHandshake, Mail, Users, ShoppingBag, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { fetchAdminAnimals } from '@/services/animals';
import { fetchAdoptionApplications } from '@/services/applications';
import { fetchContactMessages } from '@/services/applications';
import { fetchVolunteerApplications } from '@/services/applications';
import { fetchAdminProducts } from '@/services/products';
import { fetchAdminEvents } from '@/services/events';

interface DashboardStats {
  availableAnimals: number;
  adoptionsReview: number;
  newMessages: number;
  pendingVolunteers: number;
  availableProducts: number;
  upcomingEvents: number;
}

const emptyStats: DashboardStats = {
  availableAnimals: 0,
  adoptionsReview: 0,
  newMessages: 0,
  pendingVolunteers: 0,
  availableProducts: 0,
  upcomingEvents: 0,
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminAnimals(),
      fetchAdoptionApplications(),
      fetchContactMessages(),
      fetchVolunteerApplications(),
      fetchAdminProducts(),
      fetchAdminEvents(),
    ])
      .then(([animals, adoptions, messages, volunteers, products, events]) => {
        if (!active) return;
        setStats({
          availableAnimals: animals.filter((a) => a.status === 'available' && a.published).length,
          adoptionsReview: adoptions.filter(
            (a) => a.status === 'new' || a.status === 'under_review',
          ).length,
          newMessages: messages.filter((m) => m.status === 'new').length,
          pendingVolunteers: volunteers.filter(
            (v) => v.status === 'new' || v.status === 'under_review',
          ).length,
          availableProducts: products.filter((p) => p.available).length,
          upcomingEvents: events.filter((e) => e.isUpcoming && !e.isCancelled).length,
        });
      })
      .catch(() => {
        if (active) setStats(emptyStats);
      });
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      key: 'availableAnimals' as const,
      icon: PawPrint,
      iconClass: 'dashboard-card-icon--primary',
      label: 'Animais disponíveis',
      link: '/admin/animais',
    },
    {
      key: 'adoptionsReview' as const,
      icon: HeartHandshake,
      iconClass: 'dashboard-card-icon--secondary',
      label: 'Adoções em análise',
      link: '/admin/adocoes',
    },
    {
      key: 'newMessages' as const,
      icon: Mail,
      iconClass: 'dashboard-card-icon--accent',
      label: 'Mensagens novas',
      link: '/admin/mensagens',
    },
    {
      key: 'pendingVolunteers' as const,
      icon: Users,
      iconClass: 'dashboard-card-icon--info',
      label: 'Voluntários pendentes',
      link: '/admin/voluntarios',
    },
    {
      key: 'availableProducts' as const,
      icon: ShoppingBag,
      iconClass: 'dashboard-card-icon--success',
      label: 'Produtos disponíveis',
      link: '/admin/produtos',
    },
    {
      key: 'upcomingEvents' as const,
      icon: Calendar,
      iconClass: 'dashboard-card-icon--warning',
      label: 'Eventos futuros',
      link: '/admin/eventos',
    },
  ];

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard</h2>
      <p className="admin-page-subtitle">
        Bem-vindo(a), {profile?.full_name ?? 'Administrador(a)'}
      </p>

      <div className="dashboard-cards">
        {cards.map((card) => {
          const value = stats ? stats[card.key] : null;
          const Icon = card.icon;
          return (
            <Link to={card.link} key={card.key} className="dashboard-card dashboard-card--link">
              <div className={`dashboard-card-icon ${card.iconClass}`}>
                <Icon size={24} aria-hidden="true" />
              </div>
              <div className="dashboard-card-info">
                <span className="dashboard-card-value">
                  {value === null ? (
                    <span className="skeleton skeleton-title" style={{ width: 40, margin: 0 }} aria-hidden="true" />
                  ) : (
                    value
                  )}
                </span>
                <span className="dashboard-card-label">{card.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="dashboard-note">
        Os indicadores são atualizados automaticamente com base nos dados do banco
        (exibem dados de demonstração quando o backend local está indisponível).
      </p>
    </div>
  );
}
