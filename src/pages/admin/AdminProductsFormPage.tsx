import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { fetchAdminProducts, createProduct, updateProduct, uploadProductImage } from '@/services/products';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/format';
import { resolveImageUrl } from '@/lib/images';
import { logAudit } from '@/services/audit';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.coerce
    .number({ errorMap: () => ({ message: 'Informe um valor válido' }) })
    .min(0, 'O preço não pode ser negativo'),
  available: z.boolean(),
  featured: z.boolean(),
  published: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProductsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loadingData, setLoadingData] = useState(isEditing);
  const [loadError, setLoadError] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      available: true,
      featured: false,
      published: true,
    },
  });

  useEffect(() => {
    document.title = isEditing
      ? 'Editar Produto — SOS Focinho Carente'
      : 'Novo Produto — SOS Focinho Carente';
    if (!isEditing) return;
    let active = true;
    fetchAdminProducts()
      .then((list) => {
        if (!active) return;
        const found = list.find((p) => p.id === id);
        if (found) {
          setImagePath(found.image_path);
          reset({
            name: found.name,
            description: found.description ?? '',
            price: found.price,
            available: found.available,
            featured: found.featured,
            published: found.published,
          });
        } else {
          setLoadError(true);
        }
        setLoadingData(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [id, isEditing, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitState('loading');
    const input = {
      name: data.name,
      slug: slugify(data.name),
      description: data.description || null,
      price: data.price,
      available: data.available,
      featured: data.featured,
      published: data.published,
    };
    try {
      if (isEditing && id) {
        await updateProduct(id, input);
        await logAudit('atualizar', 'product', id, { name: input.name, slug: input.slug });
        setSubmitState('success');
        setTimeout(() => navigate('/admin/produtos'), 1500);
      } else {
        const created = await createProduct(input);
        if (created) await logAudit('criar', 'product', created.id, { name: input.name, slug: input.slug });
        setSubmitState('success');
        if (created) {
          setTimeout(() => navigate(`/admin/produtos/${created.id}/editar`, { replace: true }), 1200);
        } else {
          setTimeout(() => navigate('/admin/produtos'), 1200);
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
      const storagePath = await uploadProductImage(id, file);
      if (storagePath) setImagePath(storagePath);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setImageUploading(false);
    }
  };

  if (loadError) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
        <ErrorState message="Não foi possível carregar o produto." />
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
      <p className="admin-page-subtitle">
        {isEditing
          ? 'Atualize as informações do produto do brechó.'
          : 'Cadastre um novo produto do brechó beneficente.'}
      </p>

      {submitState === 'success' && (
        <Alert
          type="success"
          message={`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
        <div className="admin-form-grid">
          <Input
            label="Nome do produto"
            placeholder="Ex.: Camiseta SOS Focinho Carente"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price')}
          />
        </div>

        <Textarea
          label="Descrição"
          placeholder="Descrição do produto, estado de conservação etc."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="admin-form-checkboxes">
          <Checkbox label="Disponível para venda" {...register('available')} />
          <Checkbox label="Destacar no brechó" {...register('featured')} />
          <Checkbox label="Publicado" {...register('published')} />
        </div>

        {isEditing && id && (
          <ImageUpload
            label="Foto do produto"
            alt="Foto do produto do brechó"
            fallback="product"
            currentUrl={resolveImageUrl(imagePath)}
            busy={imageUploading}
            error={imageError}
            onClearError={() => setImageError('')}
            onUpload={handleUpload}
          />
        )}

        {submitState === 'error' && (
          <Alert
            type="error"
            message={`Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o produto.`}
          />
        )}

        <div className="admin-form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/produtos')}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitState === 'loading'}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
