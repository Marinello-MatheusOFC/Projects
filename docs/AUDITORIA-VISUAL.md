# Auditoria Visual — SOS Focinho Carente

## 1. Problemas Identificados

### 1.1 Identidade Visual
- **Marca subutilizada**: O nome "SOS Focinho Carente" e o ícone `PawPrint` existem, mas não há um **logotipo** propriamente dito (svg, wordmark com tipografia exclusiva).
- **Cores sem função**: As cores atuais (`--color-primary`, `--color-secondary`, `--color-accent`) são aplicadas de forma genérica, sem uma hierarquia ou sistema semântico claro.
- **Tipografia inconsistente**: Não há uma escala tipográfica definida; títulos, subtítulos e corpo usam tamanhos arbitrários.

### 1.2 CSS Atual (`globals.css` + `components.css`)
- **Ausência de design tokens reutilizáveis**: Não existem variáveis para `border-radius`, `shadow`, `spacing`, `breakpoints`, `font-size`, `font-weight`, `line-height`.
- **Estilos soltos e não-componentizados**: Classes como `.page-hero`, `.section`, `.highlight-card` estão misturadas com tokens em `globals.css`. Componentes como `Button`, `Input`, `Modal` têm estilos em `components.css`, mas sem um padrão consistente.
- **Duplicação de código**: Muitos estilos são redefinidos em cada seção (ex: `.hero`, `.page-hero`, `.section-header`, `.section-title`).
- **Falta de responsividade**: Poucos `@media` queries. Alguns layouts quebram em mobile.
- **Falta de dark mode**: Nenhuma variável `--color-*` cobre dark mode. O design atual só funciona em fundo claro.

### 1.3 Estrutura de Arquivos
```
src/
  components/
    common/          (vazio)
    forms/           (vazio)
    feedback/        (4 componentes)
    layout/          (6 componentes)
    ui/              (7 componentes — sem Card, sem Pagination, etc.)
```
- **Faltam componentes essenciais**: `Card`, `Pagination`, `Table`, `Tabs`, `Progress`, `Avatar`, `Tooltip`, `Dropdown`, `Drawer/MobileNav`.
- **`common/` e `forms/` vazios**: Indica que não há componentes compartilhados ou formulários reutilizáveis.

### 1.4 Páginas Públicas
| Página | Problemas |
|--------|-----------|
| **Home** | Hero sem imagem de fundo; seção "Animais disponíveis" vazia (sem grid de cards); seção "Nossa Missão" genérica; CTA final sem destaque visual |
| **Adoção** | Grid de animais placeholder; filtros sem estilização refinada; página de erro sem padding adequado |
| **Sobre** | Valores em grid sem imagens; CTA genérico |
| **Voluntariado** | Formulário longo sem divisão em etapas; sem indicador visual de benefícios |
| **Contato** | Formulário funcional mas sem design atrativo; sem informações de contato (endereço, telefone, mapa) |
| **Como Ajudar** | Cards de categorias sem ícones ilustrativos; seção de doação com placeholder |
| **Eventos** | Página vazia — apenas `EmptyState` |
| **Notícias** | Página vazia — apenas `EmptyState` |
| **Brechó** | Página vazia — apenas `EmptyState` |
| **Galeria** | Página vazia — apenas texto placeholder |
| **Detalhes** (Animal, Evento, Notícia, Produto) | Páginas de erro/empty state apenas; sem conteúdo real |

### 1.5 Páginas Admin
| Página | Problemas |
|--------|-----------|
| **Dashboard** | Cards estáticos com valores zerados; sem gráficos ou indicadores reais |
| **Animais (lista)** | Tabela vazia; só `EmptyState` |
| **Animais (form)** | Formulário completo visualmente funcional, mas sem preview de imagem upload |
| **Adoções, Mensagens, Voluntários, Configurações, Usuários, Eventos, Notícias, Brechó** | Todas com `ErrorState` "Funcionalidade em desenvolvimento" |

### 1.6 Acessibilidade
- Faltam `aria-label` em vários botões de ação
- Skip-to-content existe em `PublicLayout` mas não em `AdminLayout`
- Contraste de cores não verificado
- Foco visível (focus ring) não implementado
- Labels de formulário não associados corretamente em alguns casos (ex: `Select` com `placeholder` como option disabled)
- Modal tem gerenciamento de foco, mas falta `aria-describedby`

### 1.7 Responsividade
- Header quebra em telas muito pequenas
- Footer grid não colapsa em mobile
- `highlights-grid` e `help-grid` não têm `grid-template-columns` responsivo
- Tabelas admin não têm versão mobile (card view)
- Formulários não se adaptam bem em telas < 480px

---

## 2. Diagnóstico Técnico

### 2.1 Stack Atual
- **React 18** com TypeScript
- **Vite** como bundler
- **React Router** v6
- **React Hook Form** + **Zod** para formulários
- **Supabase** para backend
- **Lucide React** para ícones
- **CSS puro** (sem frameworks, sem pré-processadores, sem CSS-in-JS)

### 2.2 Pontos Fortes
- Código TypeScript limpo e bem tipado
- Componentes com `forwardRef` e boas práticas de acessibilidade
- Uso de `zod` para validação de formulários
- Estrutura de diretórios coerente
- Separação clara entre páginas públicas e admin
- Honeypot para spam no formulário de contato

### 2.3 Oportunidades de Melhoria
- CSS é o ponto mais fraco: sem sistema de design, sem consistência, sem responsividade
- Páginas vazias precisam ser preenchidas com conteúdo real
- Admin panel tem funcionalidades incompletas
- Falta tratamento de loading e estados vazios em várias páginas
- Sem testes (unitários, de componentes, e2e)

---

## 3. Resumo das Ações Necessárias

### Curto Prazo (Implementação Imediata)
1. Sistema de design tokens completo (globals.css)
2. Componentes core: Card, Table, Pagination
3. Redesign completo da Home Page
4. Redesign de Header e Footer
5. Responsividade em todas as páginas públicas

### Médio Prazo
6. Preencher páginas vazias (Eventos, Notícias, Brechó, Galeria)
7. Completar funcionalidades admin
8. Implementar dark mode
9. Sistema de notificações/toasts
10. Testes unitários e de componentes

### Longo Prazo
11. Animações e micro-interações (Framer Motion ou CSS transitions)
12. PWA / offline support
13. i18n (internacionalização)
14. E2E tests (Playwright/Cypress)
15. Storybook para o design system
