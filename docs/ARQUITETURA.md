# Arquitetura do Sistema

## Visão Geral

```
                    ┌──────────────────┐
                    │   Visitante      │
                    │   (Navegador)    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   React SPA      │
                    │   (Vite + TS)    │
                    │                  │
                    │  ┌────────────┐  │
                    │  │ TanStack   │  │
                    │  │ Query      │  │
                    │  └─────┬──────┘  │
                    │        │         │
                    │  ┌─────▼──────┐  │
                    │  │ Supabase   │  │
                    │  │ Client     │  │
                    │  └─────┬──────┘  │
                    └────────┼─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Supabase       │
                    │   ┌───────────┐  │
                    │   │ PostgreSQL│  │
                    │   │ + RLS     │  │
                    │   ├───────────┤  │
                    │   │ Storage   │  │
                    │   ├───────────┤  │
                    │   │ Auth      │  │
                    │   └───────────┘  │
                    └──────────────────┘
```

## Componentes Principais

### Frontend (React SPA)
- **React 19** com TypeScript strict
- **Vite** como bundler
- **React Router** para navegação SPA
- **TanStack Query** para cache e gerenciamento de estado assíncrono
- **React Hook Form + Zod** para formulários e validação
- **Supabase JS Client** para comunicação com backend
- **CSS Modules / CSS global** com design tokens

### Backend (Supabase)
- **PostgreSQL** para dados relacionais
- **Row Level Security (RLS)** para autorização em nível de banco
- **Supabase Auth** para autenticação
- **Supabase Storage** para imagens e arquivos
- **Edge Functions** (futuro) para operações privilegiadas

## Fluxo de Autenticação

1. Usuário faz login via Supabase Auth (e-mail/senha)
2. Sessão é armazenada no localStorage do navegador
3. React consulta tabela `profiles` para verificar papel (role)
4. `AdminRoute` verifica `isAdmin` antes de renderizar páginas administrativas
5. RLS no PostgreSQL garante que mesmo com cliente autenticado, dados não autorizados não sejam retornados

## Fluxo de Autorização

```
Request → React Router → AdminRoute (verifica profile.role)
                       → Componente da página
                       → Supabase query → RLS policy → Resultado
```

## Decisões Técnicas

1. **SPA em vez de SSR**: Aplicação escolhida para simplicidade de deploy e custo zero de hospedagem. SEO é limitado em SPAs - documentado como melhoria futura.
2. **CSS global com tokens**: Em vez de CSS-in-JS ou CSS Modules, optou-se por CSS global com variáveis CSS para consistência e simplicidade.
3. **React Context para auth**: Em vez de Redux ou Zustand, usa Context API por ser suficiente para o escopo.
4. **Sem dangerouslySetInnerHTML**: Todo conteúdo é renderizado com componentes React.
