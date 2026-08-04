import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Archive, RotateCcw, ArrowLeft, ExternalLink, Pencil, Star, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchAdminAnimal,
  updateAnimal,
  archiveAnimal,
  restoreAnimal,
  type AnimalWithImages,
} from '@/services/animals';
import { logAudit } from '@/services/audit';
import { resolveImageUrl } from '@/lib/images';
import { speciesLabel, sexLabel, sizeLabel, animalStatusLabel, formatDate } from '@/lib/format';
import type { AnimalStatus } from '@/types';

const statusVariant: Record<AnimalStatus, 'success' | 'warning' | 'default'> = {
  available: 'success',
  in_process: 'warning',
  adopted: 'default',
  archived: 'default',
};

export default function AdminAnimalsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<AnimalWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetchAdminAnimal(id)
      .then((data) => {
        if (active) setAnimal(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    document.title = 'Animal — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  const flash = (message: string) => {
    setActionNotice(message);
    window.setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTogglePublished = async () => {
    if (!animal) return;
    setBusy(true);
    setActionError(false);
    try {
      const next = !animal.published;
      const updated = await updateAnimal(animal.id, { published: next });
      if (updated) setAnimal({ ...animal, ...updated });
      await logAudit(next ? 'publicar' : 'despublicar', 'animal', animal.id, { slug: animal.slug });
      flash(next ? 'Animal publicado no portal.' : 'Animal retirado do portal.');
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!animal) return;
    setBusy(true);
    setActionError(false);
    try {
      const next = !animal.featured;
      const updated = await updateAnimal(animal.id, { featured: next });
      if (updated) setAnimal({ ...animal, ...updated });
      await logAudit(next ? 'destacar' : 'remover_destaque', 'animal', animal.id, { slug: animal.slug });
      flash(next ? 'Animal destacado na página inicial.' : 'Destaque removido.');
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (!animal) return;
    setBusy(true);
    setActionError(false);
    try {
      await archiveAnimal(animal.id);
      await logAudit('arquivar', 'animal', animal.id, { slug: animal.slug });
      setConfirmArchive(false);
      setAnimal({ ...animal, status: 'archived' });
      flash('Animal arquivado e removido do portal.');
    } catch {
      setActionError(true);
      setConfirmArchive(false);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!animal) return;
    setBusy(true);
    setActionError(false);
    try {
      await restoreAnimal(animal.id);
      await logAudit('restaurar', 'animal', animal.id, { slug: animal.slug });
      setConfirmRestore(false);
      setAnimal({ ...animal, status: 'available', published: true });
      flash('Animal restaurado e disponível para adoção.');
    } catch {
      setActionError(true);
      setConfirmRestore(false);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState message="Não foi possível carregar o animal." onRetry={load} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <TableSkeleton />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="admin-page">
        <EmptyState
          title="Animal não encontrado"
          description="O animal pode ter sido removido ou o endereço está incorreto."
          action={
            <Link to="/admin/animais">
              <Button>Voltar para Animais</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isArchived = animal.status === 'archived';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{animal.name}</h1>
          <p className="admin-page-subtitle">
            {speciesLabel(animal.species)} · {sexLabel(animal.sex)} · Porte {sizeLabel(animal.size)}
            {' · '}
            {animalStatusLabel(animal.status)}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/animais">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
          {animal.published && (
            <a href={`/adocao/${animal.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink size={18} aria-hidden="true" />
                Ver no portal
              </Button>
            </a>
          )}
          <Link to={`/admin/animais/${animal.id}/editar`}>
            <Button variant="secondary">
              <Pencil size={18} aria-hidden="true" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível concluir a ação." onClose={() => setActionError(false)} />
        </div>
      )}
      {actionNotice && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" message={actionNotice} onClose={() => setActionNotice(null)} />
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-side">
          <div className="admin-card">
            <div className="admin-detail-hero">
              {animal.cover ? (
                <img src={animal.cover} alt={`Foto de ${animal.name}`} />
              ) : (
                <div className="admin-detail-hero-info">
                  <p>Sem foto cadastrada.</p>
                </div>
              )}
              <div className="admin-detail-hero-info">
                <h3>{animal.name}</h3>
                <p>Cadastrado em {formatDate(animal.created_at)}</p>
              </div>
            </div>

            <div className="admin-detail-section">
              <ul className="admin-detail-list">
                <li>
                  <span className="admin-detail-key">Status</span>
                  <span className="admin-detail-value">
                    <Badge variant={statusVariant[animal.status]}>{animalStatusLabel(animal.status)}</Badge>
                  </span>
                </li>
                <li>
                  <span className="admin-detail-key">Publicação</span>
                  <span className="admin-detail-value">
                    <Badge variant={animal.published ? 'success' : 'default'}>
                      {animal.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </span>
                </li>
                <li>
                  <span className="admin-detail-key">Destaque</span>
                  <span className="admin-detail-value">
                    <Badge variant={animal.featured ? 'warning' : 'default'}>
                      {animal.featured ? 'Destacado' : 'Não destacado'}
                    </Badge>
                  </span>
                </li>
                <li>
                  <span className="admin-detail-key">Idade</span>
                  <span className="admin-detail-value">{animal.age_text || '—'}</span>
                </li>
                <li>
                  <span className="admin-detail-key">Vacinas</span>
                  <span className="admin-detail-value">{animal.vaccinated ? 'Em dia' : 'Pendentes'}</span>
                </li>
                <li>
                  <span className="admin-detail-key">Castração</span>
                  <span className="admin-detail-value">{animal.neutered ? 'Sim' : 'Não'}</span>
                </li>
                <li>
                  <span className="admin-detail-key">Atualizado em</span>
                  <span className="admin-detail-value">{formatDate(animal.updated_at)}</span>
                </li>
              </ul>
            </div>

            <div className="admin-detail-actions">
              <Button
                variant={animal.published ? 'outline' : 'primary'}
                loading={busy}
                onClick={handleTogglePublished}
                disabled={isArchived}
                fullWidth
              >
                {animal.published ? <X size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                {animal.published ? 'Despublicar' : 'Publicar'}
              </Button>
              <Button
                variant={animal.featured ? 'outline' : 'secondary'}
                loading={busy}
                onClick={handleToggleFeatured}
                disabled={isArchived}
                fullWidth
              >
                <Star size={18} aria-hidden="true" />
                {animal.featured ? 'Remover destaque' : 'Destacar'}
              </Button>
              {isArchived ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setConfirmRestore(true)}
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  Restaurar
                </Button>
              ) : (
                <Button variant="danger" fullWidth onClick={() => setConfirmArchive(true)}>
                  <Archive size={18} aria-hidden="true" />
                  Arquivar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="admin-detail-main">
          <div className="admin-card">
            <h2 className="admin-card-title">Apresentação</h2>
            <p className="admin-card-subtitle">Descrição, história e personalidade.</p>
            <div className="admin-detail-prose">
              <p>{animal.description || 'Sem descrição.'}</p>
              {animal.history && <p><strong>História:</strong> {animal.history}</p>}
              {animal.personality && <p><strong>Personalidade:</strong> {animal.personality}</p>}
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Saúde e convivência</h2>
            {animal.health_notes && <p><strong>Saúde:</strong> {animal.health_notes}</p>}
            {animal.compatibility_notes && <p><strong>Convivência:</strong> {animal.compatibility_notes}</p>}
            {!animal.health_notes && !animal.compatibility_notes && (
              <p className="admin-card-subtitle">Nenhuma anotação adicional.</p>
            )}
          </div>

          {animal.images.length > 0 && (
            <div className="admin-card">
              <h2 className="admin-card-title">Fotos ({animal.images.length})</h2>
              <div className="admin-gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {animal.images.map((image) => (
                  <div key={image.id} className="admin-gallery-item">
                    <img
                      src={resolveImageUrl(image.storage_path)}
                      alt={image.alt_text ?? `Foto de ${animal.name}`}
                    />
                    <div className="admin-gallery-item-body">
                      {image.is_cover && <Badge variant="success">Capa</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        title="Arquivar animal"
        message={
          <>
            Tem certeza que deseja arquivar <strong>{animal.name}</strong>? Ele será removido do
            portal público. Você poderá restaurá-lo depois.
          </>
        }
        confirmLabel="Arquivar"
        loading={busy}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        isOpen={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        title="Restaurar animal"
        message={
          <>
            Tem certeza que deseja restaurar <strong>{animal.name}</strong>? Ele voltará a
            aparecer como disponível para adoção no portal.
          </>
        }
        confirmLabel="Restaurar"
        loading={busy}
        onConfirm={handleRestore}
      />
    </div>
  );
}
