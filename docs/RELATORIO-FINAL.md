# Relatório Final — Redesign SOS Focinho Carente

## Escopo desta fase

Redesign completo das páginas públicas com a identidade coral/verde/amarelo,
tipografia Manrope/Inter e composição editorial, **além de aplicar a mesma
identidade ao painel administrativo**, conectando tudo aos serviços com
**dados reais do Supabase quando disponíveis e fallback local demonstrado**
quando o backend local está desligado. Nenhuma migration, regra de RLS,
autenticação ou schema de banco foi alterado.

## Camada de dados

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/supabase.ts` | Client Supabase (autenticação e consultas) |
| `src/lib/images.ts` | `resolveImageUrl`, `getStoragePublicUrl`, `withFallback` (fallback apenas em erro real) |
| `src/lib/format.ts` | Rótulos pt-BR, datas, moeda, `slugify` |
| `src/data/animals.ts` | 6 animais de demonstração com imagens e histórias |
| `src/data/content.ts` | Eventos, notícias, produtos, galeria e configurações de demonstração |
| `src/services/animals.ts` | CRUD + upload de imagens de animais (fallback demo) |
| `src/services/events.ts` | CRUD de eventos (fallback demo) |
| `src/services/news.ts` | CRUD de notícias (fallback demo) |
| `src/services/products.ts` | CRUD de produtos (fallback demo) |
| `src/services/gallery.ts` | Álbuns e imagens da galeria (fallback demo) |
| `src/services/applications.ts` | Formulários de adoção, contato, voluntariado + status administrativos |
| `src/services/settings.ts` | `fetchOrgInfo`, `fetchAllSettings`, `saveSiteSetting` |

**Regra do fallback:** os serviços consultam o Supabase e, apenas em caso de
erro real (rede, backend desligado), retornam dados de demonstração. Resultados
vazios são respeitados. Fotos demonstrativas **não** são associadas a animais
reais.

## Páginas públicas

| Página | Status |
|--------|--------|
| Home | Hero editorial, animais em destaque e eventos vindos dos serviços, loading skeletons |
| Adoção (`/adocao`) | Listagem com filtros (nome, espécie, sexo, porte) usando `fetchAdoptableAnimals` |
| Detalhe do animal (`/adocao/:slug`) | Galeria, história, personalidade, lar ideal, formulário de interesse real |
| Processo de adoção | Etapas editoriais + CTA |
| Sobre | Conteúdo editorial + `fetchOrgInfo` quando preenchido |
| Como ajudar | Formas de ajudar; PIX exibido somente se preenchido |
| Voluntariado | Formulário real (`submitVolunteerApplication`) |
| Eventos (`/eventos` e detalhe) | Próximos/passados, badges de status, detalhe com sidebar |
| Notícias (`/noticias` e detalhe) | Lista com destaque, detalhe com conteúdo |
| Brechó (`/brecho` e detalhe) | Produtos com preço pt-BR, disponibilidade, CTA para contato |
| Galeria (`/galeria`) | Álbuns com imagens resolvidas e lightbox acessível |
| Contato | Formulário real (`submitContactMessage`), contatos/redes via `fetchOrgInfo` |

## Painel administrativo

| Página | Status |
|--------|--------|
| Login | Usa o logotipo oficial (não mais `PawPrint`) |
| Dashboard | Indicadores reais dos serviços (animais, adoções, mensagens, voluntários, produtos, eventos) |
| Animais (lista + formulário) | Tabela com busca, editar/arquivar; formulário com upload de fotos, capa e exclusão |
| Eventos (lista + formulário) | CRUD completo com datas `datetime-local` |
| Notícias (lista + formulário) | CRUD completo com rascunho/publicada |
| Produtos (lista + formulário) | CRUD completo com preço e disponibilidade |
| Adoções | Tabela com status, detalhes em modal, mudança de status e histórico |
| Mensagens | Tabela com ações (ler, arquivar, excluir) e detalhe em modal |
| Voluntários | Tabela com mudança de status em modal e exclusão |
| Configurações | Contatos, redes sociais, PIX e sobre (salvos via `saveSiteSetting`) |
| Usuários | Perfis somente leitura (com fallback demo) |

Layout: `AdminSidebar` e `AdminHeader` usam o logotipo oficial e a identidade nova.

## Identidade e layout

- Paleta coral/verde/amarelo aplicada como tokens em `globals.css` e `components.css`
- Tipografia: Manrope (títulos) + Inter (corpo) com escala fluida `clamp()`
- Header reescrito com drawer móvel acessível (foco aprisionado, Escape, scroll lock)
- Footer com contatos e redes sociais vindos de `fetchOrgInfo` (sem links falsos)
- `ResponsivePicture` com fallback contextual ("Foto em atualização", etc.) e sem render de imagens quebradas
- `document.title` dinâmico em todas as páginas

## Testes

```
npm run typecheck → OK (0 erros)
npm run lint      → OK (0 warnings)
npm run test      → OK (4 arquivos, 20 testes)
npm run build     → OK
```

## Pendências de manutenção (fora do escopo desta fase)

- Dark mode completo
- Animações de transição entre páginas
- Notificação/toast global
- Testes de integração dos formulários e schemas Zod
- Testes de acessibilidade automatizados (axe)
- E2E com Playwright
- Ajuste de chunk size no build (aviso pré-existente)
