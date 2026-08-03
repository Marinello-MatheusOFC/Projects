import { supabase, withFallback } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import type { SiteSetting } from '@/types';
import { demoSettings } from '@/data/content';

export interface OrgContacts {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export interface OrgSocial {
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface PixInfo {
  pix_key: string;
  pix_owner: string;
}

export interface OrgInfo {
  contacts: OrgContacts;
  social: OrgSocial;
  pix: PixInfo;
  about: { mission: string; short_description: string };
}

export const emptyOrgInfo: OrgInfo = {
  contacts: { email: '', phone: '', whatsapp: '', address: '' },
  social: { instagram: '', facebook: '', youtube: '' },
  pix: { pix_key: '', pix_owner: '' },
  about: { mission: '', short_description: '' },
};

function demoMap(): Map<string, SiteSetting> {
  return new Map(demoSettings.map((s) => [s.key, s]));
}

function fromSettings(settings: Map<string, SiteSetting>): OrgInfo {
  const get = (key: string) => settings.get(key)?.value_json ?? {};
  return {
    contacts: { ...emptyOrgInfo.contacts, ...(get('org_contacts') as Partial<OrgContacts>) },
    social: { ...emptyOrgInfo.social, ...(get('org_social') as Partial<OrgSocial>) },
    pix: { ...emptyOrgInfo.pix, ...(get('donations_pix') as Partial<PixInfo>) },
    about: {
      mission: '',
      short_description: '',
      ...(get('org_about') as Partial<OrgInfo['about']>),
    },
  };
}

export async function fetchOrgInfo(): Promise<OrgInfo> {
  return withFallback(
    async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('public', true);
      return { data: data as SiteSetting[] | null, error };
    },
    [] as SiteSetting[],
  ).then((rows) => {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) {
      return isDemoConfigured() ? fromSettings(demoMap()) : emptyOrgInfo;
    }
    return fromSettings(new Map(list.map((s) => [s.key, s])));
  });
}

export async function fetchAllSettings(): Promise<SiteSetting[]> {
  return withFallback(
    async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      return { data: data as SiteSetting[] | null, error };
    },
    demoSettings as SiteSetting[],
  );
}

export async function saveSiteSetting(
  key: string,
  value: Record<string, unknown>,
  updatedBy?: string | null,
): Promise<void> {
  const existing = await supabase.from('site_settings').select('id').eq('key', key).maybeSingle();
  if (existing.data) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value_json: value, updated_by: updatedBy ?? null })
      .eq('key', key);
    if (error) throw new Error('Não foi possível salvar as configurações.');
    return;
  }
  const { error } = await supabase
    .from('site_settings')
    .insert({ key, value_json: value, public: true, updated_by: updatedBy ?? null });
  if (error) throw new Error('Não foi possível salvar as configurações.');
}
