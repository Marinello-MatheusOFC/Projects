# Validação visual por rota

Data: 31/07/2026
Método: Playwright (chromium headless, Chrome) sobre o Vite dev
(`http://localhost:3001`), 14 rotas × 4 viewports
(360×800, 768×1024, 1440×900, 1920×1080) = 56 medições.

## Critérios medidos por rota
- overflow: `document.documentElement.scrollWidth > innerWidth`
- broken: imagens carregadas com `naturalWidth === 0`
- emoji: presença de emojis no texto renderizado
- font: Manrope e Inter carregados (`document.fonts.check`)
- navwrap: menu do cabeçalho com quebra de linha no desktop
- erros de console não relacionados a Supabase

## Resultado

| Rota | Overflow | Img quebrada | Emoji | Fontes | Menu wrap | Status |
|------|----------|--------------|-------|--------|-----------|--------|
| `/` | 0 | 0 | 0 | OK | 0 | OK |
| `/sobre` | 0 | 0 | 0 | OK | 0 | OK |
| `/adocao` | 0 | 0 | 0 | OK | 0 | OK |
| `/processo-de-adocao` | 0 | 0 | 0 | OK | 0 | OK |
| `/como-ajudar` | 0 | 0 | 0 | OK | 0 | OK |
| `/voluntariado` | 0 | 0 | 0 | OK | 0 | OK |
| `/eventos` | 0 | 0 | 0 | OK | 0 | OK |
| `/noticias` | 0 | 0 | 0 | OK | 0 | OK |
| `/brecho` | 0 | 0 | 0 | OK | 0 | OK |
| `/galeria` | 0 | 0 | 0 | OK | 0 | OK |
| `/contato` | 0 | 0 | 0 | OK | 0 | OK |
| `/admin/login` | 0 | 0 | 0 | OK | 0 | OK |
| `/admin` | 0 | 0 | 0 | OK | 0 | OK |
| `/rota-inexistente` (404) | 0 | 0 | 0 | OK | 0 | OK |

## Composição do hero (1440px)
- Home: conteúdo à esquerda, mídia `aspect-ratio 4/3` na coluna direita
  (x≈692, w≈628, h≈471) — grid 2 colunas funcionando.
- Demais páginas: `PageHeader` com grid 2 colunas
  `minmax(0,5fr) minmax(0,6fr)`, mídia à direita com `object-fit: cover`.

## Cabeçalho (1440px)
- Altura 73px (faixa 72–88px), fundo `#FFFEFC` translúcido.
- Marca (x=120), nav central, CTA à direita — 1 linha, sem wrap.

## Erros de console
- Únicos erros registrados: `ERR_CONNECTION_REFUSED` (Supabase desligado
  no ambiente de dev). Sem erros de JS, sem falhas de asset, sem 404 de
  imagem.

## Observações
- `/admin` e `/admin/login` sem sessão redirecionam para login — o login
  renderiza corretamente; o dashboard exige autenticação.
- Screenshots das medições: `vischeck/shots/` (fora do repositório).
