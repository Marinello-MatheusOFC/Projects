import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  Heart,
  Star,
  ImageOff,
  HeartHandshake,
  ClipboardList,
  Mail,
  Users,
  Calendar,
  Newspaper,
  ShoppingBag,
  PlusCircle,
  CalendarPlus,
  PenLine,
  MessageCircle,
  UserCheck,
  Eye,
  Edit3,
  AlertTriangle,
  RefreshCw,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { safeCount, safeList } from '@/lib/supabase/dashboard';
import { resolveImageUrl } from '@/lib/images';
import {
  adoptionStatusLabels,
  speciesLabels,
  statusLabels,
} from '@/utils';
import {
  formatDate,
  formatDayNumber,
  formatMonthShort,
  formatShortDate,
  speciesLabel,
} from '@/lib/format';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { Badge } from '@/components/ui/Badge';

type StatVariant = 'red' | 'yellow' | 'green' | 'peach';

interface StatCardDef {
  key: string;
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  link: string;
  variant: StatVariant;
}

interface RecentAdoption {
  id: string;
  created_at: string;
  applicant_name: string;
  status: string;
  animal_id: string;
  animal_name?: string;
  animal_cover?: string;
}

interface RecentAnimal {
  id: string;
  name: string;
  species: string;
  status: string;
  published: boolean;
  created_at: string;
  cover: string;
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  start_at: string;
  location_name: string | null;
  published: boolean;
}

