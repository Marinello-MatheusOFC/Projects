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

### Painel Administrativo
- Dashboard com indicadores
- CRUD de animais com upload de imagens
- Gerenciamento de solicitações de adoção
- Histórico de status
- Gerenciamento de eventos, notícias e produtos
- Gerenciamento de mensagens e voluntários
- Configurações do site
- Gerenciamento de usuários (superadmin)

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
```

## Migrations

No SQL Editor do Supabase, execute o arquivo:

```
supabase/migrations/001_initial.sql
```

## Seed (dados de demonstração)

```bash
# No SQL Editor do Supabase, execute:
supabase/seed.sql
```

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
- **Testes**: Pendentes de implementação (estrutura pronta)

## Roadmap

1. Implementação da conexão com Supabase
2. Testes automatizados
3. Melhorias de acessibilidade
4. Pré-renderização para SEO
5. Modo escuro
6. Internacionalização (se necessário)

## Créditos

Projeto desenvolvido como Trabalho de Conclusão de Curso de Desenvolvimento de Sistemas.

- **Ícones**: [Lucide](https://lucide.dev)
- **Fontes**: [Manrope](https://manropefont.com), [Inter](https://rsms.me/inter/)
- **Infraestrutura**: [Supabase](https://supabase.com)
