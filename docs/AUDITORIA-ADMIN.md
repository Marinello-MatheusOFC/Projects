# AUDITORIA DA ÁREA ADMINISTRATIVA — SOS Focinho Carente

Data da auditoria: 2026-08-03  
Arquiteto responsável: Análise técnica  
Status: Documentação base da infraestrutura existente

---

## 1. ESTRUTURA EXISTENTE

### 1.1 Stack tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | ^19.1.0 |
| Linguagem | TypeScript | ~5.8.3 |
| Build & Dev | Vite | ^6.3.1 |
| Roteamento | react-router-dom | ^7.5.0 |
| State / Cache | @tanstack/react-query | ^5.72.0 |
| Backend BaaS | Supabase (@supabase/supabase-js) | ^2.49.4 |
| Formulários | react-hook-form | ^7.54.2 |
| Validação | zod | ^3.24.4 |
| Resolvers | @hookform/resolvers | ^3.10.0 |
| Ícones | lucide-react | ^0.487.0 |
| Testes | Vitest + Testing Library | ^3.1.1 / ^16.3.0 |
| Lint | ESLint + typescript-eslint | ^9.25.0 |
| Format | Prettier | ^3.5.3 |

### 1.2 Árvore de pastas (relevante para admin)

```
src/
├─ app/
│  ├─ App.tsx
│  ├─ providers.tsx
│  ├─ queryClient.ts
│  └─ router.tsx              ← rotas públicas e admin
├─ components/
│  ├─ layout/
│  │  ├─ AdminLayout.tsx      ← layout admin (existe)
│  │  ├─ AdminSidebar.tsx     ← sidebar (existe)
│  │  └─ AdminHeader.tsx      ← header (existe)
│  └─ ui/  feedback/  media/  content/   ← componentes base reutilizáveis
├─ features/
│  └─ auth/
│     ├─ permissions.ts       ← modulos admin x roles
│     ├─ hooks/
│     │  ├─ AuthProvider.tsx  ← provider com perfil e roles
│     │  └─ useAuth.ts        ← hook
│     └─ components/
│        ├─ AdminRoute.tsx    ← guarda geral admin
│        └─ AdminModuleRoute.tsx ← guarda por módulo
├─ lib/
│  ├─ supabase.ts             ← client anon key
│  ├─ env.ts
│  ├─ images.ts               ← resolveImageUrl + withFallback
│  └─ format.ts
├─ pages/admin/               ← 21 páginas já criadas (esqueletos)
├─ services/                  ← serviços CRUD por domínio
├─ styles/
│  ├─ globals.css
│  ├─ tokens.css              ← paleta pública (vermelho/amarelo/verde/creme)
│  └─ admin.css               ← tokens admin + layout + components
├─ types/
│  └─ index.ts                ← 18 interfaces tipadas
└─ utils/
supabase/
└─ migrations/001_initial.sql ← migration completa
```

---

## 2. TABELAS EXISTENTES

Todas as tabelas foram criadas em **001_initial.sql** com RLS ativo.  
Status: já existe migration segura e completa. **Nenhuma migration adicional é necessária para as tabelas abaixo.**

### 2.1 `public.profiles` (1:1 com auth.users)

| Coluna | Tipo | Constraints |
|---|---|---|
| id | UUID | PK, FK auth.users(id) ON DELETE CASCADE |
| full_name | TEXT | NOT NULL, ≥ 2 chars |
| role | TEXT | NOT NULL, ENUM('admin','superadmin'), DEFAULT 'admin' |
| active | BOOLEAN | NOT NULL DEFAULT TRUE |
| created_at / updated_at | TIMESTAMPTZ | triggers |

- **RLS**: Usuário vê próprio perfil. Superadmin vê todos e atualiza todos.
- Trigger automático `on_auth_user_created` cria profile após signup.

### 2.2 `public.animals` + `public.animal_images`

| animals | tipo | notes |
|---|---|---|
| id, name, slug | UUID, TEXT, TEXT | UNIQUE slug |
| species | TEXT | dog/cat/other |
| sex | TEXT | male/female |
| size | TEXT | small/medium/large |
| birth_date_estimate, age_text | DATE, TEXT | |
| description, history, personality, health_notes, compatibility_notes | TEXT | |
| vaccinated, neutered, special_needs | BOOL | |
| status | TEXT | available/adopted/in_process/archived |
| featured, published | BOOL | |
| created_by | UUID → profiles | |
| created_at / updated_at / deleted_at | TIMESTAMPTZ | soft-delete |

