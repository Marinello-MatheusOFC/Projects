import { supabase, withFallback, resolveImageUrl } from '@/lib/images';
import type { Event, EventStatus } from '@/types';
import { demoEvents } from '@/data/content';

export interface EventWithImage extends Event {
  image: string;
  isUpcoming: boolean;
  isPast: boolean;
  isCancelled: boolean;
}

export type EventInput = {
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location_name?: string | null;
  address?: string | null;
  external_url?: string | null;
  image_path?: string | null;
  status: EventStatus;
  published: boolean;
};

function decorate(event: Event): EventWithImage {
  const start = new Date(event.start_at);
  const nowMs = Date.now();
  return {
    ...event,
    image: resolveImageUrl(event.image_path),
    isUpcoming: event.status === 'scheduled' && start.getTime() >= nowMs,
    isPast: event.status === 'completed' || start.getTime() < nowMs,
    isCancelled: event.status === 'cancelled',
  };
}

function demoList(): EventWithImage[] {
  return demoEvents.map(decorate);
}

function demoBySlug(slug: string): EventWithImage | null {
  const found = demoEvents.find((e) => e.slug === slug);
  return found ? decorate(found) : null;
}

export async function fetchEvents(): Promise<EventWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('events')
        .select('*')
        .eq('published', true)
        .is('deleted_at', null)
        .order('start_at', { ascending: false }),
    [] as EventWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'start_at' in rows[0]) {
      return (rows as Event[]).map(decorate);
    }
    return demoList();
  });
}

export async function fetchUpcomingEvents(): Promise<EventWithImage[]> {
  const all = await fetchEvents();
  return all.filter((e) => e.isUpcoming && !e.isCancelled);
}

export async function fetchEventBySlug(slug: string): Promise<EventWithImage | null> {
  return withFallback(
    async () =>
      supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .is('deleted_at', null)
        .maybeSingle(),
    null as EventWithImage | null,
  ).then((row) => {
    if (row && 'start_at' in row && (row as Event).id) {
      return decorate(row as Event);
    }
    return demoBySlug(slug);
  });
}

export async function fetchAdminEvents(): Promise<EventWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('events')
        .select('*')
        .is('deleted_at', null)
        .order('start_at', { ascending: false }),
    [] as EventWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'start_at' in rows[0]) {
      return (rows as Event[]).map(decorate);
    }
    return demoList();
  });
}

export async function createEvent(input: EventInput): Promise<Event | null> {
  const { data, error } = await supabase.from('events').insert(input).select().single();
  if (error) throw new Error('Não foi possível criar o evento.');
  return data as Event;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<Event | null> {
  const { data, error } = await supabase.from('events').update(input).eq('id', id).select().single();
  if (error) throw new Error('Não foi possível atualizar o evento.');
  return data as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error('Não foi possível excluir o evento.');
}
