# Auditoria Visual Final

## Resumo das Alterações

### Imagens

- **8 fotografias demonstrativas** baixadas para `public/images/demo/` (Unsplash, licença livre)
- **8 SVGs placeholder** com a identidade visual da marca em `public/images/placeholders/`
- Todos os 25 pontos de imagem no código agora apontam para fotos reais ou SVGs placeholder
- Nenhuma imagem quebra (404) na renderização

### Componente ResponsivePicture

- Adicionado `fallback` prop que aceita: `hero | animal | cat | story | gallery | care | help | event`
- Adicionado `supabaseBucket` e `supabasePath` para construção de URL do Supabase Storage em runtime
- Fallback agora exibe SVG temático da marca em vez de texto genérico
- Compatibilidade retroativa mantida

### Paleta de Cores (CSS Variables)

- **Coral** (primary): 10 tons (#50 ao #900)
- **Verde** (secondary): 10 tons (#50 ao #900)
- **Amarelo** (accent): 10 tons (#50 ao #900)
- **Tons terra**: earth-light, earth-lighter, earth-dark

### Páginas Atualizadas (11 páginas)

| Página | Hero | Conteúdo |
|---|---|---|
| HomePage | `hero-dog.jpg` | 3 animais + história + sobre + processo + galeria |
| AdoptionPage | `hero-cat.jpg` | 6 cards com fotos variadas |
| AdoptionProcessPage | `animal-cat-02.jpg` | — |
| AboutPage | `hero-cat.jpg` | `community-event.jpg` |
| HowToHelpPage | `care-volunteer.jpg` | 6 cards com `care-volunteer.jpg` |
| VolunteeringPage | `community-event.jpg` | — |
| ContactPage | `animal-paw.jpg` | — |
| EventsPage | `community-event.jpg` | — |
| GalleryPage | `hero-cat.jpg` | 4 itens variados |
| NewsPage | `community-event.jpg` | — |
| ProductsPage | `animal-paw.jpg` | — |
| AnimalDetailPage | — | Principal + 3 thumbnails variados |

### Sistema de Fallback (3 níveis)

1. **Priority 1**: `src` fornecida diretamente (ex: `/images/demo/hero-dog.jpg`)
2. **Priority 2**: `supabaseBucket` + `supabasePath` constroem URL do Storage
3. **Priority 3**: SVG placeholder temático baseado no `fallback` prop