animal_images: id, animal_id (FK), storage_path, alt_text, position, is_cover.

### 2.3 `public.adoption_applications` + `public.adoption_status_history`

Solicitações de adoção com campos completos (moradia, telas, outros animais, acordo, motivo, disponibilidade, LGPD).  
Status: `new → under_review → contacted → interview → approved/rejected/cancelled/completed`.  
Histórico de mudanças com usuário (changed_by) e nota.

### 2.4 `public.events`

title, slug, summary, description, start_at, end_at, location_name, address, external_url, image_path, status (scheduled/cancelled/completed), published, created_by, deleted_at.

### 2.5 `public.news_posts` + `public.categories` + `public.post_categories`

Notícias: title/slug/excerpt/content/cover_image_path/status(draft/published)/published_at/author_id/deleted_at.

### 2.6 `public.products` (brechó)

name, slug, description, price DECIMAL(10,2), category_id, image_path, available, featured, published, deleted_at.

### 2.7 `public.contact_messages`

name, email, phone, subject, message, privacy_consent, status(new/read/archived).

### 2.8 `public.volunteer_applications`

name, email, phone, city, availability, interests, experience, message, privacy_consent, status + internal_notes.

### 2.9 `public.gallery_albums` + `public.gallery_images`

Álbuns: title/slug/description/cover_image_path/published.  
Imagens: album_id FK, storage_path, alt_text, caption, position.

### 2.10 `public.site_settings`

key (UNIQUE), value_json JSONB, public BOOL, updated_by → profiles, updated_at.  
**Armazena configurações do site** (contatos, redes, pix, sobre, home, etc).

### 2.11 `public.audit_logs`

actor_id → profiles, action, entity_type, entity_id, metadata JSONB, created_at.  
**Leitura: só superadmin. Inserção: admin autenticado.**

---

## 3. CAMPOS EXISTENTES UTILIZADOS PELO PORTAL PÚBLICO

O portal público já lê das tabelas via serviços com `withFallback` (dados demo quando supabase offline):

| Entidade | Campos consumidos no público |
|---|---|
| Animals | publicado + não deletado, imagens ordenadas, status=available |
| Events | publicado + não deletado, image_path como URL |
| News | status=published, deleted_at IS NULL |
| Products | published + available, image_path |
| Gallery | published=true, imagens por álbum |
| Settings | public=true via fetchOrgInfo |
| Adoção | POST de application (público) |
| Contato | POST de message (público) |
| Voluntariado | POST de application (público) |

**Conclusão:** Não alterar nomes de colunas nem apagar campos. O admin editará os mesmos campos.

---

## 4. ROTAS EXISTENTES

Todas já declaradas em `router.tsx` com lazy loading e guards corretos.

```
[PÚBLICO]
/                          HomePage
/sobre                     AboutPage
/adocao                    AdoptionPage (listagem)
/adocao/:slug              AnimalDetailPage
/processo-de-adocao        AdoptionProcessPage
/como-ajudar               HowToHelpPage
/voluntariado              VolunteeringPage
/eventos                   EventsPage
/eventos/:slug             EventDetailPage
/noticias                  NewsPage
/noticias/:slug            NewsDetailPage
/brecho                    ProductsPage
/brecho/:slug              ProductDetailPage
/galeria                   GalleryPage
/contato                   ContactPage

[ADMIN LOGIN PÚBLICA]
/admin/login               LoginPage

[ADMIN 403]
/admin/403                 AdminForbiddenPage

[ADMIN — tudo exige AdminRoute + AdminModuleRoute por role]
/admin                     Dashboard
/admin/animais             listar
/admin/animais/novo        criar
/admin/animais/:id         detalhes
/admin/animais/:id/editar  editar
/admin/adocoes             listar
/admin/adocoes/:id         detalhes
/admin/eventos             listar
/admin/eventos/novo        criar
/admin/eventos/:id/editar  editar
/admin/noticias            listar
/admin/noticias/nova       criar
/admin/noticias/:id/editar editar
/admin/produtos            listar brechó
/admin/produtos/novo       criar
/admin/produtos/:id/editar editar
/admin/galeria             listar álbuns
/admin/galeria/novo        criar álbum
/admin/galeria/:id         detalhes álbum
/admin/galeria/:id/editar  editar álbum
/admin/mensagens           listar
/admin/mensagens/:id       detalhes
/admin/voluntarios         listar
/admin/voluntarios/:id     detalhes
/admin/configuracoes       editar settings
/admin/usuarios            (superadmin only)
/admin/auditoria           (superadmin only)

[ERROS]
/acesso-negado             ForbiddenPage
/erro                      ServerErrorPage
/404                       NotFoundPage
*                          NotFoundPage (catch-all)
```

