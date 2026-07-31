import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, MessageCircle, Plus, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/feedback/Alert';
import { PageHeader } from '@/components/layout/PageHeader';
import { submitContactMessage } from '@/services/applications';
import { fetchOrgInfo, type OrgInfo } from '@/services/settings';

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

const socialLinks: {
  key: keyof OrgInfo['social'];
  href: (url: string) => string;
  label: string;
  icon: typeof Instagram;
}[] = [
  { key: 'instagram', href: (u) => (u.startsWith('http') ? u : `https://instagram.com/${u}`), label: 'Instagram', icon: Instagram },
  { key: 'facebook', href: (u) => (u.startsWith('http') ? u : `https://facebook.com/${u}`), label: 'Facebook', icon: Facebook },
  { key: 'youtube', href: (u) => (u.startsWith('http') ? u : `https://youtube.com/@${u}`), label: 'YouTube', icon: Youtube },
];

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
  const [org, setOrg] = useState<OrgInfo | null>(null);

  useEffect(() => {
    document.title = 'Contato — SOS Focinho Carente';
    let active = true;
    fetchOrgInfo().then((info) => {
      if (active) setOrg(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { privacy_consent: false, website: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitState('loading');
    try {
      await submitContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        privacy_consent: data.privacy_consent,
      });
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  const contacts = org?.contacts;
  const socials = org?.social;
  const hasContactDetails = Boolean(
    contacts && (contacts.email || contacts.phone || contacts.whatsapp || contacts.address),
  );
  const hasSocials = Boolean(
    socials && socialLinks.some((s) => socials[s.key]),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Fale conosco"
        title="Contato"
        subtitle="Tire suas dúvidas, envie sugestões ou entre em contato conosco."
        media={{
          src: '/images/demo/animal-bunny.jpg',
          alt: 'Animal acolhido pela ONG',
          objectPosition: 'center 50%',
          fallback: 'hero',
        }}
      />

      <section className="section">
        <div className="container">
          {hasContactDetails && contacts && (
            <div className="contact-cards">
              {contacts.whatsapp && (
                <div className="contact-card">
                  <h3>WhatsApp</h3>
                  <p>Atendimento rápido e orientação para resgates.</p>
                  <a href={`https://wa.me/${contacts.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    {contacts.whatsapp}
                  </a>
                </div>
              )}
              {contacts.email && (
                <div className="contact-card">
                  <h3>E-mail</h3>
                  <p>Para parcerias, doações e imprensa.</p>
                  <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                </div>
              )}
              {contacts.phone && (
                <div className="contact-card">
                  <h3>Telefone</h3>
                  <p>Para atendimento direto com a nossa equipe.</p>
                  <a href={`tel:${contacts.phone}`}>{contacts.phone}</a>
                </div>
              )}
              {contacts.address && (
                <div className="contact-card">
                  <h3>Endereço</h3>
                  <p>Visitas com agendamento prévio.</p>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {contacts.address}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="contact-grid" style={{ marginTop: 'var(--space-16)' }}>
            <div className="contact-info">
              <span className="eyebrow">Fale com a gente</span>
              <h2>Entre em contato</h2>
              <p>
                Estamos abertos a ouvir sua mensagem. Respondemos assim que possível.
              </p>
              <div className="contact-details">
                {contacts?.email && (
                  <div className="contact-detail">
                    <span className="contact-detail-icon"><Mail size={18} aria-hidden="true" /></span>
                    <div>
                      <strong>E-mail</strong>
                      <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                    </div>
                  </div>
                )}
                {contacts?.phone && (
                  <div className="contact-detail">
                    <span className="contact-detail-icon"><Phone size={18} aria-hidden="true" /></span>
                    <div>
                      <strong>Telefone</strong>
                      <a href={`tel:${contacts.phone}`}>{contacts.phone}</a>
                    </div>
                  </div>
                )}
                {contacts?.whatsapp && (
                  <div className="contact-detail">
                    <span className="contact-detail-icon"><MessageCircle size={18} aria-hidden="true" /></span>
                    <div>
                      <strong>WhatsApp</strong>
                      <a href={`https://wa.me/${contacts.whatsapp}`} target="_blank" rel="noopener noreferrer">
                        {contacts.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                {contacts?.address && (
                  <div className="contact-detail">
                    <span className="contact-detail-icon"><MapPin size={18} aria-hidden="true" /></span>
                    <div>
                      <strong>Endereço</strong>
                      {contacts.address}
                    </div>
                  </div>
                )}
                {!hasContactDetails && (
                  <div className="contact-detail">
                    <span className="contact-detail-icon"><MessageCircle size={18} aria-hidden="true" /></span>
                    <div>
                      <strong>Entre em contato</strong>
                      Envie sua mensagem pelo formulário e responderemos assim que possível.
                    </div>
                  </div>
                )}
              </div>

              {hasSocials && (
                <div className="contact-social">
                  {socialLinks
                    .filter((s) => socials?.[s.key])
                    .map(({ key, href, label, icon: Icon }) => (
                      <a
                        key={key}
                        href={href(socials![key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-social-link"
                        aria-label={label}
                        title={label}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </a>
                    ))}
                </div>
              )}
            </div>

            <div>
              <span className="eyebrow">Mensagem</span>
              <h2 className="section-title">Envie sua mensagem</h2>

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
            <span className="eyebrow">Dúvidas frequentes</span>
            <h2>Perguntas frequentes</h2>
            <p>Tire as principais dúvidas sobre adoção, doações e voluntariado.</p>
          </div>

          <div className="faq-list" style={{ margin: '0 auto' }}>
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

          <p className="faq-note" style={{ maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            {contacts?.whatsapp
              ? `Não encontrou sua resposta? Fale com a gente pelo WhatsApp ${contacts.whatsapp} — atendemos de segunda a sexta, das 9h às 17h.`
              : 'Não encontrou sua resposta? Envie sua mensagem pelo formulário acima e responderemos assim que possível.'}
          </p>
        </div>
      </section>
    </div>
  );
}
