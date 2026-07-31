# Imagens a Substituir

Este documento mapeia cada imagem demonstrativa para o local onde deve ser substituída por fotografia real.

## Imagens Demonstrativas vs. Destino Final

| Imagem Demo | Usada Em | Deve Ser Substituída Por |
|---|---|---|
| `hero-dog.jpg` | HomePage (hero + CTA final) | Foto de animal em destaque da ONG (olhando para câmera, fundo limpo) |
| `hero-cat.jpg` | AdoptionPage (hero), AboutPage (hero), GalleryPage (hero) | Foto institucional ampla |
| `animal-dog-01.jpg` | HomePage (card Toddy), AdoptionPage (cards), AnimalDetailPage (não encontrado) | Fotos individuais de cada animal disponível |
| `animal-cat-01.jpg` | HomePage (card Mel), AdoptionPage (cards), AnimalDetailPage (principal) | Fotos individuais de cada animal disponível |
| `animal-cat-02.jpg` | HomePage (card Luna + processo), AdoptionProcessPage (hero), AdoptionPage (cards), AnimalDetailPage (thumbnail 2) | Fotos individuais de cada animal disponível |
| `care-volunteer.jpg` | HomePage (história), HowToHelpPage (hero + cards) | Foto de voluntário interagindo com animal |
| `community-event.jpg` | HomePage (sobre a ONG), VolunteeringPage (hero), EventsPage (hero), NewsPage (hero) | Foto institucional ou de evento real |
| `animal-paw.jpg` | ContactPage (hero), GalleryPage (items), ProductsPage (hero) | Foto institucional ou detalhe |

## Imagens Placeholder (SVG)

As SVGs em `/public/images/placeholders/` são fallbacks visuais com a identidade visual da marca. Elas aparecem quando:

1. A imagem `src` está vazia ou não foi fornecida
2. A imagem carregada apresenta erro (404, timeout, etc.)
3. O componente `ResponsivePicture` recebe `supabaseBucket`/`supabasePath` sem `src` e a URL não pôde ser construída

Essas SVGs **não precisam ser substituídas** — são parte do sistema de fallback.

## Próximos Passos

1. **Fotografar** os animais disponíveis para adoção com boa iluminação e fundo neutro
2. **Fotografar** a equipe de voluntários em ação
3. **Fotografar** as instalações da ONG
4. **Fotografar** eventos reais
5. Fazer upload para o Supabase Storage (bucket `animal-images` ou similar)
6. Atualizar o banco de dados com os `storage_path` correspondentes
7. Remover as imagens demonstrativas de `public/images/demo/`
