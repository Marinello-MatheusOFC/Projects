import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { fetchAllSettings, fetchOrgInfo, saveSiteSetting } from '@/services/settings';
import { useAuth } from '@/features/auth/hooks/useAuth';

type SectionKey = 'contacts' | 'social' | 'pix' | 'about';

type ContactsFormData = { email: string; phone: string; whatsapp: string; address: string };
type SocialFormData = { instagram: string; facebook: string; youtube: string };
type PixFormData = { pix_key: string; pix_owner: string };
type AboutFormData = { mission: string; short_description: string };

const SETTING_KEYS: Record<SectionKey, string> = {
  contacts: 'org_contacts',
  social: 'org_social',
  pix: 'donations_pix',
  about: 'org_about',
};

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [saved, setSaved] = useState<SectionKey | null>(null);
  const [saveError, setSaveError] = useState(false);

  const contactsForm = useForm<ContactsFormData>({
    defaultValues: { email: '', phone: '', whatsapp: '', address: '' },
  });
  const socialForm = useForm<SocialFormData>({
    defaultValues: { instagram: '', facebook: '', youtube: '' },
  });
  const pixForm = useForm<PixFormData>({
    defaultValues: { pix_key: '', pix_owner: '' },
  });
  const aboutForm = useForm<AboutFormData>({
    defaultValues: { mission: '', short_description: '' },
  });

  const { reset: resetContacts } = contactsForm;
  const { reset: resetSocial } = socialForm;
  const { reset: resetPix } = pixForm;
  const { reset: resetAbout } = aboutForm;

  useEffect(() => {
    document.title = 'Configurações — SOS Focinho Carente';
    let active = true;
    Promise.all([fetchAllSettings(), fetchOrgInfo()])
      .then(([allSettings, info]) => {
        if (!active) return;
        setUsingFallback(allSettings.some((s) => s.id.startsWith('demo-')));
        resetContacts(info.contacts);
        resetSocial(info.social);
        resetPix(info.pix);
        resetAbout(info.about);
        setLoading(false);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [resetContacts, resetSocial, resetPix, resetAbout]);

  const handleSave = async (key: SectionKey, value: Record<string, unknown>) => {
    setSaving(key);
    setSaved(null);
    setSaveError(false);
    try {
      await saveSiteSetting(SETTING_KEYS[key], value, profile?.id ?? null);
      setSaved(key);
      setTimeout(() => setSaved(null), 3000);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(null);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Configurações</h2>
        <ErrorState message="Não foi possível carregar as configurações." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Configurações</h2>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Configurações</h2>
      <p className="admin-page-subtitle">
        Informações exibidas no site (contato, redes sociais, doação PIX e sobre a ONG).
      </p>

      {usingFallback && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Alert
            type="info"
            message="Exibindo dados de demonstração — o backend local não está disponível. As alterações não serão persistidas."
          />
        </div>
      )}

      {saveError && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Alert type="error" message="Não foi possível salvar as configurações." />
        </div>
      )}

      <div className="admin-form">
        <h3>Contatos</h3>
        {saved === 'contacts' && (
          <Alert type="success" message="Contatos salvos com sucesso!" />
        )}
        <form
          onSubmit={contactsForm.handleSubmit((data) => handleSave('contacts', data))}
          noValidate
        >
          <div className="admin-form-grid">
            <Input
              label="E-mail"
              type="email"
              placeholder="contato@ong.org"
              {...contactsForm.register('email')}
            />
            <Input
              label="Telefone"
              placeholder="(00) 0000-0000"
              {...contactsForm.register('phone')}
            />
            <Input
              label="WhatsApp"
              placeholder="(00) 00000-0000"
              {...contactsForm.register('whatsapp')}
            />
            <Input
              label="Endereço"
              placeholder="Rua, número, bairro, cidade"
              {...contactsForm.register('address')}
            />
          </div>
          <div className="admin-form-actions">
            <Button type="submit" loading={saving === 'contacts'}>
              Salvar contatos
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-form">
        <h3>Redes sociais</h3>
        {saved === 'social' && (
          <Alert type="success" message="Redes sociais salvas com sucesso!" />
        )}
        <form onSubmit={socialForm.handleSubmit((data) => handleSave('social', data))} noValidate>
          <div className="admin-form-grid">
            <Input
              label="Instagram"
              placeholder="@sosfocinhocarente"
              {...socialForm.register('instagram')}
            />
            <Input
              label="Facebook"
              placeholder="facebook.com/sosfocinhocarente"
              {...socialForm.register('facebook')}
            />
            <Input
              label="YouTube"
              placeholder="youtube.com/@sosfocinhocarente"
              {...socialForm.register('youtube')}
            />
          </div>
          <div className="admin-form-actions">
            <Button type="submit" loading={saving === 'social'}>
              Salvar redes sociais
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-form">
        <h3>Doação PIX</h3>
        {saved === 'pix' && <Alert type="success" message="Dados PIX salvos com sucesso!" />}
        <form onSubmit={pixForm.handleSubmit((data) => handleSave('pix', data))} noValidate>
          <div className="admin-form-grid">
            <Input
              label="Chave PIX"
              placeholder="email@ong.org"
              {...pixForm.register('pix_key')}
            />
            <Input
              label="Titular da conta"
              placeholder="Nome completo do responsável"
              {...pixForm.register('pix_owner')}
            />
          </div>
          <div className="admin-form-actions">
            <Button type="submit" loading={saving === 'pix'}>
              Salvar PIX
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-form">
        <h3>Sobre</h3>
        {saved === 'about' && <Alert type="success" message="Informações salvas com sucesso!" />}
        <form onSubmit={aboutForm.handleSubmit((data) => handleSave('about', data))} noValidate>
          <Textarea
            label="Missão"
            placeholder="Descreva a missão da organização"
            rows={4}
            {...aboutForm.register('mission')}
          />
          <Textarea
            label="Descrição curta"
            placeholder="Descrição resumida exibida no site"
            rows={3}
            {...aboutForm.register('short_description')}
          />
          <div className="admin-form-actions">
            <Button type="submit" loading={saving === 'about'}>
              Salvar informações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
