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
import { fetchAdminProducts, createProduct, updateProduct } from '@/services/products';
import { slugify } from '@/lib/format';

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
      } else {
        await createProduct(input);
      }
      setSubmitState('success');
      setTimeout(() => navigate('/admin/produtos'), 1500);
    } catch {
      setSubmitState('error');
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
