import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Star, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import {
  fetchAdminAnimals,
  createAnimal,
  updateAnimal,
  uploadAnimalImage,
  setAnimalCover,
  deleteAnimalImage,
  type AnimalWithImages,
  type AnimalInput,
} from '@/services/animals';
import { slugify } from '@/lib/format';
import { resolveImageUrl } from '@/lib/images';
import type { AnimalImage } from '@/types';

const animalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  species: z.enum(['dog', 'cat', 'other'], { errorMap: () => ({ message: 'Selecione uma espécie' }) }),
  sex: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Selecione o sexo' }) }),
  size: z.enum(['small', 'medium', 'large'], { errorMap: () => ({ message: 'Selecione o porte' }) }),
  birth_date_estimate: z.string().optional(),
  age_text: z.string().optional(),
  description: z.string().optional(),
  history: z.string().optional(),
  health_notes: z.string().optional(),
  personality: z.string().optional(),
  compatibility_notes: z.string().optional(),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
  special_needs: z.boolean(),
  status: z.enum(['available', 'adopted', 'in_process', 'archived']),
  featured: z.boolean(),
  published: z.boolean(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function AdminAnimalsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [animal, setAnimal] = useState<AnimalWithImages | null>(null);
  const [images, setImages] = useState<AnimalImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      species: 'dog',
      sex: 'male',
      size: 'medium',
      status: 'available',
      vaccinated: false,
      neutered: false,
      special_needs: false,
      featured: false,
      published: true,
    },
  });

  const loadAnimal = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setLoadError(false);
    fetchAdminAnimals()
      .then((animals) => {
        if (!active) return;
        const found = animals.find((a) => a.id === id);
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setAnimal(found);
        setImages(found.images);
        reset({
          name: found.name,
          species: found.species,
          sex: found.sex,
          size: found.size,
          birth_date_estimate: found.birth_date_estimate ?? '',
          age_text: found.age_text ?? '',
          description: found.description ?? '',
          history: found.history ?? '',
          health_notes: found.health_notes ?? '',
          personality: found.personality ?? '',
          compatibility_notes: found.compatibility_notes ?? '',
          vaccinated: found.vaccinated,
          neutered: found.neutered,
          special_needs: found.special_needs,
          status: found.status,
          featured: found.featured,
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

  useEffect(() => loadAnimal(), [loadAnimal]);

  const handleUpload = async () => {
    if (!id || !selectedFile) return;
    setUploading(true);
    setImageError('');
    try {
      const image = await uploadAnimalImage(id, selectedFile, images.length === 0);
      if (image) {
        setImages((prev) => [...prev, image]);
        setSelectedFile(null);
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = async (imageId: string) => {
    if (!id) return;
    setImageError('');
    try {
      await setAnimalCover(id, imageId);
      setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === imageId })));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Não foi possível definir a imagem de capa.');
    }
  };

  const handleRemoveImage = async (image: AnimalImage) => {
    if (!window.confirm('Tem certeza que deseja remover esta foto?')) return;
    setImageError('');
    try {
      await deleteAnimalImage(image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Não foi possível remover a imagem.');
    }
  };

  const onSubmit = async (data: AnimalFormData) => {
    setSubmitState('loading');
    const input: AnimalInput = {
      name: data.name,
      slug: slugify(data.name),
      species: data.species,
      sex: data.sex,
      size: data.size,
      birth_date_estimate: data.birth_date_estimate || null,
      age_text: data.age_text || null,
      description: data.description || null,
      history: data.history || null,
      health_notes: data.health_notes || null,
      personality: data.personality || null,
      compatibility_notes: data.compatibility_notes || null,
      vaccinated: data.vaccinated,
      neutered: data.neutered,
      special_needs: data.special_needs,
      status: data.status,
      featured: data.featured,
      published: data.published,
    };
    try {
      if (isEditing && id) {
        await updateAnimal(id, input);
      } else {
        await createAnimal(input);
      }
      setSubmitState('success');
      setTimeout(() => navigate('/admin/animais'), 1200);
    } catch {
      setSubmitState('error');
    }
  };

  const coverImage = images.find((img) => img.is_cover) ?? images[0];
  const coverUrl = coverImage ? resolveImageUrl(coverImage.storage_path) : (animal?.cover ?? '');

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">{isEditing ? 'Editar Animal' : 'Novo Animal'}</h2>

      {submitState === 'success' && (
        <Alert
          type="success"
          message={`Animal ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`}
        />
      )}
      {notFound && <Alert type="error" message="Animal não encontrado." />}
      {submitState === 'error' && (
        <Alert
          type="error"
          message={`Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o animal.`}
          onClose={() => setSubmitState('idle')}
        />
      )}

      {isEditing && loading ? (
        <TableSkeleton />
      ) : loadError ? (
        <ErrorState message="Não foi possível carregar os dados do animal." onRetry={loadAnimal} />
      ) : notFound ? (
        <div className="admin-form-actions">
          <Link to="/admin/animais">
            <Button variant="outline">Voltar para a listagem</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
          <div className="admin-form-grid">
            <Input
              label="Nome do animal"
              error={errors.name?.message}
              {...register('name')}
            />
            <Select
              label="Espécie"
              options={[
                { value: 'dog', label: 'Cachorro' },
                { value: 'cat', label: 'Gato' },
                { value: 'other', label: 'Outro' },
              ]}
              error={errors.species?.message}
              {...register('species')}
            />
            <Select
              label="Sexo"
              options={[
                { value: 'male', label: 'Macho' },
                { value: 'female', label: 'Fêmea' },
              ]}
              error={errors.sex?.message}
              {...register('sex')}
            />
            <Select
              label="Porte"
              options={[
                { value: 'small', label: 'Pequeno' },
                { value: 'medium', label: 'Médio' },
                { value: 'large', label: 'Grande' },
              ]}
              error={errors.size?.message}
              {...register('size')}
            />
            <Input
              label="Data estimada de nascimento"
              type="date"
              error={errors.birth_date_estimate?.message}
              {...register('birth_date_estimate')}
            />
            <Input
              label="Idade (texto livre)"
              error={errors.age_text?.message}
              {...register('age_text')}
            />
            <Select
              label="Status"
              options={[
                { value: 'available', label: 'Disponível' },
                { value: 'in_process', label: 'Em processo' },
                { value: 'adopted', label: 'Adotado' },
                { value: 'archived', label: 'Arquivado' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <Textarea
            label="Descrição"
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="História"
            error={errors.history?.message}
            {...register('history')}
          />
          <Textarea
            label="Condições de saúde"
            error={errors.health_notes?.message}
            {...register('health_notes')}
          />
          <Textarea
            label="Personalidade"
            error={errors.personality?.message}
            {...register('personality')}
          />
          <Textarea
            label="Notas de compatibilidade"
            error={errors.compatibility_notes?.message}
            {...register('compatibility_notes')}
          />

          <div className="admin-form-checkboxes">
            <Checkbox label="Vacinado" {...register('vaccinated')} />
            <Checkbox label="Castrado" {...register('neutered')} />
            <Checkbox label="Necessidades especiais" {...register('special_needs')} />
            <Checkbox label="Destacar na página inicial" {...register('featured')} />
            <Checkbox label="Publicado no site" {...register('published')} />
          </div>

          {isEditing && animal && (
            <div style={{ margin: 'var(--space-6) 0' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                Fotos
              </h3>

              {imageError && (
                <Alert type="error" message={imageError} onClose={() => setImageError('')} />
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  margin: 'var(--space-4) 0',
                }}
              >
                {images.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                      alignItems: 'flex-start',
                    }}
                  >
                    <ResponsivePicture
                      src={resolveImageUrl(image.storage_path)}
                      width={120}
                      height={90}
                      fallback="animal"
                      alt={`Foto de ${animal.name}`}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      {image.is_cover ? (
                        <Badge variant="success">
                          <CheckCircle2 size={14} aria-hidden="true" /> Capa
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Definir capa"
                          title="Definir capa"
                          onClick={() => handleSetCover(image.id)}
                        >
                          <Star size={16} aria-hidden="true" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remover foto"
                        title="Remover foto"
                        onClick={() => handleRemoveImage(image)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <ResponsivePicture
                src={coverUrl}
                width={160}
                height={120}
                fallback="animal"
                alt={`Foto de capa de ${animal.name}`}
              />

              <div className="admin-form-grid" style={{ marginTop: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="animal-photo">
                    Foto do animal
                  </label>
                  <input
                    id="animal-photo"
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <div className="admin-form-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!selectedFile}
                >
                  <ImagePlus size={16} aria-hidden="true" />
                  Enviar foto
                </Button>
              </div>
            </div>
          )}

          <div className="admin-form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/animais')}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitState === 'loading'}>
              {isEditing ? 'Salvar alterações' : 'Cadastrar animal'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
