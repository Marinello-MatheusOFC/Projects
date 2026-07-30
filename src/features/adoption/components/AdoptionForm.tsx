import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';

const adoptionFormSchema = z.object({
  applicant_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  applicant_email: z.string().email('E-mail inválido'),
  applicant_phone: z.string().min(10, 'Telefone inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  housing_type: z.enum(['house', 'apartment', 'other'], {
    errorMap: () => ({ message: 'Selecione o tipo de residência' }),
  }),
  has_protective_screens: z.boolean(),
  has_other_animals: z.boolean(),
  household_agreement: z.boolean().refine((val) => val === true, {
    message: 'É necessário que todos os moradores estejam de acordo',
  }),
  reason: z.string().min(10, 'Descreva o motivo da adoção'),
  availability: z.string().min(5, 'Informe sua disponibilidade'),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'É necessário consentir com o tratamento dos dados',
  }),
});

type AdoptionFormData = z.infer<typeof adoptionFormSchema>;

interface AdoptionFormProps {
  animalSlug: string;
  onSuccess: () => void;
}

export function AdoptionForm({ animalSlug: _animalSlug, onSuccess }: AdoptionFormProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdoptionFormData>({
    resolver: zodResolver(adoptionFormSchema),
    defaultValues: {
      has_protective_screens: false,
      has_other_animals: false,
      household_agreement: false,
      privacy_consent: false,
    },
  });

  const onSubmit = async (_data: AdoptionFormData) => {
    setSubmitState('loading');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitState('success');
      setTimeout(() => onSuccess(), 2000);
    } catch {
      setSubmitState('error');
    }
  };

  if (submitState === 'success') {
    return (
      <Alert
        type="success"
        message="Sua manifestação de interesse foi enviada com sucesso! Entraremos em contato em breve."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="adoption-form" noValidate>
      <p className="adoption-form-notice">
        Este formulário é uma manifestação de interesse e não garante a adoção.
        Todo o processo passa por análise e entrevista.
      </p>

      <Input
        label="Nome completo"
        error={errors.applicant_name?.message}
        {...register('applicant_name')}
      />
      <Input
        label="E-mail"
        type="email"
        error={errors.applicant_email?.message}
        {...register('applicant_email')}
      />
      <Input
        label="Telefone"
        type="tel"
        error={errors.applicant_phone?.message}
        {...register('applicant_phone')}
      />
      <Input
        label="Cidade"
        error={errors.city?.message}
        {...register('city')}
      />
      <Select
        label="Tipo de residência"
        options={[
          { value: 'house', label: 'Casa' },
          { value: 'apartment', label: 'Apartamento' },
          { value: 'other', label: 'Outro' },
        ]}
        placeholder="Selecione"
        error={errors.housing_type?.message}
        {...register('housing_type')}
      />
      <Checkbox
        label="A residência possui telas de proteção ou área segura?"
        error={errors.has_protective_screens?.message}
        {...register('has_protective_screens')}
      />
      <Checkbox
        label="Já possui outros animais na residência?"
        error={errors.has_other_animals?.message}
        {...register('has_other_animals')}
      />
      <Checkbox
        label="Todos os moradores estão de acordo com a adoção?"
        error={errors.household_agreement?.message}
        {...register('household_agreement')}
      />
      <Textarea
        label="Por que você deseja adotar?"
        error={errors.reason?.message}
        {...register('reason')}
      />
      <Textarea
        label="Disponibilidade para acompanhamento pós-adoção"
        error={errors.availability?.message}
        {...register('availability')}
      />
      <Checkbox
        label="Autorizo o tratamento dos meus dados pessoais para fins do processo de adoção"
        error={errors.privacy_consent?.message}
        {...register('privacy_consent')}
      />

      {submitState === 'error' && (
        <Alert
          type="error"
          message="Não foi possível enviar sua solicitação. Tente novamente."
        />
      )}

      <Button type="submit" loading={submitState === 'loading'} fullWidth>
        Enviar manifestação de interesse
      </Button>
    </form>
  );
}
