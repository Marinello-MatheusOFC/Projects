import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Star, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  createGalleryAlbum,
  updateGalleryAlbum,
  fetchGalleryAlbum,
  uploadGalleryImage,
  deleteGalleryImage,
  type GalleryAlbumWithImages,
} from '@/services/gallery';
import { logAudit } from '@/services/audit';
import { resolveImageUrl } from '@/lib/images';
import { slugify } from '@/lib/format';

interface AlbumFormData {
  title: string;
  slug: string;
  description: string;
  published: boolean;
}

export default function AdminGalleryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [album, setAlbum] = useState<GalleryAlbumWithImages | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDeleteImage, setConfirmDeleteImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<AlbumFormData>({
      defaultValues: { title: '', slug: '', description: '', published: false },
    });

  useEffect(() => {
    document.title = isEditing ? 'Editar álbum — SOS Focinho Carente' : 'Novo álbum — SOS Focinho Carente';
  }, [isEditing]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchGalleryAlbum(id)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setError(true);
          return;
        }
        setAlbum(data);
        reset({
          title: data.title,
          slug: data.slug,
          description: data.description ?? '',
          published: data.published,
        });
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
  }, [id, reset]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('title', e.target.value, { shouldValidate: true });
    if (!slugTouched) {
      setValue('slug', slugify(e.target.value), { shouldValidate: true });
    }
  };

  const handleSave = async (data: AlbumFormData) => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const input = {
        title: data.title.trim(),
        slug: data.slug.trim() || slugify(data.title),
        description: data.description.trim() || null,
        published: data.published,
      };
      if (isEditing && id) {
        await updateGalleryAlbum(id, input);
        await logAudit('atualizar', 'gallery_album', id, { title: input.title });
      } else {
        const created = await createGalleryAlbum(input);
        if (!created) throw new Error('Não foi possível criar o álbum.');
        await logAudit('criar', 'gallery_album', created.id, { title: input.title });
        navigate(`/admin/galeria/${created.id}/editar`, { replace: true });
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 4000);
    } catch {
      setSaveError('Não foi possível salvar o álbum. Verifique se o título/slug já não está em uso.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!id || files.length === 0) return;
    setUploading(true);
    setUploadError(false);
    try {
      for (const file of files) {
        await uploadGalleryImage(id, file, caption, altText);
      }
      await logAudit('upload_imagens', 'gallery_album', id, { count: files.length });
      setFiles([]);
      setCaption('');
      setAltText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      const fresh = await fetchGalleryAlbum(id);
      if (fresh) setAlbum(fresh);
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!id || !confirmDeleteImage) return;
    setBusy(true);
    setUploadError(false);
    try {
      await deleteGalleryImage(confirmDeleteImage);
      await logAudit('excluir_imagem', 'gallery_image', confirmDeleteImage, { album_id: id });
      setConfirmDeleteImage(null);
      const fresh = await fetchGalleryAlbum(id);
      if (fresh) setAlbum(fresh);
    } catch {
      setUploadError(true);
      setConfirmDeleteImage(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSetCover = async (storagePath: string) => {
    if (!id) return;
    setBusy(true);
    setUploadError(false);
    try {
      await updateGalleryAlbum(id, { cover_image_path: storagePath });
      await logAudit('definir_capa', 'gallery_album', id);
      const fresh = await fetchGalleryAlbum(id);
      if (fresh) setAlbum(fresh);
    } catch {
      setUploadError(true);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState
          message={isEditing ? 'Não foi possível carregar o álbum.' : 'Não foi possível abrir o formulário.'}
          onRetry={() => navigate('/admin/galeria')}
        />
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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{isEditing ? 'Editar álbum' : 'Novo álbum'}</h1>
          <p className="admin-page-subtitle">
            {isEditing
              ? 'Atualize as informações e fotos do álbum.'
              : 'Crie um álbum para compartilhar fotos no portal.'}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/galeria">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message={saveError} onClose={() => setSaveError(null)} />
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" message="Álbum salvo com sucesso." onClose={() => setSaved(false)} />
        </div>
      )}
      {uploadError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível concluir a operação de imagens." onClose={() => setUploadError(false)} />
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit(handleSave)} noValidate>
        <h3>Informações do álbum</h3>
        <div className="admin-form-grid">
          <Input
            label="Título"
            placeholder="Ex.: Festa de adoção — janeiro"
            {...register('title', { required: 'Informe o título do álbum.' })}
            error={errors.title?.message}
            onChange={handleTitleChange}
          />
          <Input
            label="Slug (link)"
            placeholder="ex.: festa-de-adocao-janeiro"
            {...register('slug', { required: 'Informe o slug.' })}
            error={errors.slug?.message}
            onChange={(e) => {
              setSlugTouched(true);
              setValue('slug', e.target.value, { shouldValidate: true });
            }}
          />
        </div>
        <div className="admin-form-field-full">
          <Textarea
            label="Descrição"
            rows={3}
            placeholder="Descreva o conteúdo do álbum..."
            {...register('description')}
          />
        </div>
        <div className="admin-form-checkboxes">
          <Checkbox
            label="Publicar no portal"
            {...register('published')}
          />
        </div>
        <div className="admin-form-actions">
          <Link to="/admin/galeria">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit" loading={saving}>
            <Save size={18} aria-hidden="true" />
            Salvar álbum
          </Button>
        </div>
      </form>

      {isEditing && id && album && (
        <div className="admin-form">
          <h3>Fotos do álbum</h3>
          <div className="admin-form-grid">
            <Input
              label="Legenda (opcional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Legenda aplicada às novas fotos"
            />
            <Input
              label="Texto alternativo (opcional)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descrição para acessibilidade"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            aria-label="Selecionar fotos para enviar"
          />
          {files.length > 0 && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--admin-muted)', margin: '0.5rem 0' }}>
              {files.length} foto(s) selecionada(s).
            </p>
          )}
          <div className="admin-form-actions">
            <Button type="button" variant="secondary" loading={uploading} disabled={files.length === 0} onClick={handleUpload}>
              <Upload size={18} aria-hidden="true" />
              Enviar fotos
            </Button>
          </div>

          {album.images.length === 0 ? (
            <div
              className="image-fallback"
              role="img"
              aria-label="Álbum sem fotos"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem' }}
            >
              <Camera size={32} aria-hidden="true" strokeWidth={1.5} />
              <span>Nenhuma foto enviada ainda.</span>
            </div>
          ) : (
            <div className="admin-gallery-grid" style={{ marginTop: '1rem' }}>
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
      )}

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
