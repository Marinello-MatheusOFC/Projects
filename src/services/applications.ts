import { supabase, withFallback } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import type {
  AdoptionApplication,
  AdoptionStatus,
  AdoptionStatusHistory,
  ContactMessage,
  VolunteerApplication,
  VolunteerStatus,
} from '@/types';
import {
  demoAdoptionApplications,
  demoContactMessages,
  demoVolunteerApplications,
} from '@/data/applications';

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
  user_id?: string | null;
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
  try {
    const { error } = await supabase.from('adoption_applications').insert(input);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível enviar seu interesse. Tente novamente em instantes.');
  }
}

export async function fetchAdoptionApplications(): Promise<AdoptionApplication[]> {
  return withFallback(
    async () =>
      supabase
        .from('adoption_applications')
        .select('*')
        .order('created_at', { ascending: false }),
    [] as AdoptionApplication[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0) return rows as AdoptionApplication[];
    return isDemoConfigured() ? demoAdoptionApplications : ([] as AdoptionApplication[]);
  });
}

export async function fetchAdoptionApplication(id: string): Promise<AdoptionApplication | null> {
  return withFallback(
    async () =>
      supabase
        .from('adoption_applications')
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    null as AdoptionApplication | null,
  ).then((row) => {
    if (row) return row as AdoptionApplication;
    return isDemoConfigured()
      ? (demoAdoptionApplications.find((a) => a.id === id) ?? null)
      : null;
  });
}

export async function updateAdoptionStatus(
  id: string,
  newStatus: AdoptionStatus,
  note?: string | null,
  changedBy?: string,
): Promise<void> {
  try {
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
    if (error) throw error;

    if (changedBy) {
      await supabase.from('adoption_status_history').insert({
        application_id: id,
        previous_status: previous,
        new_status: newStatus,
        note: note ?? null,
        changed_by: changedBy,
      });
    }
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível atualizar o status.');
  }
}

export async function fetchAdoptionHistory(id: string): Promise<AdoptionStatusHistory[]> {
  return withFallback(
    async () =>
      supabase
        .from('adoption_status_history')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: false }),
    [] as AdoptionStatusHistory[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0) return rows as AdoptionStatusHistory[];
    return isDemoConfigured() ? [] : ([] as AdoptionStatusHistory[]);
  });
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').insert(input);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível enviar a mensagem. Tente novamente em instantes.');
  }
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  return withFallback(
    async () =>
      supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false }),
    [] as ContactMessage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0) return rows as ContactMessage[];
    return isDemoConfigured() ? demoContactMessages : ([] as ContactMessage[]);
  });
}

export async function fetchContactMessage(id: string): Promise<ContactMessage | null> {
  return withFallback(
    async () =>
      supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    null as ContactMessage | null,
  ).then((row) => {
    if (row) return row as ContactMessage;
    return isDemoConfigured()
      ? (demoContactMessages.find((m) => m.id === id) ?? null)
      : null;
  });
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível atualizar a mensagem.');
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível excluir a mensagem.');
  }
}

export async function submitVolunteerApplication(
  input: VolunteerApplicationInput,
): Promise<void> {
  try {
    const { error } = await supabase.from('volunteer_applications').insert(input);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível enviar sua inscrição. Tente novamente em instantes.');
  }
}

export async function fetchVolunteerApplications(): Promise<VolunteerApplication[]> {
  return withFallback(
    async () =>
      supabase
        .from('volunteer_applications')
        .select('*')
        .order('created_at', { ascending: false }),
    [] as VolunteerApplication[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0) return rows as VolunteerApplication[];
    return isDemoConfigured() ? demoVolunteerApplications : ([] as VolunteerApplication[]);
  });
}

export async function fetchVolunteerApplication(id: string): Promise<VolunteerApplication | null> {
  return withFallback(
    async () =>
      supabase
        .from('volunteer_applications')
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    null as VolunteerApplication | null,
  ).then((row) => {
    if (row) return row as VolunteerApplication;
    return isDemoConfigured()
      ? (demoVolunteerApplications.find((v) => v.id === id) ?? null)
      : null;
  });
}

export async function updateVolunteerStatus(
  id: string,
  status: VolunteerStatus,
  note?: string | null,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('volunteer_applications')
      .update({ status, internal_notes: note || undefined })
      .eq('id', id);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível atualizar o status.');
  }
}

export async function deleteVolunteerApplication(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('volunteer_applications').delete().eq('id', id);
    if (error) throw error;
  } catch {
    if (isDemoConfigured()) return;
    throw new Error('Não foi possível excluir a inscrição.');
  }
}