interface AuditEntry {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_name?: string | null;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const adoptionStatusBadge: Record<string, 'error' | 'warning' | 'success' | 'info' | 'default'> = {
  new: 'error',
  under_review: 'warning',
  contacted: 'info',
  interview: 'warning',
  approved: 'success',
  rejected: 'default',
  cancelled: 'default',
  completed: 'success',
};

const animalStatusBadge: Record<string, 'error' | 'warning' | 'success' | 'info' | 'default'> = {
  available: 'success',
  in_process: 'warning',
  adopted: 'info',
  archived: 'default',
};

function adoptionBadgeVariant(status: string): 'error' | 'warning' | 'success' | 'info' | 'default' {
  return adoptionStatusBadge[status] ?? 'default';
}

function animalBadgeVariant(status: string): 'error' | 'warning' | 'success' | 'info' | 'default' {
  return animalStatusBadge[status] ?? 'default';
}

function auditActionBadge(action: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const a = action.toLowerCase();
  if (a.includes('criar') || a === 'create') return 'success';
  if (a.includes('editar') || a === 'update' || a === 'edit') return 'warning';
  if (a.includes('excluir') || a === 'delete') return 'error';
  if (a.includes('publicar') || a.includes('arquivar')) return 'info';
  return 'default';
}

const auditActionLabel: Record<string, string> = {
  criar: 'Criação',
  editar: 'Edição',
  excluir: 'Exclusão',
  create: 'Criação',
  update: 'Edição',
  delete: 'Exclusão',
};

export default function DashboardPage() {
  const { user, profile, isSuperAdmin } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  const greetingName = profile?.full_name ?? user?.email ?? 'Administrador(a)';

  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentAdoptions, setRecentAdoptions] = useState<RecentAdoption[]>([]);
  const [recentAnimals, setRecentAnimals] = useState<RecentAnimal[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  const loadDashboard = useCallback(async function loadDashboard(signal: AbortSignal) {
    if (signal.aborted) return;
    setState('loading');
    setError(null);

    try {
      const today = new Date().toISOString();

      const [
        availableAnimals,
        adoptedAnimals,
        featuredAnimals,
        animalsWithoutPhoto,
        newAdoptions,
        adoptionsReview,
        newMessages,
        pendingVolunteers,
        upcomingEventsCount,
        newsDraft,
        availableProducts,
        recentAdoptionsRaw,
        recentAnimalsRaw,
        recentMessagesRaw,
        upcomingEventsRaw,
        auditLogsRaw,
        profilesRaw,
      ] = await Promise.all([
        safeCount(
          (q) =>
            q
              .in('status', ['available', 'disponivel'])
              .eq('published', true)
              .is('deleted_at', null),
          'animals',
        ),
        safeCount(
          (q) => q.in('status', ['adopted', 'adotado']),
          'animals',
        ),
        safeCount(
          (q) =>
            q
              .eq('featured', true)
              .eq('published', true)
              .is('deleted_at', null),
          'animals',
        ),
        (async () => {
          try {
            const { data, error: qErr } = await supabase
              .from('animals')
              .select('id, deleted_at')
              .is('deleted_at', null);
            if (qErr || !data) return 0;
            const animalIds = data.map((a) => a.id);
            if (animalIds.length === 0) return 0;
            const { data: withImgs, error: imgsErr } = await supabase
              .from('animal_images')
              .select('animal_id')
              .in('animal_id', animalIds);
            if (imgsErr) return 0;
            const idsWithImg = new Set(withImgs?.map((r) => r.animal_id) ?? []);
            return animalIds.filter((id) => !idsWithImg.has(id)).length;
          } catch {
            return 0;
          }
        })(),
        safeCount(
          (q) =>
            q
              .in('status', ['pending', 'novo', 'em_analise', 'new'])
              .is('deleted_at', null),
          'adoption_applications',
        ),
        safeCount(
          (q) =>
            q
              .in('status', ['analise', 'review', 'under_review', 'interview'])
              .is('deleted_at', null),
          'adoption_applications',
        ),
        safeCount(
          (q) =>
            q
              .or('status.is.new,status.is.pending,is_read.is.false')
              .is('deleted_at', null),
          'contact_messages',
        ),
        safeCount(
          (q) =>
            q
              .in('status', ['pending', 'pendente', 'new', 'under_review'])
              .is('deleted_at', null),
          'volunteer_applications',
        ),
        safeCount(
          (q) =>
            q
              .gte('start_at', today)
              .eq('published', true)
              .is('deleted_at', null),
          'events',
        ),
        safeCount(
          (q) =>
            q
              .or('status.eq.draft,published.is.false')
              .is('deleted_at', null),
          'news_posts',
        ),
        safeCount(
          (q) =>
            q
              .eq('available', true)
              .eq('published', true)
              .is('deleted_at', null),
          'products',
        ),
        safeList<RecentAdoption>(
          (q) =>
            q
              .select('id, created_at, applicant_name, status, animal_id')
              .order('created_at', { ascending: false })
              .limit(5),
          'adoption_applications',
        ),
        safeList<{
          id: string;
          name: string;
          species: string;
          status: string;
          published: boolean;
          created_at: string;
          animal_images?: { storage_path: string; is_cover: boolean }[];
        }>(
          (q) =>
            q
              .select('id, name, species, status, published, created_at, animal_images(storage_path, is_cover)')
              .is('deleted_at', null)
              .order('created_at', { ascending: false })
              .limit(5),
          'animals',
        ),
        safeList<RecentMessage>(
          (q) =>
            q
              .select('id, name, email, subject, status, created_at')
              .is('deleted_at', null)
              .order('created_at', { ascending: false })
              .limit(5),
          'contact_messages',
        ),
        safeList<UpcomingEvent>(
          (q) =>
            q
              .select('id, title, start_at, location_name, published')
              .gte('start_at', today)
              .is('deleted_at', null)
              .order('start_at', { ascending: true })
              .limit(5),
          'events',
        ),
        isSuperAdmin
          ? safeList<AuditEntry>(
              (q) =>
                q
                  .select('id, created_at, action, entity_type, entity_id, actor_id')
                  .order('created_at', { ascending: false })
                  .limit(8),
              'audit_logs',
            )
          : Promise.resolve<AuditEntry[]>([]),
        isSuperAdmin
          ? safeList<{ id: string; full_name: string }>(
              (q) =>
                q
                  .select('id, full_name'),
              'profiles',
            )
          : Promise.resolve<{ id: string; full_name: string }[]>([]),
      ]);

      if (signal.aborted) return;

      setStats({
        availableAnimals,
        adoptedAnimals,
        featuredAnimals,
        animalsWithoutPhoto,
        newAdoptions,
        adoptionsReview,
        newMessages,
        pendingVolunteers,
        upcomingEventsCount,
        newsDraft,
        availableProducts,
      });

      const adoptionAnimalIds = recentAdoptionsRaw
        .map((r) => r.animal_id)
        .filter(Boolean);

      let adoptionAnimalsMap: Record<string, { name: string; cover: string }> = {};
      if (adoptionAnimalIds.length > 0) {
        try {
          const { data: animalRows } = await supabase
            .from('animals')
            .select('id, name, animal_images(storage_path, is_cover)')
            .in('id', adoptionAnimalIds);
          if (animalRows) {
            for (const row of animalRows as Array<{
              id: string;
              name: string;
              animal_images?: { storage_path: string; is_cover: boolean }[];
            }>) {
              const imgs = row.animal_images ?? [];
              const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
              adoptionAnimalsMap[row.id] = {
                name: row.name,
                cover: resolveImageUrl(cover?.storage_path ?? null),
              };
            }
          }
        } catch {
          adoptionAnimalsMap = {};
        }
      }

      setRecentAdoptions(
        recentAdoptionsRaw.map((r) => ({
          ...r,
          animal_name: adoptionAnimalsMap[r.animal_id]?.name,
          animal_cover: adoptionAnimalsMap[r.animal_id]?.cover,
        })),
      );

      setRecentAnimals(
        recentAnimalsRaw.map((a) => {
          const imgs = a.animal_images ?? [];
          const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
          return {
            id: a.id,
            name: a.name,
            species: a.species,
            status: a.status,
            published: a.published,
            created_at: a.created_at,
            cover: resolveImageUrl(cover?.storage_path ?? null),
          };
        }),
      );

      setRecentMessages(recentMessagesRaw);
      setUpcomingEvents(upcomingEventsRaw);

      if (isSuperAdmin && profilesRaw.length > 0) {
        const nameMap = new Map(profilesRaw.map((p) => [p.id, p.full_name]));
        setAuditLogs(
          auditLogsRaw.map((log) => {
            const anyLog = log as AuditEntry & { actor_id?: string };
            return {
              ...log,
              actor_name: anyLog.actor_id ? nameMap.get(anyLog.actor_id) ?? null : null,
            };
          }),
        );
      } else {
        setAuditLogs(auditLogsRaw);
      }

      setState('ready');
    } catch {
      if (signal.aborted) return;
      console.warn('[dashboard] erro geral ao carregar dados');
      setError('Não foi possível carregar o dashboard. Tente novamente.');
      setState('error');
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    document.title = 'Painel administrativo — SOS Focinho Carente';
    const ctrl = new AbortController();
    void loadDashboard(ctrl.signal);
    return () => ctrl.abort();
  }, [loadDashboard]);

  function handleRetry() {
    const ctrl = new AbortController();
    void loadDashboard(ctrl.signal);
  }

  const statCards: StatCardDef[] = useMemo(() => {
    if (state !== 'ready') return [];
    return [
      {
        key: 'availableAnimals',
        icon: PawPrint,
        label: 'Animais disponíveis',
        value: stats.availableAnimals ?? 0,
        hint: 'Publicados e livres para adoção',
        link: '/admin/animais',
        variant: 'green',
      },
      {
        key: 'adoptedAnimals',
        icon: Heart,
        label: 'Animais adotados',
        value: stats.adoptedAnimals ?? 0,
        hint: 'Adoções concluídas com sucesso',
        link: '/admin/animais',
        variant: 'green',
      },
      {
        key: 'featuredAnimals',
        icon: Star,
        label: 'Animais em destaque',
        value: stats.featuredAnimals ?? 0,
        hint: 'Marcados como destaque e publicados',
        link: '/admin/animais',
        variant: 'yellow',
      },
      {
        key: 'animalsWithoutPhoto',
        icon: ImageOff,
        label: 'Animais sem fotografia',
        value: stats.animalsWithoutPhoto ?? 0,
        hint: 'Adicione fotos para aumentar adoções',
        link: '/admin/animais',
        variant: 'red',
      },
      {
        key: 'newAdoptions',
        icon: HeartHandshake,
        label: 'Solicitações novas',
        value: stats.newAdoptions ?? 0,
        hint: 'Aguardando primeira análise',
        link: '/admin/adocoes',
        variant: 'red',
      },
      {
        key: 'adoptionsReview',
        icon: ClipboardList,
        label: 'Adoções em análise',
        value: stats.adoptionsReview ?? 0,
        hint: 'Em análise ou entrevista',
        link: '/admin/adocoes',
        variant: 'yellow',
      },
      {
        key: 'newMessages',
        icon: Mail,
        label: 'Mensagens novas',
        value: stats.newMessages ?? 0,
        hint: 'Contatos do site aguardando resposta',
        link: '/admin/mensagens',
        variant: 'red',
      },
      {
        key: 'pendingVolunteers',
        icon: Users,
        label: 'Voluntários pendentes',
        value: stats.pendingVolunteers ?? 0,
        hint: 'Inscrições para analisar',
        link: '/admin/voluntarios',
        variant: 'yellow',
      },
      {
        key: 'upcomingEventsCount',
        icon: Calendar,
        label: 'Próximos eventos',
        value: stats.upcomingEventsCount ?? 0,
        hint: 'Programados e publicados',
        link: '/admin/eventos',
        variant: 'green',
      },
      {
        key: 'newsDraft',
        icon: Newspaper,
        label: 'Notícias em rascunho',
        value: stats.newsDraft ?? 0,
        hint: 'Aguardam publicação',
        link: '/admin/noticias',
        variant: 'yellow',
      },
      {
        key: 'availableProducts',
        icon: ShoppingBag,
        label: 'Produtos disponíveis',
        value: stats.availableProducts ?? 0,
        hint: 'No brechó solidário',
        link: '/admin/produtos',
        variant: 'peach',
      },
    ];
  }, [state, stats]);

  const urgentItems = useMemo(() => {
    if (state !== 'ready') return [];
    return [
      stats.animalsWithoutPhoto
        ? {
            key: 'animalsWithoutPhoto',
            value: stats.animalsWithoutPhoto,
            label: 'animais sem fotografia',
            variant: 'red' as StatVariant,
            hint: 'Adicione fotos o quanto antes',
            link: '/admin/animais',
            icon: ImageOff,
          }
        : null,
      stats.newAdoptions
        ? {
            key: 'newAdoptions',
            value: stats.newAdoptions,
            label: 'solicitações de adoção novas',
            variant: 'red' as StatVariant,
            hint: 'Aguarda sua análise inicial',
            link: '/admin/adocoes',
            icon: HeartHandshake,
          }
        : null,
      stats.newMessages
        ? {
            key: 'newMessages',
            value: stats.newMessages,
            label: 'mensagens não lidas',
            variant: 'red' as StatVariant,
            hint: 'Contatos do site esperam retorno',
            link: '/admin/mensagens',
            icon: Mail,
          }
        : null,
      stats.adoptionsReview
        ? {
            key: 'adoptionsReview',
            value: stats.adoptionsReview,
            label: 'adoções em análise',
            variant: 'yellow' as StatVariant,
            hint: 'Dê continuidade aos contatos',
            link: '/admin/adocoes',
            icon: ClipboardList,
          }
        : null,
      stats.pendingVolunteers
        ? {
            key: 'pendingVolunteers',
            value: stats.pendingVolunteers,
            label: 'voluntários pendentes',
            variant: 'yellow' as StatVariant,
            hint: 'Revise as inscrições recebidas',
            link: '/admin/voluntarios',
            icon: Users,
          }
        : null,
      stats.newsDraft
        ? {
            key: 'newsDraft',
            value: stats.newsDraft,
            label: 'notícias em rascunho',
            variant: 'yellow' as StatVariant,
            hint: 'Revise e publique conteúdo',
            link: '/admin/noticias',
            icon: Newspaper,
          }
        : null,
    ].filter(Boolean) as Array<{
      key: string;
      value: number;
      label: string;
      variant: StatVariant;
      hint: string;
      link: string;
      icon: LucideIcon;
    }>;
  }, [state, stats]);

  const shortcuts: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
    link: string;
  }> = [
    {
      key: 'cad-animal',
      label: 'Cadastrar animal',
      icon: PlusCircle,
      link: '/admin/animais/novo',
    },
    {
      key: 'criar-evento',
      label: 'Criar evento',
      icon: CalendarPlus,
      link: '/admin/eventos/novo',
    },
    {
      key: 'escrever-noticia',
      label: 'Escrever notícia',
      icon: PenLine,
      link: '/admin/noticias/nova',
    },
    {
      key: 'ver-adocoes',
      label: 'Ver adoções pendentes',
      icon: HeartHandshake,
      link: '/admin/adocoes',
    },
    {
      key: 'abrir-mensagens',
      label: 'Abrir mensagens',
      icon: MessageCircle,
      link: '/admin/mensagens',
    },
    {
      key: 'revisar-voluntarios',
      label: 'Revisar voluntários',
      icon: UserCheck,
      link: '/admin/voluntarios',
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Painel administrativo</h1>
          <p className="admin-page-subtitle">
            Olá, {greetingName}. Veja o que precisa de atenção hoje.
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleRetry}
            aria-label="Atualizar painel"
            disabled={state === 'loading'}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Atualizar
          </button>
        </div>
      </header>

      {state === 'error' && (
        <div
          className="admin-card"
          role="alert"
          style={{ borderLeft: '6px solid var(--admin-yellow)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <AlertTriangle
              size={24}
              aria-hidden="true"
              style={{ color: 'var(--admin-yellow-dark)', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.05rem' }}>
                Não foi possível carregar o dashboard
              </h3>
              <p style={{ margin: '0.375rem 0 0', color: 'var(--admin-muted)' }}>
                {error ?? 'Tente novamente em instantes.'}
              </p>
              <div style={{ marginTop: '0.875rem' }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleRetry}
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div aria-live="polite" aria-busy="true">
          <div
            className="admin-card"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              animation: 'admin-pulse 1.4s ease-in-out infinite',
            }}
          >
            <RefreshCw
              size={28}
              aria-hidden="true"
              style={{ color: 'var(--admin-muted)' }}
            />
            <p style={{ margin: '0.75rem 0 0', color: 'var(--admin-muted)' }}>
              Carregando dashboard...
            </p>
          </div>
        </div>
      )}

      {(state === 'ready' || state === 'error') && (
        <>
          {urgentItems.length > 0 && (
            <section aria-labelledby="urgente-heading" className="admin-card">
              <h2
                id="urgente-heading"
                className="admin-card-title"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <AlertTriangle
                  size={20}
                  aria-hidden="true"
                  style={{ color: 'var(--admin-red)' }}
                />
                Pendências importantes
              </h2>
              <p className="admin-card-subtitle" style={{ marginTop: '-0.25rem' }}>
                Itens que merecem sua atenção agora.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                {urgentItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      to={item.link}
                      className={`admin-stat-card admin-stat-card--${item.variant}`}
                      style={{ textDecoration: 'none' }}
                      aria-label={`${item.value} ${item.label}. ${item.hint}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={20} aria-hidden="true" style={{ color: 'var(--admin-muted)' }} />
                        <span className="admin-stat-value">{item.value}</span>
                      </div>
                      <span className="admin-stat-label">{item.label}</span>
                      <span className="admin-stat-hint">{item.hint}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section aria-labelledby="atalhos-heading" className="admin-card">
            <h2 id="atalhos-heading" className="admin-card-title">
              Atalhos rápidos
            </h2>
            <div
              aria-label="Atalhos administrativos"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.key}
                    to={s.link}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      padding: '1.5rem 1rem',
                      background: 'var(--admin-surface)',
                      borderRadius: 'var(--admin-radius-card)',
                      border: '2px solid var(--admin-border)',
                      boxShadow: 'var(--admin-shadow-card)',
                      textDecoration: 'none',
                      color: 'var(--admin-text)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--font-weight-bold)',
                      textAlign: 'center',
                      fontSize: 'var(--text-sm)',
                      transition:
                        'transform 0.15s ease-out, border-color 0.15s ease-out, box-shadow 0.15s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--admin-red)';
                      e.currentTarget.style.boxShadow = '0 14px 36px rgba(32,42,35,0.14)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    aria-label={s.label}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        background: 'var(--admin-red-soft)',
                        color: 'var(--admin-red-dark)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={26} />
                    </span>
                    <span>{s.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <div
            aria-label="Indicadores gerais"
            className="admin-stats-grid"
            style={{ marginTop: '1.25rem' }}
          >
            {statCards.length > 0 &&
              statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.key}
                    to={card.link}
                    className={`admin-stat-card admin-stat-card--${card.variant}`}
                    style={{ textDecoration: 'none' }}
                    aria-label={`${card.value} ${card.label.toLowerCase()}. ${card.hint}`}
                  >
                    <Icon size={20} aria-hidden="true" style={{ color: 'var(--admin-muted)' }} />
                    <span className="admin-stat-value">{card.value}</span>
                    <span className="admin-stat-label">{card.label}</span>
                    <span className="admin-stat-hint">{card.hint}</span>
                  </Link>
                );
              })}
            {state !== 'ready' &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skel-stat-${i}`}
                  className="admin-stat-card"
                  aria-hidden="true"
                >
                  <div
                    className="skeleton-row"
                    style={{ width: '20px', height: '20px', borderRadius: 6 }}
                  />
                  <div
                    className="skeleton-row"
                    style={{ width: '60%', height: '36px', borderRadius: 8 }}
                  />
                  <div
                    className="skeleton-row"
                    style={{ width: '80%', height: '12px', borderRadius: 6 }}
                  />
                  <div
                    className="skeleton-row"
                    style={{ width: '70%', height: '10px', borderRadius: 6 }}
                  />
                </div>
              ))}
          </div>

          <div
            className="admin-dashboard-grid"
            style={{ marginTop: '1.25rem' }}
          >
            <section aria-labelledby="adocoes-heading" className="admin-panel">
              <h3 id="adocoes-heading" className="admin-panel-title">
                <HeartHandshake
                  size={16}
                  aria-hidden="true"
                  style={{ color: 'var(--admin-red)' }}
                />
                Solicitações recentes
              </h3>
              {recentAdoptions.length === 0 ? (
                <p className="admin-panel-empty">Nenhuma solicitação recente.</p>
              ) : (
                <div
                  className="admin-list"
                  role="list"
                  aria-label="Últimas solicitações de adoção recebidas"
                >
                  {recentAdoptions.map((a) => (
                    <Link
                      key={a.id}
                      to={`/admin/adocoes/${a.id}`}
                      className="admin-list-item"
                      role="listitem"
                    >
                      <ResponsivePicture
                        className="admin-list-thumb"
                        src={a.animal_cover}
                        width={48}
                        height={48}
                        fallback="animal"
                        alt={a.animal_name ? `Foto de ${a.animal_name}` : 'Foto do animal'}
                      />
                      <span className="admin-list-body" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="admin-list-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                          <span>{a.applicant_name}</span>
                          <Badge variant={adoptionBadgeVariant(a.status)}>
                            {adoptionStatusLabels[a.status] ?? a.status}
                          </Badge>
                        </span>
                        <span className="admin-list-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {a.animal_name
                              ? `Interesse em ${a.animal_name}`
                              : 'Solicitação de adoção'}
                          </span>
                          <span>{formatShortDate(a.created_at)}</span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="animais-heading" className="admin-panel">
              <h3 id="animais-heading" className="admin-panel-title">
                <PawPrint size={16} aria-hidden="true" style={{ color: 'var(--admin-green)' }} />
                Animais recentes
              </h3>
              {recentAnimals.length === 0 ? (
                <p className="admin-panel-empty">Nenhum animal cadastrado.</p>
              ) : (
                <div
                  className="admin-list"
                  role="list"
                  aria-label="Últimos animais cadastrados"
                >
                  {recentAnimals.map((a) => (
                    <div
                      key={a.id}
                      className="admin-list-item"
                      role="listitem"
                      style={{ alignItems: 'center' }}
                    >
                      <ResponsivePicture
                        className="admin-list-thumb"
                        src={a.cover}
                        width={48}
                        height={48}
                        fallback="animal"
                        alt={`Foto de ${a.name}`}
                      />
                      <span
                        className="admin-list-body"
                        style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                      >
                        <span
                          className="admin-list-title"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Link
                            to={`/admin/animais/${a.id}`}
                            style={{
                              color: 'inherit',
                              textDecoration: 'none',
                              fontWeight: 'var(--font-weight-semibold)',
                            }}
                          >
                            {a.name}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Badge variant={animalBadgeVariant(a.status)}>
                              {statusLabels[a.status] ?? a.status}
                            </Badge>
                            {!a.published && (
                              <Badge variant="warning" title="Não publicado">
                                Rascunho
                              </Badge>
                            )}
                          </div>
                        </span>
                        <span
                          className="admin-list-meta"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{speciesLabels[a.species] ?? speciesLabel(a.species as 'dog')}</span>
                          <span style={{ display: 'flex', gap: '4px' }}>
                            <Link
                              to={`/admin/animais/${a.id}`}
                              className="admin-icon-btn"
                              aria-label={`Ver detalhes de ${a.name}`}
                              title="Ver"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              to={`/admin/animais/${a.id}/editar`}
                              className="admin-icon-btn"
                              aria-label={`Editar ${a.name}`}
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </Link>
                          </span>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="mensagens-heading" className="admin-panel">
              <h3 id="mensagens-heading" className="admin-panel-title">
                <Mail size={16} aria-hidden="true" style={{ color: 'var(--admin-yellow-dark)' }} />
                Mensagens recentes
              </h3>
              {recentMessages.length === 0 ? (
                <p className="admin-panel-empty">Nenhuma mensagem recebida.</p>
              ) : (
                <table className="table" style={{ width: '100%' }} aria-describedby="mensagens-heading">
                  <caption style={{ position: 'absolute', left: '-9999px' }}>
                    Últimas 5 mensagens recebidas pelo formulário de contato
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ padding: '0.5rem 0' }}>Remetente</th>
                      <th scope="col" style={{ padding: '0.5rem 0' }}>Assunto</th>
                      <th scope="col" style={{ padding: '0.5rem 0', textAlign: 'right' }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMessages.map((m) => {
                      const isUnread =
                        m.status === 'new' ||
                        m.status === 'pending' ||
                        (m as unknown as { is_read?: boolean }).is_read === false;
                      return (
                        <tr key={m.id}>
                          <td style={{ padding: '0.625rem 0', verticalAlign: 'top' }}>
                            <Link
                              to={`/admin/mensagens/${m.id}`}
                              style={{
                                color: 'inherit',
                                textDecoration: 'none',
                                fontWeight: isUnread
                                  ? 'var(--font-weight-bold)'
                                  : 'var(--font-weight-medium)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                            >
                              {isUnread && (
                                <span
                                  aria-hidden="true"
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 999,
                                    background: 'var(--admin-red)',
                                    display: 'inline-block',
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{m.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>
                                  {m.email}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td style={{ padding: '0.625rem 0', verticalAlign: 'top' }}>
                            <Link
                              to={`/admin/mensagens/${m.id}`}
                              style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--text-sm)' }}
                            >
                              {m.subject}
                            </Link>
                          </td>
                          <td
                            style={{
                              padding: '0.625rem 0',
                              verticalAlign: 'top',
                              textAlign: 'right',
                              whiteSpace: 'nowrap',
                              fontSize: '0.75rem',
                              color: 'var(--admin-muted)',
                            }}
                          >
                            {formatShortDate(m.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            <section aria-labelledby="eventos-heading" className="admin-panel">
              <h3 id="eventos-heading" className="admin-panel-title">
                <Calendar size={16} aria-hidden="true" style={{ color: 'var(--admin-green)' }} />
                Próximos eventos
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="admin-panel-empty">Nenhum evento programado.</p>
              ) : (
                <div
                  role="list"
                  aria-label="Próximos eventos programados"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {upcomingEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      to={`/admin/eventos/${ev.id}`}
                      role="listitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.25rem 0',
                        textDecoration: 'none',
                        color: 'inherit',
                        borderBottom: '1px solid rgba(32,42,35,0.06)',
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 58,
                          borderRadius: 18,
                          background: ev.published ? 'var(--admin-green-soft)' : 'var(--admin-yellow-soft)',
                          color: ev.published ? 'var(--admin-green-dark)' : '#8A6A00',
                          textAlign: 'center',
                          padding: '0.5rem 0.25rem',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'var(--font-weight-extrabold)',
                          lineHeight: 1.05,
                          boxShadow: '0 3px 10px rgba(32,42,35,0.08)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.35rem',
                          }}
                        >
                          {formatDayNumber(ev.start_at)}
                        </div>
                        <div
                          style={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {formatMonthShort(ev.start_at)}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 'var(--font-weight-bold)',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            {ev.title}
                          </span>
                          {ev.published ? (
                            <Badge variant="success">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={12} aria-hidden="true" /> Publicado
                              </span>
                            </Badge>
                          ) : (
                            <Badge variant="warning">Rascunho</Badge>
                          )}
                        </div>
                        {ev.location_name && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--admin-muted)',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ev.location_name}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {isSuperAdmin && (
            <section
              aria-labelledby="atividade-heading"
              className="admin-card"
              style={{ marginTop: '1.25rem' }}
            >
              <h2
                id="atividade-heading"
                className="admin-card-title"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Activity
                  size={20}
                  aria-hidden="true"
                  style={{ color: 'var(--admin-green-dark)' }}
                />
                Atividade administrativa
              </h2>
              <p className="admin-card-subtitle" style={{ marginTop: '-0.25rem' }}>
                Últimas ações registradas na auditoria.
              </p>
              {auditLogs.length === 0 ? (
                <p className="admin-panel-empty" style={{ marginTop: '1rem' }}>
                  Nenhuma atividade registrada ainda.
                </p>
              ) : (
                <table className="table" style={{ width: '100%', marginTop: '1rem' }} aria-describedby="atividade-heading">
                  <caption style={{ position: 'absolute', left: '-9999px' }}>
                    Últimos 8 registros de atividade administrativa
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Quando</th>
                      <th scope="col">Ação</th>
                      <th scope="col">Entidade</th>
                      <th scope="col">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-muted)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(log.created_at, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          <Badge variant={auditActionBadge(log.action)}>
                            {auditActionLabel[log.action] ??
                              (log.action.charAt(0).toUpperCase() + log.action.slice(1))}
                          </Badge>
                        </td>
                        <td>
                          <code
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'ui-monospace, Menlo, monospace',
                              background: 'var(--admin-green-soft)',
                              color: 'var(--admin-green-dark)',
                              padding: '0.125rem 0.5rem',
                              borderRadius: 8,
                            }}
                          >
                            {log.entity_type}
                          </code>
                          {log.entity_id && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                color: 'var(--admin-muted)',
                                marginLeft: '0.375rem',
                                fontFamily: 'ui-monospace, Menlo, monospace',
                              }}
                              title={log.entity_id}
                            >
                              {log.entity_id.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            fontSize: '0.8125rem',
                            color: log.actor_name ? 'var(--admin-text)' : 'var(--admin-muted)',
                          }}
                        >
                          {log.actor_name ?? 'Sistema'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
