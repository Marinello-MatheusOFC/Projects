# Inventário de Componentes — Pós-Redesign

## Componentes de UI (`/src/components/ui/`)

| Componente | Arquivo | Status | Observações |
|-----------|---------|--------|-------------|
| Badge | `Badge.tsx` | Mantido | Variantes: default, success, warning, error, info |
| Button | `Button.tsx` | Mantido | Variantes: primary, secondary, outline, ghost, danger. Sizes: sm, md, lg |
| Card | `Card.tsx` | **Novo** | Subcomponentes: CardImage, CardBody, CardTitle, CardText, CardFooter |
| Checkbox | `Checkbox.tsx` | Mantido | Com label, error, forwardRef |
| Input | `Input.tsx` | Mantido | Com label, error, helperText, forwardRef, aria-describedby |
| Modal | `Modal.tsx` | Mantido | Com foco gerenciado, aria-modal, sizes: sm, md, lg |
| Pagination | `Pagination.tsx` | **Novo** | Com botões de navegação, aria-label, aria-current |
| Select | `Select.tsx` | Mantido | Com label, error, placeholder, forwardRef |
| Table | `Table.tsx` | **Novo** | Genérico `<T>`, responsive wrapper |
| Tabs | `Tabs.tsx` | **Novo** | Com role tablist/tab, aria-selected |
| Textarea | `Textarea.tsx` | Mantido | Com label, error, forwardRef |

## Componentes de Feedback (`/src/components/feedback/`)

| Componente | Arquivo | Status | Observações |
|-----------|---------|--------|-------------|
| Alert | `Alert.tsx` | Mantido | Tipos: success, error, info, warning. Toast incluso |
| EmptyState | `EmptyState.tsx` | Mantido | Com icon, title, description, action |
| ErrorState | `ErrorState.tsx` | Mantido | Com mensagem configurável e onRetry |
| Skeleton | `Skeleton.tsx` | Mantido | Subcomponentes: CardSkeleton, TableSkeleton |

## Componentes de Layout (`/src/components/layout/`)

| Componente | Arquivo | Status | Observações |
|-----------|---------|--------|-------------|
| AdminHeader | `AdminHeader.tsx` | Mantido | Exibe nome e role do usuário |
| AdminLayout | `AdminLayout.tsx` | Aprimorado | Adicionado skip-to-content link |
| AdminSidebar | `AdminSidebar.tsx` | Mantido | Collapsible, navegação admin |
| Footer | `Footer.tsx` | Mantido | Grid responsivo, seções de links |
| Header | `Header.tsx` | Mantido | Sticky com backdrop-filter, mobile toggle |
| PublicLayout | `PublicLayout.tsx` | Mantido | Skip-to-content + Header + Footer |

## Páginas Públicas

| Página | Arquivo | Status | Observações |
|--------|---------|--------|-------------|
| Home | `HomePage.tsx` | Mantido | Hero com gradient, destaques, missão, CTA |
| Sobre | `AboutPage.tsx` | Mantido | História, valores, áreas de atuação |
| Adoção | `AdoptionPage.tsx` | Mantido | Filtros, grid de animais |
| Detalhe Animal | `AnimalDetailPage.tsx` | Mantido | Modal de adoção |
| Processo Adoção | `AdoptionProcessPage.tsx` | Mantido | Timeline de etapas |
| Como Ajudar | `HowToHelpPage.tsx` | Mantido | Categorias de contribuição |
| Voluntariado | `VolunteeringPage.tsx` | Mantido | Formulário de cadastro |
| Contato | `ContactPage.tsx` | Mantido | Formulário com validação |
| Eventos | `EventsPage.tsx` | Vazio | Apenas EmptyState |
| Detalhe Evento | `EventDetailPage.tsx` | Vazio | Apenas estado vazio |
| Notícias | `NewsPage.tsx` | Vazio | Apenas EmptyState |
| Detalhe Notícia | `NewsDetailPage.tsx` | Vazio | Apenas estado vazio |
| Brechó | `ProductsPage.tsx` | Vazio | Apenas EmptyState |
| Detalhe Produto | `ProductDetailPage.tsx` | Vazio | Apenas estado vazio |
| Galeria | `GalleryPage.tsx` | Vazio | Apenas texto placeholder |

## Páginas de Erro

| Página | Arquivo | Status | Observações |
|--------|---------|--------|-------------|
| 404 | `NotFoundPage.tsx` | **Novo** | CTA para início e adoção |
| 403 | `ForbiddenPage.tsx` | **Novo** | CTA para início e contato |
| 500 | `ServerErrorPage.tsx` | **Novo** | CTA para recarregar e início |

## Páginas Admin

| Página | Arquivo | Status | Observações |
|--------|---------|--------|-------------|
| Login | `LoginPage.tsx` | Mantido | Autenticação Supabase |
| Dashboard | `DashboardPage.tsx` | Mantido | Cards indicadores estáticos |
| Animais (lista) | `AdminAnimalsPage.tsx` | Mantido | Com busca e EmptyState |
| Animais (form) | `AdminAnimalsFormPage.tsx` | Mantido | Formulário completo |
| Adoções | `AdminAdoptionsPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Eventos (lista) | `AdminEventsPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Eventos (form) | `AdminEventsFormPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Notícias (lista) | `AdminNewsPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Notícias (form) | `AdminNewsFormPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Brechó (lista) | `AdminProductsPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Brechó (form) | `AdminProductsFormPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Mensagens | `AdminMessagesPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Voluntários | `AdminVolunteersPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Configurações | `AdminSettingsPage.tsx` | Em desenvolvimento | ErrorState placeholder |
| Usuários | `AdminUsersPage.tsx` | Em desenvolvimento | ErrorState placeholder |
