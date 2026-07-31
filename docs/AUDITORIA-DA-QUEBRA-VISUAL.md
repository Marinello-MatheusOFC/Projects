# Auditoria da quebra visual

Data: 31/07/2026
Escopo: camada visual do portal público e do painel administrativo.
Restrição: nenhuma mudança em banco, Supabase, auth, rotas, serviços,
consultas, formulários, permissões ou dados reais.

## 1. Causa raiz consolidada

A rejeição anterior ("site inteiro visualmente quebrado") não veio de um
CSS global corrompido — cores e tipografia estavam íntegras. A quebra era de
**composição e acabamento**, repetida em todas as rotas:

| # | Problema | Onde ocorria |
|---|----------|--------------|
| 1 | Hero `page-hero` full-bleed: foto esticada (hero-cat.jpg = 1200x1600) coberta por overlay escuro com texto centralizado por cima, em toda rota | Todas as páginas |
| 2 | `.header-inner` sem restrição de largura (<1200px), texto colado nas bordas; altura 69px (abaixo do mínimo de 72px) | Header global |
| 3 | Conteúdo solto fora de container (ex.: 404 sem `.container`, textos na borda) | Páginas de erro |
| 4 | HTML inválido `<Link><Button>` (button dentro de a) | 404/403/500 |
| 5 | Mesmas fotos repetidas em seções diferentes (md5 idênticos) | Home/Galeria/Eventos |
| 6 | Zero hierarquia de cabeçalho (sem eyebrow/título/subtítulo separados) | Todas as páginas |
| 7 | Fallbacks de imagem com emoji (despadronizavam a identidade) | ResponsivePicture |

## 2. O que foi feito (sempre visual)

### 2.1 Fundação de estilos
- `src/styles/tokens.css` — paleta única (coral `#E64A35`, verde `#16866F`,
  amarelo `#F2AB37`, creme `#FBFAF7`), tokens semânticos `--color-*`,
  tipografia Manrope + Inter com `clamp()`, escala de espaço, raios, sombras,
  `--container-max: 1200px`, `--container-gutter: 32px`.
- `src/styles/reset.css` — box-sizing, margens zeradas, `h1`–`h4` com
  `text-wrap: balance`, `:focus-visible`, `prefers-reduced-motion`.
- `src/styles/utilities.css` — `.container` com
  `width: min(100% - var(--container-gutter), var(--container-max))`,
  seções, grades `.grid--sm-2/3/4`, `.split`/`.split--reverse`, `.stack`,
  `.ratio-*`, utilities de cor/fundo, `.section-intro--left`.
- `src/styles/globals.css` — reescrito como ponto de entrada que importa
  tokens → reset → utilities → components + Google Fonts.
- `src/styles/components.css` — removido CSS morto (`.final-cta-*`,
  `.emotional-hero`, `.btn--outline-white`, animações órfãs).

### 2.2 Cabeçalho e rodapé
- `.header-inner`: `width: min(100% - var(--container-gutter), var(--container-max))`
  e `height: 72px` (padrão 72–88px aprovado).
- Marca com nome + tagline em elementos separados (`gap: 2px`).
- Desktop: 1 linha, marca à esquerda, nav central, CTA final.
- `.footer-inner` com o mesmo container. Drawer mobile preservado
  (coberto por `tests/header.test.tsx`).

### 2.3 Cabeçalhos de página (`PageHeader`)
- Novo componente `src/components/layout/PageHeader.tsx` com
  `eyebrow / title / subtitle / actions / media`.
- Estilo `.page-header`: gradiente quente `--color-bg-warm → --color-bg`,
  grid 2 colunas `minmax(0, 5fr) minmax(0, 6fr)` a partir de 960px,
  `.page-header__media` com `aspect-ratio: 4/3` e `object-fit: cover`
  (sem texto sobre rosto).
- Todas as páginas públicas migraram de `page-hero` → `PageHeader`
  (Adoção, Processo, Como Ajudar, Voluntariado, Sobre, Eventos, Notícias,
  Detalhes, Brechó, Galeria, Contato).

### 2.4 Home
- Hero reconstruído `.home-hero`: grid 2 colunas — conteúdo (eyebrow, título,
  texto, ações) à esquerda e `.home-hero__media` (aspect-ratio 4/3) à direita.
- CTA final substituído pelo componente `CallToAction`
  (variantes `primary` e `deep`).
- Fotos não repetidas entre seções (galeria/história mapeadas para arquivos
  distintos).

### 2.5 Imagens
- `.ratio-*` e `aspect-ratio` aplicados onde havia fotos esticadas.
- Fallbacks de imagem trocados de emoji para ícones Lucide
  (`FallbackContext` exportado em `ResponsivePicture.tsx`); textos
  `role="img"`/`aria-label` mantidos (testes intactos).

### 2.6 Páginas de erro
- `404/403/500` reescritos: botões com `className="btn btn--primary|outline"`
  fora de `<Link>` (HTML válido), `.error-actions` com flex.
- Removidos arquivos duplicados `src/pages/public/{NotFound,Forbidden,ServerError}Page.tsx`
  (o router já usava `src/pages/errors/*`).

### 2.7 Painel administrativo
- Sidebar com `position: sticky; height: 100vh` (rolagem independente).
- Responsivo: ≤767px o menu colapsa para 64px (ícones), conteúdo com
  padding reduzido.
- Cards do dashboard com `border-radius: var(--radius-lg)`, ícones com
  `--radius-md`; card de login com `--radius-2xl`.
- Estrutura (tabelas, formulários, modais, estados) já estava íntegra e foi
  preservada.

## 3. O que foi mantido (proibido alterar)
- Banco de dados, Supabase, autenticação, rotas, serviços, consultas,
  formulários, permissões e dados reais — intocados.
- Lógica e testes existentes (`tests/header.test.tsx`,
  `tests/responsive-picture.test.tsx`).

## 4. Verificação
- `npm run typecheck` — OK.
- `npm run lint` — OK.
- `npm run test` — 20/20 passando.
- `npm run build` — OK (somente aviso de tamanho de chunk).
- Probe visual (Playwright + Chrome) em 14 rotas × 4 larguras
  (360/768/1440/1920) → 56 medições sem overflow horizontal, sem imagem
  quebrada, sem emoji, sem wrap do menu; únicos erros de console são
  `ERR_CONNECTION_REFUSED` do Supabase desligado (esperado).
