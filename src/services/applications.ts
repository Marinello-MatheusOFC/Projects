import { supabase } from '@/lib/images';
import type {
  AdoptionApplication,
  AdoptionStatus,
  AdoptionStatusHistory,
  ContactMessage,
  VolunteerApplication,
  VolunteerStatus,
} from '@/types';

export type AdoptionApplicationInput = {
  animal_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  city: string;
  housing_type: string;
  has_protective_screens: boolean;
  has_other_animals: boolean;
  household_agreement: boolean;
  reason: string;
  availability: string;
  privacy_consent: boolean;
};

export type ContactMessageInput = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  privacy_consent: boolean;
};

export type VolunteerApplicationInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  availability: string;
  interests: string;
  experience?: string | null;
  message?: string | null;
  privacy_consent: boolean;
};

export async function submitAdoptionApplication(
  input: AdoptionApplicationInput,
): Promise<void> {
  const { error } = await supabase.from('adoption_applications').insert(input);
  if (error) throw new Error('Não foi possível enviar seu interesse. Tente novamente em instantes.');
}

export async function fetchAdoptionApplications(): Promise<AdoptionApplication[]> {
  const { data, error } = await supabase
    .from('adoption_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar as solicitações.');
  return (data ?? []) as AdoptionApplication[];
}

export async function fetchAdoptionApplication(id: string): Promise<AdoptionApplication | null> {
  const { data, error } = await supabase
    .from('adoption_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar a solicitação.');
  return (data ?? null) as AdoptionApplication | null;
}

export async function updateAdoptionStatus(
  id: string,
  newStatus: AdoptionStatus,
  note?: string | null,
  changedBy?: string,
): Promise<void> {
  const { data: current } = await supabase
    .from('adoption_applications')
    .select('status')
    .eq('id', id)
    .maybeSingle();
  const previous = (current as { status?: AdoptionStatus } | null)?.status ?? null;

  const { error } = await supabase
    .from('adoption_applications')
    .update({ status: newStatus, internal_notes: note || undefined })
    .eq('id', id);
  if (error) throw new Error('Não foi possível atualizar o status.');

  if (changedBy) {
    await supabase.from('adoption_status_history').insert({
      application_id: id,
      previous_status: previous,
      new_status: newStatus,
      note: note ?? null,
      changed_by: changedBy,
    });
  }
}

export async function fetchAdoptionHistory(id: string): Promise<AdoptionStatusHistory[]> {
  const { data, error } = await supabase
    .from('adoption_status_history')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar o histórico.');
  return (data ?? []) as AdoptionStatusHistory[];
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(input);
  if (error) throw new Error('Não foi possível enviar a mensagem. Tente novamente em instantes.');
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar as mensagens.');
  return (data ?? []) as ContactMessage[];
}

export async function fetchContactMessage(id: string): Promise<ContactMessage | null> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar a mensagem.');
  return (data ?? null) as ContactMessage | null;
}

export async function updateContactMessageStatus(id: string, status: ContactMessage['status']): Promise<void> {
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw new Error('Não foi possível atualizar a mensagem.');
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error('Não foi possível excluir a mensagem.');
}

export async function submitVolunteerApplication(
  input: VolunteerApplicationInput,
): Promise<void> {
  const { error } = await supabase.from('volunteer_applications').insert(input);
  if (error) throw new Error('Não foi possível enviar sua inscrição. Tente novamente em instantes.');
}

export async function fetchVolunteerApplications(): Promise<VolunteerApplication[]> {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar as inscrições.');
  return (data ?? []) as VolunteerApplication[];
}

export async function fetchVolunteerApplication(id: string): Promise<VolunteerApplication | null> {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar a inscrição.');
  return (data ?? null) as VolunteerApplication | null;
}

export async function updateVolunteerStatus(
  id: string,
  status: VolunteerStatus,
  note?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('volunteer_applications')
    .update({ status, internal_notes: note || undefined })
    .eq('id', id);
  if (error) throw new Error('Não foi possível atualizar o status.');
}

export async function deleteVolunteerApplication(id: string): Promise<void> {
  const { error } = await supabase.from('volunteer_applications').delete().eq('id', id);
  if (error) throw new Error('Não foi possível excluir a inscrição.');
}
