import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchAdminGallery,
  deleteGalleryAlbum,
  type GalleryAlbumWithImages,
} from '@/services/gallery';
import { logAudit } from '@/services/audit';
import { resolveImageUrl } from '@/lib/images';
import { formatDate } from '@/lib/format';

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbumWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbumWithImages | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAdminGallery()
      .then((data) => {
        if (active) setAlbums(data);
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
  }, []);

  useEffect(() => {
    document.title = 'Galeria — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return albums;
    return albums.filter((album) => album.title.toLowerCase().includes(term));
  }, [albums, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(false);
    try {
      await deleteGalleryAlbum(deleteTarget.id);
      await logAudit('excluir', 'gallery_album', deleteTarget.id, { title: deleteTarget.title });
      setAlbums((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setActionError(true);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Galeria</h1>
          <p className="admin-page-subtitle">
            Álbuns de fotos exibidos no portal da ONG.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/galeria/novo">
            <Button>
              <Plus size={18} aria-hidden="true" />
              Novo álbum
            </Button>
          </Link>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível excluir o álbum." onClose={() => setActionError(false)} />
        </div>
      )}

      {albums.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar álbum"
              id="search-gallery"
              type="search"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {error ? (
        <ErrorState message="Não foi possível carregar os álbuns." onRetry={load} />
      ) : loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Camera size={40} aria-hidden="true" />}
          title={albums.length === 0 ? 'Nenhum álbum cadastrado' : 'Nenhum álbum encontrado'}
          description={
            albums.length === 0
              ? 'Crie o primeiro álbum de fotos para compartilhar momentos da ONG.'
              : 'Tente outra busca.'
          }
          action={
            albums.length === 0 ? (
              <Link to="/admin/galeria/novo">
                <Button>Novo álbum</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="admin-gallery-grid">
          {filtered.map((album) => {
            const cover = album.imageUrls[0] || (album.cover_image_path ? resolveImageUrl(album.cover_image_path) : '');
            return (
              <article key={album.id} className="admin-gallery-item">
                {cover ? (
                  <img src={cover} alt={`Capa do álbum ${album.title}`} />
                ) : (
                  <div
                    className="image-fallback"
                    role="img"
                    aria-label={`Álbum ${album.title} sem foto`}
                    style={{ aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Camera size={40} aria-hidden="true" strokeWidth={1.5} />
                  </div>
                )}
                <div className="admin-gallery-item-actions">
                  <Link
                    to={`/admin/galeria/${album.id}`}
                    className="admin-icon-btn"
                    aria-label={`Ver detalhes de ${album.title}`}
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/admin/galeria/${album.id}/editar`}
                    className="admin-icon-btn"
                    aria-label={`Editar ${album.title}`}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    aria-label={`Excluir ${album.title}`}
                    title="Excluir"
                    onClick={() => setDeleteTarget(album)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="admin-gallery-item-body">
                  <h3 className="admin-gallery-item-title">{album.title}</h3>
                  <p className="admin-gallery-item-meta">
                    {album.images.length} foto(s) · {formatDate(album.created_at)}
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge variant={album.published ? 'success' : 'default'}>
                      {album.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir álbum"
        message={
          <>
            Tem certeza que deseja excluir o álbum <strong>{deleteTarget?.title}</strong> e todas
            as suas fotos? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
