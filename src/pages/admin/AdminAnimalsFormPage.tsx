import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';

const animalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  species: z.enum(['dog', 'cat', 'other'], { errorMap: () => ({ message: 'Selecione uma espécie' }) }),
  sex: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Selecione o sexo' }) }),
  size: z.enum(['small', 'medium', 'large'], { errorMap: () => ({ message: 'Selecione o porte' }) }),
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
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function AdminAnimalsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
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
    },
  });

  const onSubmit = async (_data: AnimalFormData) => {
    setSubmitState('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitState('success');
      setTimeout(() => navigate('/admin/animais'), 1500);
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">
        {isEditing ? 'Editar Animal' : 'Novo Animal'}
      </h2>

      {submitState === 'success' && (
        <Alert
          type="success"
          message={`Animal ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`}
        />
      )}

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
        </div>

        {submitState === 'error' && (
          <Alert
            type="error"
            message={`Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o animal.`}
          />
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
    </div>
  );
}
