import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, MessageCircle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Assunto é obrigatório'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'É necessário consentir com o tratamento dos dados',
  }),
  website: z.string().max(0, 'Campo inválido').optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const faqs = [
  {
    question: 'Como funciona o processo de adoção?',
    answer:
      'Você conhece os animais na página de adoção ou presencialmente, realiza uma entrevista com nossa equipe, e nós fazemos uma visita ao seu lar para garantir que o ambiente é seguro. Depois disso, o animal é entregue com vacinas, vermífugo e castração realizados.',
  },
  {
    question: 'Posso doar ração e outros itens?',
    answer:
      'Sim! Você pode doar ração, cobertores, medicamentos e itens de higiene na nossa sede, de segunda a sexta, das 9h às 17h. Também aceitamos doações em pontos de coleta parceiros espalhados pela cidade.',
  },
  {
    question: 'Como me torno voluntário?',
    answer:
      'Preencha o formulário na página de Voluntariado. Após o cadastro, você participa de uma reunião de acolhimento e de um treinamento. Depois disso, é só escolher a área em que quer ajudar: cuidados, eventos, transporte, comunicação e muito mais.',
  },
  {
    question: 'A SOS Focinho Carente tem sede presencial?',
    answer:
      'Temos um abrigo temporário que funciona por agendamento para visitas. Já a sede administrativa fica na Rua das Flores, 123, e funciona de segunda a sexta das 9h às 17h e aos sábados das 9h às 13h.',
  },
  {
    question: 'Encontrei um animal abandonado. E agora?',
    answer:
      'Em primeiro lugar, verifique se o animal está em situação de risco. Se sim, você pode levar a uma clínica parceira da nossa rede e avisar a gente. Se puder, mantenha o animal em segurança até encontrarmos um lar temporário. Nossa equipe orienta você pelo WhatsApp.',
  },
];

export default function ContactPage() {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/animal-paw.jpg"
            alt="Contato da ONG"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="hero"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Contato</h1>
          <p className="page-hero-subtitle">
            Tire suas dúvidas, envie sugestões ou entre em contato conosco.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-cards">
            <div className="contact-card">
              <h3>WhatsApp</h3>
              <p>Atendimento rápido e orientação para resgates.</p>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">(11) 99999-9999</a>
            </div>
            <div className="contact-card">
              <h3>E-mail</h3>
              <p>Para parcerias, doações e imprensa.</p>
              <a href="mailto:contato@sosfocinhocarente.org.br">contato@sosfocinhocarente.org.br</a>
            </div>
            <div className="contact-card">
              <h3>Telefone</h3>
              <p>De segunda a sexta, das 9h às 17h.</p>
              <a href="tel:+551133332222">(11) 3333-2222</a>
            </div>
            <div className="contact-card">
              <h3>Horário de funcionamento</h3>
              <p>Segunda a sexta: 9h às 17h. Sábado: 9h às 13h.</p>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Rua das Flores, 123 — Centro</span>
            </div>
          </div>

          <div className="contact-grid" style={{ marginTop: 'var(--space-16)' }}>
            <div className="contact-info">
              <h2>Fale com a gente</h2>
              <p>
                Estamos abertos a ouvir sua mensagem. Respondemos assim que possível.
              </p>
              <div className="contact-details">
                <div className="contact-detail">
                  <span className="contact-detail-icon"><Mail size={18} aria-hidden="true" /></span>
                  <div>
                    <strong>E-mail</strong>
                    contato@sosfocinhocarente.org.br
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-detail-icon"><Phone size={18} aria-hidden="true" /></span>
                  <div>
                    <strong>Telefone</strong>
                    (11) 3333-2222
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-detail-icon"><MessageCircle size={18} aria-hidden="true" /></span>
                  <div>
                    <strong>WhatsApp</strong>
                    (11) 99999-9999
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-detail-icon"><MapPin size={18} aria-hidden="true" /></span>
                  <div>
                    <strong>Endereço</strong>
                    Rua das Flores, 123 — Centro
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-detail-icon"><Clock size={18} aria-hidden="true" /></span>
                  <div>
                    <strong>Horários</strong>
                    Seg a Sex: 9h às 17h · Sáb: 9h às 13h
                  </div>
                </div>
              </div>

              <div className="contact-social">
                <a href="#" onClick={(e) => e.preventDefault()} className="contact-social-link">Facebook</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="contact-social-link">Instagram</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="contact-social-link">YouTube</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="contact-social-link">TikTok</a>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Envie sua mensagem</h2>

              {submitState === 'success' ? (
                <Alert
                  type="success"
                  message="Mensagem enviada com sucesso! Entraremos em contato em breve."
                />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Perguntas frequentes</h2>
            <p>Tire as principais dúvidas sobre adoção, doações e voluntariado.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="faq-item-button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
                  <span className="faq-item-icon"><Plus size={18} aria-hidden="true" /></span>
                </button>
                {openFaq === index && (
                  <div className="faq-item-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <p className="faq-note">
            Não encontrou sua resposta? Fale com a gente pelo WhatsApp (11) 99999-9999 —
            atendemos de segunda a sexta, das 9h às 17h.
          </p>
        </div>
      </section>
    </div>
  );
}