Status: **rotas já definidas corretamente**. Nenhuma rota faltando.

---

## 5. AUTENTICAÇÃO EXISTENTE

### 5.1 Fluxo

- `supabase.auth.signInWithPassword({ email, password })` em LoginPage.
- Após login, consulta `profiles` pelo `id === auth.uid()`.
- Se profile não existir OU inativo OU role ≠ admin/superadmin → faz `signOut()` e mostra erro.
- `AuthProvider` (em `features/auth/hooks/AuthProvider.tsx`) mantém `{ user, profile, loading, initialized, isAuthenticated, isAdmin, isSuperAdmin, signOut, hasRole }`.
- `onAuthStateChange` atualiza o perfil em tempo real.

### 5.2 Guards

- **AdminRoute** (rota pai `/admin/*`): Bloqueia se não for admin ativo. Redireciona p/ `/admin/login` com reason (no-access/expired/inactive).
- **AdminModuleRoute**: Bloqueia por módulo via `MODULE_ACCESS` em permissions.ts. Redireciona para `/admin/403`.

```ts
MODULE_ACCESS:
  dashboard    → admin, superadmin
  animais      → admin, superadmin
  adocoes      → admin, superadmin
  eventos      → admin, superadmin
  noticias     → admin, superadmin
  produtos     → admin, superadmin
  galeria      → admin, superadmin
  mensagens    → admin, superadmin
  voluntarios  → admin, superadmin
  configuracoes→ admin, superadmin
  usuarios     → superadmin (apenas)
  auditoria    → superadmin (apenas)
```

### 5.3 Funções SQL seguras (já existentes)

```sql
public.is_admin()      RETURNS BOOLEAN  -- SECURITY DEFINER, checa profile.role IN (admin,superadmin) AND active
public.is_superadmin() RETURNS BOOLEAN  -- SECURITY DEFINER, checa profile.role = 'superadmin' AND active
```

Ambas **SECURITY DEFINER** — corretas para uso em RLS.  
Status: já existe. **Não recriar.**

### 5.4 Segurança de credenciais

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apenas — **anon key only** no frontend.
- Nenhuma service role key no código.
- .env.example sem valores reais.

Status: **seguro.** ✅

---

## 6. PERMISSÕES EXISTENTES (RLS)

Resumo das políticas:

| Tabela | SELECT público | Outros públicos | Admin (is_admin) | Superadmin extra |
|---|---|---|---|---|
| profiles | próprio perfil | — | próprio | ALL |
| animals | published=TRUE AND deleted_at IS NULL | — | ALL | — |
| animal_images | de animais publicados | — | ALL | — |
| adoption_applications | ❌ | INSERT (qualquer um) | ALL | — |
| adoption_status_history | ❌ | — | SELECT + INSERT | — |
| events | published AND deleted_at IS NULL | — | ALL | — |
| news_posts | status=published AND deleted_at IS NULL | — | ALL | — |
| categories | ✅ | — | ALL | — |
| post_categories | ✅ | — | ALL | — |
| products | published AND deleted_at IS NULL | — | ALL | — |
| contact_messages | ❌ | INSERT | ALL | — |
| volunteer_applications | ❌ | INSERT | ALL | — |
| gallery_albums | published=TRUE | — | ALL | — |
| gallery_images | de álbuns publicados | — | ALL | — |
| site_settings | public=TRUE | — | ALL | — |
| audit_logs | ❌ | — | INSERT | SELECT |

Status: **RLS já configurado de forma correta e segura.**  
⚠️ Observação: `adoption_status_history` não tem policy UPDATE/DELETE (apenas SELECT/INSERT). Correto, pois é histórico auditável.

---

## 7. PROBLEMAS ENCONTRADOS NA AUDITORIA

