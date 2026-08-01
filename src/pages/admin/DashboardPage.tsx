import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, HeartHandshake, Mail, Users, ShoppingBag, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchAdminAnimals, type AnimalWithImages } from '@/services/animals';
import { fetchAdoptionApplications } from '@/services/applications';
import { fetchContactMessages } from '@/services/applications';
import { fetchVolunteerApplications } from '@/services/applications';
import { fetchAdminProducts } from '@/services/products';
import { fetchAdminEvents } from '@/services/events';
import type { AdoptionApplication, AdoptionStatus } from '@/types';
import { adoptionStatusLabels } from '@/utils';
import { speciesLabel } from '@/lib/format';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

interface StatCard {
  key: keyof Stats;
  icon: typeof PawPrint;
  label: string;
  value: number;
  hint: string;
  link: string;
  variant: 'red' | 'yellow' | 'green' | 'peach';
}

interface Stats {
  availableAnimals: number;
  adoptionsInProgress: number;
  newMessages: number;
  pendingVolunteers: number;
  availableProducts: number;
  upcomingEvents: number;
}

const adoptionStatusOrder: AdoptionStatus[] = [
  'new',
  'under_review',
  'contacted',
  'interview',
  'approved',
  'rejected',
];

const chartColors: Record<AdoptionStatus, string> = {
  new: 'admin-chart-bar',
  under_review: 'admin-chart-bar admin-chart-bar--yellow',
  contacted: 'admin-chart-bar',
  interview: 'admin-chart-bar admin-chart-bar--yellow',
  approved: 'admin-chart-bar admin-chart-bar--green',
  rejected: 'admin-chart-bar',
  cancelled: 'admin-chart-bar',
  completed: 'admin-chart-bar admin-chart-bar--green',
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [adoptions, setAdoptions] = useState<AdoptionApplication[]>([]);
  const [featured, setFeatured] = useState<AnimalWithImages[]>([]);

  useEffect(() => {
    document.title = 'Dashboard — SOS Focinho Carente';
    let active = true;
    Promise.all([
      fetchAdminAnimals(),
      fetchAdoptionApplications(),
      fetchContactMessages(),
      fetchVolunteerApplications(),
      fetchAdminProducts(),
      fetchAdminEvents(),
    ])
      .then(([animals, applications, messages, volunteers, products, events]) => {
        if (!active) return;
        const published = animals.filter((a) => a.published);
        setStats({
          availableAnimals: published.filter((a) => a.status === 'available').length,
          adoptionsInProgress: applications.filter(
            (a) => a.status === 'new' || a.status === 'under_review' || a.status === 'contacted',
          ).length,
          newMessages: messages.filter((m) => m.status === 'new').length,
          pendingVolunteers: volunteers.filter((v) => v.status === 'new' || v.status === 'under_review')
            .length,
          availableProducts: products.filter((p) => p.available).length,
          upcomingEvents: events.filter((e) => e.isUpcoming && !e.isCancelled).length,
        });
        setAdoptions(applications);
        setFeatured(published.filter((a) => a.featured).slice(0, 5));
      })
      .catch(() => {
        if (active) setStats(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const cards: StatCard[] = stats
    ? [
        {
          key: 'availableAnimals',
          icon: PawPrint,
          label: 'Animais disponíveis',
          value: stats.availableAnimals,
          hint: 'Publicados e livres para adoção',
          link: '/admin/animais',
          variant: 'red',
        },
        {
          key: 'adoptionsInProgress',
          icon: HeartHandshake,
          label: 'Adoções em andamento',
          value: stats.adoptionsInProgress,
          hint: 'Novas, em análise ou contato',
          link: '/admin/adocoes',
          variant: 'yellow',
        },
        {
          key: 'newMessages',
          icon: Mail,
          label: 'Mensagens novas',
          value: stats.newMessages,
          hint: 'Aguardando resposta',
          link: '/admin/mensagens',
          variant: 'peach',
        },
        {
          key: 'pendingVolunteers',
          icon: Users,
          label: 'Voluntários pendentes',
          value: stats.pendingVolunteers,
          hint: 'Inscrições para analisar',
          link: '/admin/voluntarios',
          variant: 'green',
        },
        {
          key: 'availableProducts',
          icon: ShoppingBag,
          label: 'Produtos disponíveis',
          value: stats.availableProducts,
          hint: 'No brechó solidário',
          link: '/admin/produtos',
          variant: 'red',
        },
        {
          key: 'upcomingEvents',
          icon: Calendar,
          label: 'Eventos futuros',
          value: stats.upcomingEvents,
          hint: 'Agenda ativa',
          link: '/admin/eventos',
          variant: 'yellow',
        },
      ]
    : [];

  const maxAdoptions = Math.max(1, ...adoptionStatusOrder.map((s) => adoptions.filter((a) => a.status === s).length));

  return (
    <div>
      <div className="admin-dashboard-greeting">
        <h2>Dashboard</h2>
        <p>Bem-vindo(a), {profile?.full_name ?? 'Administrador(a)'}!</p>
      </div>

      <div className="admin-stats-grid" aria-label="Indicadores do painel">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link to={card.link} key={card.key} className={`admin-stat-card admin-stat-card--${card.variant}`}>
              <Icon size={20} aria-hidden="true" style={{ color: 'var(--admin-muted)' }} />
              <span className="admin-stat-value">{card.value}</span>
              <span className="admin-stat-label">{card.label}</span>
              <span className="admin-stat-hint">{card.hint}</span>
            </Link>
          );
        })}
        {stats === null && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="admin-stat-card" aria-hidden="true">
                <span className="skeleton skeleton-title" style={{ width: '60%', margin: 0 }} />
                <span className="skeleton skeleton-text" style={{ width: '40%', margin: 0 }} />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel" aria-label="Adoções por status">
          <h3 className="admin-panel-title">Solicitações de adoção por status</h3>
          {adoptions.length === 0 ? (
            <p className="admin-panel-empty">Nenhuma solicitação de adoção ainda.</p>
          ) : (
            <div
              className="admin-chart"
              role="img"
              aria-label={`Adoções por status. ${adoptionStatusOrder
                .map((s) => `${adoptionStatusLabels[s]}: ${adoptions.filter((a) => a.status === s).length}`)
                .join('. ')}`}
            >
              <div className="admin-chart-bars">
                {adoptionStatusOrder.map((status) => {
                  const count = adoptions.filter((a) => a.status === status).length;
                  return (
                    <div key={status} className="admin-chart-bar-wrap">
                      <span className="admin-chart-bar-value">{count}</span>
                      <div
                        className={chartColors[status]}
                        style={{ height: `${Math.max(4, (count / maxAdoptions) * 100)}%` }}
                      />
                      <span className="admin-chart-bar-label">{adoptionStatusLabels[status]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="admin-chart-legend">
                <span className="admin-chart-legend-item">
                  <span className="admin-chart-legend-dot" style={{ background: 'var(--admin-red)' }} aria-hidden="true" />
                  Nova / em contato
                </span>
                <span className="admin-chart-legend-item">
                  <span className="admin-chart-legend-dot" style={{ background: 'var(--admin-yellow)' }} aria-hidden="true" />
                  Em análise / entrevista
                </span>
                <span className="admin-chart-legend-item">
                  <span className="admin-chart-legend-dot" style={{ background: 'var(--admin-green)' }} aria-hidden="true" />
                  Aprovada / concluída
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="admin-panel" aria-label="Animais em destaque">
          <h3 className="admin-panel-title">
            <Star size={16} aria-hidden="true" style={{ color: 'var(--admin-yellow)', verticalAlign: '-2px' }} />
            Animais em destaque
          </h3>
          {featured.length === 0 ? (
            <p className="admin-panel-empty">
              Nenhum animal em destaque. Destaque um animal publicado para aparecer aqui.
            </p>
          ) : (
            <div className="admin-list">
              {featured.map((animal) => (
                <Link to={`/admin/animais/${animal.id}`} className="admin-list-item" key={animal.id}>
                  <ResponsivePicture
                    className="admin-list-thumb"
                    src={animal.cover}
                    width={48}
                    height={48}
                    fallback="animal"
                    alt={`Foto de ${animal.name}`}
                  />
                  <span className="admin-list-body">
                    <span className="admin-list-title">{animal.name}</span>
                    <span className="admin-list-meta">{speciesLabel(animal.species)}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
