import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Assunto é obrigatório'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'É necessário consentir com o tratamento dos dados',
  }),
  // Honeypot
  website: z.string().max(0, 'Campo inválido').optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { privacy_consent: false, website: '' },
  });

  const onSubmit = async (_data: ContactFormData) => {
    setSubmitState('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Contato</h1>
          <p className="page-hero-subtitle">
            Tire suas dúvidas, envie sugestões ou entre em contato conosco.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-form-wrapper">
              <h2>Envie sua mensagem</h2>

              {submitState === 'success' ? (
                <Alert
                  type="success"
                  message="Mensagem enviada com sucesso! Entraremos em contato em breve."
                />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="contact-form" noValidate>
                  {/* Honeypot - hidden from users */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      {...register('website')}
                    />
                  </div>

                  <Input
                    label="Nome"
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
                    label="Telefone (opcional)"
                    type="tel"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Assunto"
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                  <Textarea
                    label="Mensagem"
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <Checkbox
                    label="Autorizo o tratamento dos meus dados pessoais para fins de resposta"
                    error={errors.privacy_consent?.message}
                    {...register('privacy_consent')}
                  />

                  {submitState === 'error' && (
                    <Alert
                      type="error"
                      message="Não foi possível enviar sua mensagem. Tente novamente."
                    />
                  )}

                  <Button type="submit" loading={submitState === 'loading'} fullWidth>
                    Enviar mensagem
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
