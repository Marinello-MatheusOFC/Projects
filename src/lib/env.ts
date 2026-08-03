import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().default('http://localhost:54321'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default('dev-anon-key'),
  VITE_SITE_URL: z.string().default('http://localhost:3000'),
  VITE_ENABLE_DEMO_AUTH: z.string().default('false'),
});

function getEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.warn(
      'Variáveis de ambiente ausentes. Usando valores padrão para desenvolvimento.',
      parsed.error.flatten().fieldErrors,
    );
    return envSchema.parse({
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'dev-anon-key',
      VITE_SITE_URL: 'http://localhost:3000',
      VITE_ENABLE_DEMO_AUTH: 'false',
    });
  }

  return parsed.data;
}

export const env = getEnv();
