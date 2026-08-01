import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';
import { PageHeader } from '@/components/layout/PageHeader';
import { submitVolunteerApplication } from '@/services/applications';

const volunteerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  availability: z.string().min(5, 'Informe sua disponibilidade'),
  interests: z.string().min(10, 'Descreva suas áreas de interesse'),
  experience: z.string().optional(),
  message: z.string().optional(),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'É necessário consentir com o tratamento dos dados',
  }),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

export default function VolunteeringPage() {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.title = 'Voluntariado — SOS Focinho Carente';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { privacy_consent: false },
  });

  const onSubmit = async (data: VolunteerFormData) => {
    setSubmitState('loading');
    try {
      await submitVolunteerApplication({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        availability: data.availability,
        interests: data.interests,
        experience: data.experience || null,
        message: data.message || null,
        privacy_consent: data.privacy_consent,
      });
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div>
      <PageHeader
        tone="green"
        eyebrow="Faça parte"
        title="Voluntariado"
        subtitle="Sua dedicação pode transformar o dia de um animal."
        media={{
          src: '/images/demo/care-volunteer.jpg',
          alt: 'Voluntário cuidando de um animal',
          objectPosition: 'center 50%',
          fallback: 'care',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          <div className="volunteering-grid">
            <div className="volunteering-info">
              <span className="eyebrow">Faça parte</span>
              <h2>Por que ser voluntário?</h2>
              <p>
                O voluntariado é essencial para o funcionamento da nossa organização.
                Com sua ajuda, podemos atender mais animais e promover ações de
                conscientização.
              </p>
              <ul className="volunteering-benefits">
                <li>Cuidar e socializar animais resgatados</li>
                <li>Auxiliar em eventos e campanhas</li>
                <li>Apoiar na divulgação das ações</li>
                <li>Contribuir com habilidades profissionais</li>
                <li>Fazer parte de uma comunidade engajada</li>
              </ul>
            </div>

            <div>
              <span className="eyebrow">Inscrição</span>
              <h2 className="section-title">Cadastro de Interesse</h2>

              {submitState === 'success' ? (
                <Alert
                  type="success"
                  message="Seu cadastro de interesse foi enviado com sucesso! Entraremos em contato."
                />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Input
                    label="Nome completo"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Telefone"
                    type="tel"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Cidade"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Textarea
                    label="Disponibilidade (dias e horários)"
                    error={errors.availability?.message}
                    {...register('availability')}
                  />
                  <Textarea
                    label="Áreas de interesse"
                    error={errors.interests?.message}
                    {...register('interests')}
                  />
                  <Textarea
                    label="Experiência anterior (opcional)"
                    {...register('experience')}
                  />
                  <Textarea
                    label="Mensagem (opcional)"
                    {...register('message')}
                  />
                  <Checkbox
                    label="Autorizo o tratamento dos meus dados pessoais para fins de voluntariado"
                    error={errors.privacy_consent?.message}
                    {...register('privacy_consent')}
                  />

                  {submitState === 'error' && (
                    <Alert
                      type="error"
                      message="Não foi possível enviar seu cadastro. Tente novamente."
                    />
                  )}

                  <Button type="submit" loading={submitState === 'loading'} fullWidth>
                    Enviar cadastro
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
