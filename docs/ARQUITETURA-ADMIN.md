# Arquitetura do Painel Administrativo

Este documento descreve a arquitetura do painel administrativo da SOS Focinho Carente: organização de arquivos, roteamento, estilo e fluxo de dados.

## Visão Geral

O painel administrativo é uma área separada do portal público, sob a URL `/admin`, com:

- Identidade visual própria (tokens `--admin-*`), escopada para não afetar o portal.
- Roteamento protegido por autenticação e permissão por módulo.
- Dados reais vindos do Supabase (sem fallback de demonstração no admin).

## Estrutura de Arquivos

```
src/
├── app/router.tsx                          # Rotas (público + admin)
├── features/auth/
│   ├── permissions.ts                      # canAccessModule(module, profile)
│   └── components/
│       ├── AdminRoute.tsx                  # Exige login + admin ativo
│       └── AdminModuleRoute.tsx            # Exige permissão do módulo
├── components/layout/
│   ├── AdminLayout.tsx                     # Sidebar + Header + <Outlet/>
│   ├── AdminSidebar.tsx                    # Navegação em grupos + contadores
│   └── AdminHeader.tsx                     # Breadcrumb + menu do perfil
├── components/feedback/
│   └── ConfirmDialog.tsx                   # Modal de confirmação (ações destrutivas)
├── pages/admin/                            # Páginas administrativas
├── services/
│   ├── audit.ts                            # fetchAuditLogs + logAudit
│   ├── animals.ts, gallery.ts, applications.ts, products.ts, events.ts, settings.ts
├── styles/
│   └── admin.css                           # Todo o CSS do admin (tokens e componentes)
└── types/index.ts                          # Tipos compartilhados
```

## Roteamento

Todas as rotas de admin são filhas de `<Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>`. Rotas de conteúdo adicional são envolvidas por `<AdminModuleRoute module="...">`.

| Rota | Página | Módulo |
| --- | --- | --- |
| `/admin` | Dashboard | dashboard |
| `/admin/login` | Login | — |
| `/admin/403` | Acesso negado | — |
| `/admin/animais` | Lista de animais | animais |
| `/admin/animais/novo`, `/admin/animais/:id`, `/admin/animais/:id/editar` | Form/detalhe | animais |
| `/admin/adocoes`, `/admin/adocoes/:id` | Adoções | adocoes |
| `/admin/eventos`, `/admin/eventos/:id/editar` | Eventos | eventos |
| `/admin/noticias`, `/admin/noticias/:id/editar` | Notícias | noticias |
| `/admin/produtos`, `/admin/produtos/:id/editar` | Brechó | produtos |
| `/admin/galeria`, `/admin/galeria/novo`, `/admin/galeria/:id`, `/admin/galeria/:id/editar` | Galeria | galeria |
| `/admin/mensagens`, `/admin/mensagens/:id` | Mensagens | mensagens |
| `/admin/voluntarios`, `/admin/voluntarios/:id` | Voluntários | voluntarios |
| `/admin/configuracoes` | Configurações | configuracoes |
| `/admin/usuarios` | Usuários | usuarios |
| `/admin/auditoria` | Auditoria | auditoria |

Páginas de edição (`.../editar`, `.../novo`) usam `lazy()` do React Router para code-splitting. O carregamento mostra o `PageLoader`.

## Layout

- `AdminLayout` renderiza a sidebar fixa em desktop e um drawer em telas menores que `1024px`, com overlay, fechamento por `Escape`, clique fora e scroll-lock do body.
- `AdminSidebar` agrupa a navegação em **Conteúdo**, **Atendimento** e **Sistema**, exibe contadores pendentes (adoções novas/em análise, mensagens novas, voluntários novos) obtidos via `supabase.count(head: true)` e filtra itens por `canAccessModule`.
- `AdminHeader` mostra breadcrumb derivado da URL e um menu de perfil (avatar com iniciais, "Ver site", "Configurações", "Sair").

## Estilo

- `admin.css` define os tokens em `:root` (prefixo `--admin-*`) e todos os componentes escopados sob `.admin-layout`, `.admin-login-page` e `.admin-page`.
- O portal público não é afetado; nada do admin vaza para o CSS global do portal.
- Segue o padrão "bloco 3D": botões e cards com sombra sólida (`0 7px 0`) e deslocamento no `:active`.
- Cores: creme (`--admin-cream`), vermelho (`--admin-red`), amarelo (`--admin-yellow`), verde (`--admin-green`) e coral/pêssego (`--admin-peach`).

## Fluxo de Dados

1. Páginas chamam os serviços em `src/services/` que usam o cliente Supabase (`src/lib/supabase.ts`).
2. Ações de escrita críticas chamam `logAudit(...)` (de `services/audit.ts`) para registrar em `audit_logs`.
3. `useAuth` fornece `user`, `profile` e `signOut`; o profile é carregado pelo `AuthProvider`.
4. Falhas de leitura mostram `ErrorState` com retry; falhas de escrita mostram `Alert` de erro e, quando aplicável, `ConfirmDialog` para ações destrutivas.

## Componentes de UI Reutilizados

Os componentes base do portal (`Button`, `Input`, `Select`, `Table`, `Badge`, `Modal`, `Skeleton`, `EmptyState`, `ErrorState`, `Alert`) são reutilizados no admin. Classes administrativas adicionais (`admin-table-actions`, `admin-icon-btn`, `admin-form`, etc.) estão em `admin.css`.