### 7.1 Alto impacto

| # | Problema | Local | Risco |
|---|---|---|---|
| P1 | Migration 001 define `products.category_id` mas não cria FK para `categories(id)` em `CREATE TABLE products`. | 001_initial.sql L343 | Relacionamento não garantido. Menor impacto — RLS e app cuidam. |
| P2 | `gallery_albums` não tem `deleted_at` (apenas `published=false`). Dados de álbuns removidos são permanentemente deletados (hard delete). | migration L437 | Consistência de auditoria. |
| P3 | `contact_messages` não tem `deleted_at`; `deleteContactMessage` usa DELETE direto. | services/applications.ts | Dados de mensagens são apagados em vez de soft-delete. |
| P4 | `volunteer_applications` não tem `deleted_at`; delete hard. | idem | idem |
| P5 | `gallery_images.deleteGalleryImage` não remove arquivo do storage bucket (apenas DB row). | services/gallery.ts L121-124 | Arquivo órfão no bucket. |
| P6 | `products`, `events`, `news_posts` usam soft-delete (`deleted_at`) mas `gallery_albums` tem DELETE puro — inconsistência. | migration/services | Manutenibilidade. |

### 7.2 Médio impacto

| # | Problema | Local |
|---|---|---|
| P7 | `deleteAnimalImage` em animals.ts apaga o storage, mas não há rotina de limpeza se o upload no DB falhar depois do storage upload (transação não atômica 2 fases). | services/animals.ts L184-194 |
| P8 | Trigger `on_auth_user_created` define role default 'admin' para **qualquer** novo signup via Supabase Auth. Se o site tiver signup auto-atendido (atualmente não existe UI), qualquer pessoa vira admin por padrão. | 001_initial.sql L71-82 |
| P9 | `site_settings` não tem índice em `key`. UNIQUE já cria índice implicitamente → OK. | — |
| P10 | `fetchAdminAnimals`, `fetchAdminEvents`, etc usam `withFallback` → se o backend falhar, mostram dados demo. Para o **admin**, tal fallback mascara erros e pode levar o administrador a operar sobre dados "fake" como se fossem reais. | services/*.ts (vários) |
| P11 | `AdminSidebar` carrega contadores com supabase query direta (sem React Query) — sem cache/refetch otimizado. | AdminSidebar.tsx L76-98 |

### 7.3 Baixo impacto / UI

| # | Problema | Local |
|---|---|---|
| P12 | LoginPage não tem "mostrar/ocultar senha". | LoginPage.tsx |
| P13 | Dashboard saudação é "Bem-vindo(a)" em vez do solicitado "Olá, [nome]. Veja o que precisa de atenção hoje." | DashboardPage.tsx L161-162 |
| P14 | Dashboard não mostra: animais em destaque (mostra ✅), animais sem fotografia (❌ faltando), adoções em análise (parcial), próximos eventos (contado mas não listado), notícias em rascunho (❌), atividade administrativa (❌) | DashboardPage.tsx |
| P15 | AdminHeader não mostra "ação principal contextual" por rota (ex: Cadastrar animal em /admin/animais). | AdminHeader.tsx |
| P16 | Tokens admin em admin.css não definem `--admin-red-soft`, `--admin-green-soft`, `--admin-border` que constam nos requisitos. | admin.css L9-41 |
| P17 | Sidebar não tem opção de recolher no desktop. | AdminSidebar.tsx |

---

## 8. MIGRATIONS REALMENTE NECESSÁRIAS

A migration inicial 001 cobre 98% das necessidades. Apenas 3 pequenos ajustes de **hardening** são recomendados.  
**Criar migration 002 (novo arquivo, versionado) — NUNCA alterar 001_initial.sql já aplicado.**

```
supabase/migrations/
├─ 001_initial.sql  (NÃO ALTERAR)
└─ 002_admin_hardening.sql  (NOVO)
```

Conteúdo mínimo de 002_admin_hardening.sql:

1. `products.category_id` FK real (garantir).
2. `gallery_albums.deleted_at TIMESTAMPTZ` adicionar + atualizar services p/ soft-delete.
3. Trigger para proibir último superadmin de ser rebaixado/desativado (segurança via SQL).
4. Opcional: `contact_messages.deleted_at`, `volunteer_applications.deleted_at` (soft-delete).

---

## 9. FUNCIONALIDADES QUE PODEM SER REUTILIZADAS

**TODAS as fundações já existem.** Esta é uma boa notícia — o trabalho é principalmente "completar" e "polir" páginas que já têm esqueletos/serviços.

| Funcionalidade | Status | O que fazer |
|---|---|---|
| Router + guards | ✅ 100% | Nada |
| Roles + permissions.ts | ✅ 100% | Nada |
| AuthProvider / useAuth | ✅ 100% | Nada |
| AdminLayout (estrutura) | ✅ 90% | Adicionar recolher sidebar desktop |
| AdminSidebar | ✅ 85% | Recolher + melhorar contadores |
| AdminHeader | ✅ 75% | Adicionar ação principal contextual |
| Login page | ✅ 80% | Adicionar show/hide senha + foto + layout two-column desktop |
| Tokens admin (admin.css) | ✅ 70% | Completar tokens faltantes + validar contrastes |
| Services animals | ✅ 80% | Busca/filtros/reordenação de imagens + alt_text |
| Services applications | ✅ 85% | Nada |
| Services events | ✅ 80% | upload image_path no storage |
| Services news | ✅ 80% | upload cover_image_path |
| Services products | ✅ 80% | upload image_path + category_id FK |
| Services gallery | ✅ 70% | position, reordenação, remover storage ao deletar |
| Services settings | ✅ 75% | Completar categorias de settings (Home, SEO, etc.) |
| Services audit | ✅ 80% | Nada |
| Dashboard | ⚠️ 60% | Completar indicadores faltantes + layout hierárquico |
| Páginas de lista (animais/adocoes/etc) | ⚠️ 50% | Completar filtros, paginação, cards mobile |
| Páginas de formulário | ⚠️ 40% | Completar todos os campos, seções, uploads, drag&drop |
| Componentes UI base (Button/Input/Table/Card/...) | ✅ 100% | Reutilizar |
| Componentes feedback (Empty/Error/Confirm/Skeleton/Alert) | ✅ 100% | Reutilizar |
| ResponsivePicture | ✅ 100% | Reutilizar |

---

## 10. CONCLUSÃO GERAL

| Item | Status |
|---|---|
| Estrutura do projeto | ✅ Completa e bem organizada |
| Tipos TypeScript | ✅ 18 interfaces, cobrem 100% do domínio |
| Tabelas Supabase | ✅ Todas as tabelas + RLS já existem |
| Funções SQL de auth | ✅ is_admin / is_superadmin SECURITY DEFINER |
| Rotas admin | ✅ Todas as 21+ rotas declaradas + guards |
| Layout (AdminLayout/Sidebar/Header) | ✅ Funcional (pequenos ajustes) |
| Serviços de domínio | ✅ Básicos completos |
| Componentes reutilizáveis | ✅ Biblioteca rica |
| Design system (tokens) | ✅ Público + admin coerentes |
| Login page | ✅ Estrutura correta |
| Estado das páginas admin | ⚠️ Incompletas (50-60% prontas) |
| Dashboard | ⚠️ Indicadores incompletos |
| Formulários completos + uploads | ❌ Faltando na maioria |
| Migrations extras de hardening | ❌ Recomendado 002 |
| Testes de serviços | ⚠️ Poucos (animals-service.test.ts) |

**Recomendação final:**  
Completar as páginas/faltas listadas no item 9, sem recriar nada do que já existe. Aplicar migration 002_admin_hardening.sql para as FKs e soft-deletes faltantes. **Não alterar 001_initial.sql.**

---

## 11. BUCKETS DE STORAGE (referência)

Os serviços esperam os seguintes buckets públicos no Supabase Storage:

| Bucket | Uso | Serviço |
|---|---|---|
| `animals` | Fotos de animais (1 animal por subpasta) | services/animals.ts uploadAnimalImage |
| `gallery` | Fotos da galeria (1 álbum por subpasta) | services/gallery.ts uploadGalleryImage |
| `events` | Imagem destaque eventos | Resolver em services/events (upload a criar) |
| `news` | Capas de notícias | Resolver em services/news (upload a criar) |
| `products` | Fotos brechó | Resolver em services/products (upload a criar) |
| `site` | Logotipo, favicon, imagens institucionais settings | Resolver em services/settings |

**Ação necessária:** Confirmar existência dos buckets no painel Supabase ou documentar criação.
