import { supabase } from '@/lib/images';
import type { AuditLog } from '@/types';

export async function fetchAuditLogs(limit = 200): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error('Não foi possível carregar o histórico de auditoria.');
  return (data ?? []) as AuditLog[];
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('audit_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: metadata ?? null,
    actor_id: userData.user?.id ?? null,
  });
  if (error) throw new Error('Não foi possível registrar a ação.');
}
