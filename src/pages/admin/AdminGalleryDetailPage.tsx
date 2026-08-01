import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, ExternalLink, Pencil, Star, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  deleteGalleryImage,
  type GalleryAlbumWithImages,
} from '@/services/gallery';
import { logAudit } from '@/services/audit';
import { resolveImageUrl } from '@/lib/images';
import { formatDate } from '@/lib/format';

export default function AdminGalleryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<GalleryAlbumWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(false);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetchGalleryAlbum(id)
      .then((data) => {
        if (active) setAlbum(data);
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
    document.title = 'Álbum — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  const flash = (message: string) => {
    setActionNotice(message);
    window.setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTogglePublished = async () => {
    if (!album) return;
    setBusy(true);
    setActionError(false);
    try {
      const next = !album.published;
      const updated = await updateGalleryAlbum(album.id, { published: next });
      if (updated) setAlbum({ ...album, ...updated });
      await logAudit(next ? 'publicar' : 'despublicar', 'gallery_album', album.id, { title: album.title });
      flash(next ? 'Álbum publicado no portal.' : 'Álbum retirado do portal.');
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSetCover = async (storagePath: string) => {
    if (!album) return;
    setBusy(true);
    setActionError(false);
    try {
      const updated = await updateGalleryAlbum(album.id, { cover_image_path: storagePath });
      if (updated) setAlbum({ ...album, ...updated });
      await logAudit('definir_capa', 'gallery_album', album.id, { title: album.title });
      flash('Foto definida como capa do álbum.');
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!album || !confirmDeleteImage) return;
    setBusy(true);
    setActionError(false);
    try {
      await deleteGalleryImage(confirmDeleteImage);
      await logAudit('excluir_imagem', 'gallery_image', confirmDeleteImage, { album_id: album.id });
      setConfirmDeleteImage(null);
      load();
      flash('Foto removida do álbum.');
    } catch {
      setActionError(true);
      setConfirmDeleteImage(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    setBusy(true);
    setActionError(false);
    try {
      await deleteGalleryAlbum(album.id);
      await logAudit('excluir', 'gallery_album', album.id, { title: album.title });
      setConfirmDeleteAlbum(false);
      setAlbum(null);
    } catch {
      setActionError(true);
      setConfirmDeleteAlbum(false);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState message="Não foi possível carregar o álbum." onRetry={load} />
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

  if (!album) {
    return (
      <div className="admin-page">
        <EmptyState
          title="Álbum não encontrado"
          description="O álbum pode ter sido removido ou o endereço está incorreto."
          action={
            <Link to="/admin/galeria">
              <Button>Voltar para Galeria</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const cover = album.imageUrls[0] || (album.cover_image_path ? resolveImageUrl(album.cover_image_path) : '');

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{album.title}</h1>
          <p className="admin-page-subtitle">
            Criado em {formatDate(album.created_at)}
            {album.description ? ` · ${album.description}` : ''}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/galeria">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
          {album.published && (
            <a href="/galeria" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink size={18} aria-hidden="true" />
                Ver no portal
              </Button>
            </a>
          )}
          <Link to={`/admin/galeria/${album.id}/editar`}>
            <Button variant="secondary">
              <Pencil size={18} aria-hidden="true" />
              Editar
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setConfirmDeleteAlbum(true)} disabled={busy}>
            <Trash2 size={18} aria-hidden="true" />
            Excluir
          </Button>
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
            {cover ? (
              <img
                src={cover}
                alt={`Capa do álbum ${album.title}`}
                style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 'var(--admin-radius-image)' }}
              />
            ) : (
              <div
                className="image-fallback"
                role="img"
                aria-label={`Álbum ${album.title} sem foto de capa`}
                style={{ aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Camera size={40} aria-hidden="true" strokeWidth={1.5} />
              </div>
            )}
            <ul className="admin-detail-list" style={{ marginTop: '1rem' }}>
              <li>
                <span className="admin-detail-key">Publicação</span>
                <span className="admin-detail-value">
                  <Badge variant={album.published ? 'success' : 'default'}>
                    {album.published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </span>
              </li>
              <li>
                <span className="admin-detail-key">Fotos</span>
                <span className="admin-detail-value">{album.images.length}</span>
              </li>
            </ul>
            <div className="admin-detail-actions">
              <Button
                variant={album.published ? 'outline' : 'primary'}
                loading={busy}
                onClick={handleTogglePublished}
                fullWidth
              >
                {album.published ? <X size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                {album.published ? 'Despublicar' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-detail-main">
          <div className="admin-card">
            <h2 className="admin-card-title">Fotos do álbum</h2>
            {album.images.length === 0 ? (
              <p className="admin-card-subtitle">
                Nenhuma foto cadastrada. Adicione fotos pela tela de edição.
              </p>
            ) : (
              <div className="admin-gallery-grid">
                {album.images.map((image) => (
                  <div key={image.id} className="admin-gallery-item">
                    <img src={resolveImageUrl(image.storage_path)} alt={image.alt_text ?? album.title} />
                    <div className="admin-gallery-item-actions">
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--active"
                        aria-label="Definir como capa"
                        title="Definir como capa"
                        disabled={busy}
                        onClick={() => handleSetCover(image.storage_path)}
                      >
                        <Star size={18} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        aria-label="Excluir foto"
                        title="Excluir foto"
                        onClick={() => setConfirmDeleteImage(image.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="admin-gallery-item-body">
                      {image.caption && <p className="admin-gallery-item-meta">{image.caption}</p>}
                      {image.storage_path === album.cover_image_path && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <Badge variant="success">Capa</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteAlbum}
        onClose={() => setConfirmDeleteAlbum(false)}
        title="Excluir álbum"
        message={
          <>
            Tem certeza que deseja excluir o álbum <strong>{album.title}</strong> e todas as suas
            fotos? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={busy}
        onConfirm={handleDeleteAlbum}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteImage}
        onClose={() => setConfirmDeleteImage(null)}
        title="Excluir foto"
        message="Tem certeza que deseja excluir esta foto do álbum? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={busy}
        onConfirm={handleDeleteImage}
      />
    </div>
  );
}
