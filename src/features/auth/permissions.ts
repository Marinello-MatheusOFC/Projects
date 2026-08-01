import type { Profile, Role } from '@/types';

export type AdminModule =
  | 'dashboard'
  | 'animais'
  | 'adocoes'
  | 'eventos'
  | 'noticias'
  | 'produtos'
  | 'galeria'
  | 'mensagens'
  | 'voluntarios'
  | 'configuracoes'
  | 'usuarios'
  | 'auditoria';

const MODULE_ACCESS: Record<AdminModule, Role[]> = {
  dashboard: ['admin', 'superadmin'],
  animais: ['admin', 'superadmin'],
  adocoes: ['admin', 'superadmin'],
  eventos: ['admin', 'superadmin'],
  noticias: ['admin', 'superadmin'],
  produtos: ['admin', 'superadmin'],
  galeria: ['admin', 'superadmin'],
  mensagens: ['admin', 'superadmin'],
  voluntarios: ['admin', 'superadmin'],
  configuracoes: ['admin', 'superadmin'],
  usuarios: ['superadmin'],
  auditoria: ['superadmin'],
};

export function canAccessModule(module: AdminModule, profile: Profile | null): boolean {
  if (!profile || !profile.active) return false;
  return MODULE_ACCESS[module].includes(profile.role);
}
