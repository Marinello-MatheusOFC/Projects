import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { fetchAdminNews, createNews, updateNews, type NewsInput } from '@/services/news';
import { slugify } from '@/lib/format';

const newsSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published'], {
    errorMap: () => ({ message: 'Selecione um status' }),
  }),
  published_at: z.string().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminNewsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchAdminNews()
      .then((rows) => {
        if (!active) return;
        const found = rows.find((item) => item.id === id);
        if (!found) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        reset({
          title: found.title,
          excerpt: found.excerpt ?? '',
          content: found.content ?? '',
          status: found.status,
          published_at: found.published_at ? toDateTimeLocal(found.published_at) : '',
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

  const onSubmit = async (data: NewsFormData) => {
    setSubmitState('loading');
    try {
      let publishedAt: string | null = data.published_at ? new Date(data.published_at).toISOString() : null;
      if (data.status === 'published' && !publishedAt) {
        publishedAt = new Date().toISOString();
      }
      const input: NewsInput = {
        title: data.title,
        slug: slugify(data.title),
        excerpt: data.excerpt || null,
        content: data.content || null,
        status: data.status,
        published_at: publishedAt,
      };
      if (isEditing && id) {
        await updateNews(id, input);
      } else {
        await createNews(input);
      }
      setSubmitState('success');
      setTimeout(() => navigate('/admin/noticias'), 1500);
    } catch {
      setSubmitState('error');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h2>
        <TableSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h2>
        <ErrorState message="Não foi possível carregar a notícia." />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h2>

      {submitState === 'success' && (
        <Alert type="success" message={`Notícia ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
        <div className="admin-form-grid">
          <Input label="Título" error={errors.title?.message} {...register('title')} />
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Rascunho' },
              { value: 'published', label: 'Publicada' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
          <Input
            label="Data de publicação"
            type="datetime-local"
            error={errors.published_at?.message}
            {...register('published_at')}
          />
        </div>

        <Textarea label="Resumo" error={errors.excerpt?.message} {...register('excerpt')} />
        <Textarea label="Conteúdo" error={errors.content?.message} {...register('content')} />

        {submitState === 'error' && (
          <Alert type="error" message={`Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} a notícia.`} />
        )}

        <div className="admin-form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/noticias')}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitState === 'loading'}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar notícia'}
          </Button>
        </div>
      </form>
    </div>
  );
}
