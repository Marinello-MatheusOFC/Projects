# SOS Focinho Carente

Plataforma digital da ONG SOS Focinho Carente para divulgação de animais disponíveis para adoção, eventos, brechó beneficente, voluntariado e contato institucional.

> **Nota:** Este projeto contém dados de demonstração. As informações exibidas não representam necessariamente dados oficiais da ONG.

## Funcionalidades

### Portal Público
- Home com destaques e chamadas para ação
- Busca e filtros de animais disponíveis para adoção
- Detalhes do animal com galeria de fotos
- Formulário de manifestação de interesse em adoção
- Processo de adoção responsável
- Formas de ajudar (doação, voluntariado, lar temporário)
- Cadastro de voluntários
- Eventos e campanhas
- Notícias e blog
- Brechó beneficente (catálogo)
- Galeria de fotos
- Contato com honeypot antispam

### Painel Administrativo (`/admin`)
- Dashboard com indicadores, gráfico de adoções por status e destaques
- CRUD de animais com upload de imagens, publicação, destaque e arquivamento
- Páginas de detalhe para animais, solicitações de adoção, mensagens e voluntários
- Gestão de solicitações de adoção com histórico de status
- Gerenciamento de eventos, notícias e produtos
- Galeria de fotos com álbuns, capas e upload múltiplo
- Gerenciamento de mensagens e voluntários
- Configurações do site (contatos, redes sociais, PIX, sobre)
- Auditoria de ações administrativas e gerenciamento de usuários (superadmin)
- Permissões por módulo com página de acesso negado

## Tecnologias

- **Frontend**: React 19, TypeScript strict, Vite, React Router, TanStack Query, React Hook Form, Zod, Lucide React
- **Backend**: Supabase (Auth, PostgreSQL, Storage, RLS)
- **Testes**: Vitest, React Testing Library
- **Ferramentas**: ESLint, Prettier

## Requisitos

- Node.js >= 18
- NPM >= 9
- Projeto no [Supabase](https://supabase.com)

## Instalação

```bash
git clone <repo-url>
cd sos-focinho-carente
npm install
```

## Configuração

1. Crie um projeto no Supabase
2. Copie `.env.example` para `.env`
3. Preencha as variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_SITE_URL=http://localhost:3000

# Opcional (apenas desenvolvimento): habilita o login de demonstração local
# com as contas admin@.../admin123 e superadmin@.../super123
VITE_ENABLE_DEMO_AUTH=false
```

> **Modo demonstração:** com `VITE_ENABLE_DEMO_AUTH=true` (ou sem conexão com o banco),
> o site exibe conteúdo fictício local (animais, eventos, notícias, PIX, contatos) em
> `src/data/`. Em produção mantenha `false` para que dados fictícios nunca apareçam.

## Migrations

No SQL Editor do Supabase, execute os arquivos de `supabase/migrations/` na ordem:

```
supabase/migrations/001_initial.sql
supabase/migrations/002_admin_hardening.sql
supabase/migrations/999_create_admin_users.sql
```

Alternativa: o arquivo `supabase/BANCO_COMPLETO.sql` reúne tudo em um único script
(schema + hardening + usuários admin).

## Seed (dados de demonstração)

No SQL Editor do Supabase, execute na ordem:

```bash
# 1. Buckets de storage (obrigatório para upload de fotos no painel admin)
supabase/storage_buckets.sql

# 2. Dados de demonstração (idempotente — pode rodar mais de uma vez)
supabase/seed.sql
```

Após o seed, as tabelas do banco deixam de estar vazias e o painel admin passa a
editar/arquivar/excluir registros reais (o modo demonstração só mostra conteúdo
local quando o banco está vazio ou inacessível).

## Criando o Primeiro Superadmin

1. Crie um usuário pelo painel de Authentication do Supabase (ou via signup)
2. No SQL Editor, execute:

```sql
UPDATE public.profiles
SET role = 'superadmin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com' LIMIT 1);
```

3. Este comando só pode ser executado diretamente no banco (não exposto na aplicação)

## Execução Local

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Testes

```bash
npm test              # Executa testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

## Build

```bash
npm run build         # TypeScript + Vite build
npm run preview       # Preview do build
```

## Lint e TypeScript

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run format        # Prettier
```

## Estrutura de Pastas

```
/
├── public/              # Assets estáticos
├── src/
│   ├── app/             # App, Router, Providers
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ui/          # Botões, inputs, modais
│   │   ├── layout/      # Header, Footer, Sidebar
│   │   └── feedback/    # Alertas, skeletons, estados
│   ├── features/        # Módulos por domínio
│   │   ├── auth/        # Autenticação e autorização
│   │   └── adoption/    # Formulário de adoção
│   ├── pages/
│   │   ├── public/      # Páginas do portal
│   │   ├── admin/       # Páginas administrativas
│   │   └── errors/      # 404, 403, 500
│   ├── hooks/           # Hooks globais
│   ├── lib/             # Config (Supabase, env)
│   ├── services/        # Serviços de API
│   ├── styles/          # CSS tokens e componentes
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilitários
├── supabase/
│   ├── migrations/      # SQL migrations
│   └── seed.sql         # Dados de demonstração
├── tests/               # Testes
└── docs/                # Documentação
```

## Documentação

Documentação detalhada em `docs/`:

- `ARQUITETURA-ADMIN.md` — arquitetura do painel administrativo
- `PERMISSOES-ADMIN.md` — matriz de permissões por módulo
- `FLUXOS-ADMIN.md` — fluxos principais do painel
- `VALIDACAO-VISUAL-ADMIN.md` — checklist de inspeção visual
- `TESTES-ADMIN.md` — testes e checagem funcional
- `CONFIGURACOES-EDITAVEIS.md` — configurações editáveis do site
- `AUDITORIA.md` — registro de ações administrativas

## Segurança

- **RLS**: Tabelas protegidas por Row Level Security
- **Autorização**: Verificação em `profiles.role`, nunca `auth.role()`
- **Chaves**: Apenas `anon key` no frontend; `service_role key` nunca é exposta
- **Validação**: Zod no cliente + políticas RLS no servidor
- **Formulários**: Consentimento explícito e honeypot antispam
- **Dados sensíveis**: Protegidos por políticas de SELECT
- **Auditoria**: Ações críticas registradas em `audit_logs`

## Limitações

- **SEO**: Como é uma SPA, o SEO é limitado. Recomenda-se migração futura para SSR/SSG (Next.js, Remix) ou uso de pré-renderização
- **Pagamento online**: Não implementado nesta versão
- **Dark mode**: Não implementado (pode ser adicionado futuramente)
- **Conteúdo**: Os dados exibidos são fictícios (modo demonstração); substitua pelos dados reais da ONG

## Roadmap

1. ~~Implementação da conexão com Supabase~~ (concluído)
2. ~~Testes automatizados~~ (parcial — 20 testes; ampliar cobertura do painel admin)
3. Melhorias de acessibilidade
4. Pré-renderização para SEO
5. Modo escuro
6. Internacionalização (se necessário)
7. Pagamento online no brechó

## Créditos

Projeto desenvolvido como Trabalho de Conclusão de Curso de Desenvolvimento de Sistemas.

- **Ícones**: [Lucide](https://lucide.dev)
- **Fontes**: [Manrope](https://manropefont.com), [Inter](https://rsms.me/inter/)
- **Infraestrutura**: [Supabase](https://supabase.com)

