import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { fetchAdminEvents, createEvent, updateEvent, uploadEventImage, type EventInput } from '@/services/events';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/format';
import { resolveImageUrl } from '@/lib/images';
import { logAudit } from '@/services/audit';

const eventSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  summary: z.string().optional(),
  description: z.string().optional(),
  start_at: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Informe uma data e horário válidos'),
  end_at: z.string().optional(),
  location_name: z.string().optional(),
  address: z.string().optional(),
  external_url: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), 'Informe uma URL válida (http/https)'),
  status: z.enum(['scheduled', 'cancelled', 'completed'], {
    errorMap: () => ({ message: 'Selecione um status' }),
  }),
  published: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminEventsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: 'scheduled',
      published: false,
    },
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchAdminEvents()
      .then((rows) => {
        if (!active) return;
        const found = rows.find((event) => event.id === id);
        if (!found) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        setCurrentSlug(found.slug);
        setImagePath(found.image_path);
        reset({
          title: found.title,
          summary: found.summary ?? '',
          description: found.description ?? '',
          start_at: toDateTimeLocal(found.start_at),
          end_at: found.end_at ? toDateTimeLocal(found.end_at) : '',
          location_name: found.location_name ?? '',
          address: found.address ?? '',
          external_url: found.external_url ?? '',
          status: found.status,
          published: found.published,
        });
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, reset]);

  const onSubmit = async (data: EventFormData) => {
    setSubmitState('loading');
    try {
      const input: EventInput = {
        title: data.title,
        slug: currentSlug ?? slugify(data.title),
        summary: data.summary || null,
        description: data.description || null,
        start_at: new Date(data.start_at).toISOString(),
        end_at: data.end_at ? new Date(data.end_at).toISOString() : null,
        location_name: data.location_name || null,
        address: data.address || null,
        external_url: data.external_url || null,
        status: data.status,
        published: data.published,
      };
      if (isEditing && id) {
        await updateEvent(id, input);
        await logAudit('atualizar', 'event', id, { title: input.title, slug: input.slug });
        setSubmitState('success');
        setTimeout(() => navigate('/admin/eventos'), 1500);
      } else {
        const created = await createEvent(input);
        if (created) await logAudit('criar', 'event', created.id, { title: input.title, slug: input.slug });
        setSubmitState('success');
        if (created) {
          setTimeout(() => navigate(`/admin/eventos/${created.id}/editar`, { replace: true }), 1200);
        } else {
          setTimeout(() => navigate('/admin/eventos'), 1200);
        }
      }
    } catch {
      setSubmitState('error');
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return;
    setImageUploading(true);
    setImageError('');
    try {
      const storagePath = await uploadEventImage(id, file);
      if (storagePath) setImagePath(storagePath);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h2>
        <TableSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h2>
        <ErrorState message="Não foi possível carregar o evento." />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h2>

      {submitState === 'success' && (
        <Alert type="success" message={`Evento ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
        <div className="admin-form-grid">
          <Input label="Título" error={errors.title?.message} {...register('title')} />
          <Select
            label="Status"
            options={[
              { value: 'scheduled', label: 'Agendado' },
              { value: 'cancelled', label: 'Cancelado' },
              { value: 'completed', label: 'Concluído' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
          <Input
            label="Data e horário de início"
            type="datetime-local"
            error={errors.start_at?.message}
            {...register('start_at')}
          />
          <Input
            label="Data e horário de término"
            type="datetime-local"
            error={errors.end_at?.message}
            {...register('end_at')}
          />
          <Input label="Local" error={errors.location_name?.message} {...register('location_name')} />
          <Input label="Endereço" error={errors.address?.message} {...register('address')} />
          <Input
            label="Link externo"
            placeholder="https://..."
            error={errors.external_url?.message}
            {...register('external_url')}
          />
        </div>

        <Textarea label="Resumo" error={errors.summary?.message} {...register('summary')} />
        <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />

        {isEditing && id && (
          <ImageUpload
            label="Imagem do evento"
            alt="Imagem de capa do evento"
            fallback="event"
            currentUrl={resolveImageUrl(imagePath)}
            busy={imageUploading}
            error={imageError}
            onClearError={() => setImageError('')}
            onUpload={handleUpload}
          />
        )}

        <div className="admin-form-checkboxes">
          <Checkbox label="Publicado no site" {...register('published')} />
        </div>

        {submitState === 'error' && (
          <Alert type="error" message={`Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o evento.`} />
        )}

        <div className="admin-form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/eventos')}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitState === 'loading'}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar evento'}
          </Button>
        </div>
      </form>
    </div>
  );
}
