import type { Profile, Role } from '@/types';
import { env } from './env';

const STORAGE_KEY = 'sfc-demo-auth-v1';

export interface DemoCredentials {
  email: string;
  password: string;
  role: Role;
  full_name: string;
  active: boolean;
}

export const DEMO_USERS: DemoCredentials[] = [
  {
    email: 'admin@sosfocinhocarente.org.br',
    password: 'admin123',
    role: 'admin',
    full_name: 'Maria Silva (Admin Demo)',
    active: true,
  },
  {
    email: 'superadmin@sosfocinhocarente.org.br',
    password: 'super123',
    role: 'superadmin',
    full_name: 'João Santos (Superadmin Demo)',
    active: true,
  },
];

export interface DemoSession {
  mode: 'demo';
  user: {
    id: string;
    email: string;
    role: Role;
    full_name: string;
    active: boolean;
  };
  expiresAt: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isDemoConfigured(): boolean {
  try {
    return env.VITE_ENABLE_DEMO_AUTH === 'true';
  } catch {
    return false;
  }
}

export function getDemoSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed || parsed.mode !== 'demo') return null;
    if (parsed.expiresAt < Date.now()) {
      clearDemoSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setDemoSession(session: DemoSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage indisponível */
  }
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage indisponível */
  }
}

export function demoSessionToProfile(session: DemoSession): Profile {
  const now = new Date().toISOString();
  return {
    id: session.user.id,
    full_name: session.user.full_name,
    role: session.user.role,
    active: session.user.active,
    created_at: now,
    updated_at: now,
  };
}

export function demoSessionToUser(session: DemoSession) {
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function demoSignInWithPassword(
  email: string,
  password: string,
): Promise<{ success: boolean; session: DemoSession | null; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
  );

  await new Promise((r) => setTimeout(r, 500));

  if (!match) {
    return { success: false, session: null, error: 'E-mail ou senha inválidos.' };
  }
  if (!match.active) {
    return {
      success: false,
      session: null,
      error: 'Usuário desativado. Fale com o superadministrador.',
    };
  }

  const session: DemoSession = {
    mode: 'demo',
    user: {
      id: `demo-${uuid().slice(0, 8)}`,
      email: match.email,
      role: match.role,
      full_name: match.full_name,
      active: match.active,
    },
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  setDemoSession(session);
  return { success: true, session };
}

export async function demoSignOut(): Promise<void> {
  clearDemoSession();
}
