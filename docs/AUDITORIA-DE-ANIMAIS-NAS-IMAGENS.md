# Auditoria de Animais nas Imagens

**Data da auditoria:** 31/07/2026

## Objetivo

Verificar se alguma fotografia ou referência textual dentro do front público
utiliza animais que não pertencem ao contexto de uma ONG de acolhimento e
adoção de animais domésticos (cães e gatos). O objetivo é garantir coesão
visual e emocional com a direção de arte: "Energia que acolhe. Cor que aproxima.
Histórias que encontram um novo começo."

## Critérios de busca

Termos buscados no código-fonte (`src/`) e nos nomes de arquivos de imagem
(`public/images/demo/`):

- `leão`, `leao`, `lion`
- `tigre`, `tiger`
- `wildlife`, `wild`
- `zoo`, `safari`
- `exótico`, `exotico`
- `selvagem`
- `girafa`, `giraffe`, `elefante`, `elephant`, `macaco`

## Resultado

**Nenhuma referência a animais selvagens ou exóticos foi encontrada.**

- `src/`: 0 ocorrências.
- `public/images/demo/`: 0 ocorrências em nomes de arquivos.

## Imagens em uso no front público (mapeamento)

| Arquivo | Onde é usado | Contexto |
| --- | --- | --- |
| `hero-dog.jpg` | Home (hero) | Animal doméstico aguardando adoção |
| `hero-cat.jpg` | Home (mini-foto), Adoção (PageHeader) | Gato doméstico |
| `animal-cat-01.jpg` | Notícias (PageHeader), NewsEmptyState | Gato doméstico |
| `animal-cat-02.jpg` | Home (jornada), Processo de Adoção (PageHeader) | Gato doméstico |
| `animal-cat-03.jpg` | Galeria (PageHeader) | Gato doméstico |
| `animal-cat-04.jpg` | Como Ajudar (card) | Gato doméstico |
| `animal-dog-01.jpg` | Detalhe do animal (não encontrado) | Cão doméstico |
| `animal-dog-02.jpg` | Home (história) | Cão doméstico |
| `animal-puppy.jpg` | Como Ajudar (PageHeader) | Filhote doméstico |
| `animal-bunny.jpg` | Contato (PageHeader), Como Ajudar (card) | Coelho doméstico |
| `animal-paw.jpg` | Brechó (PageHeader), Home (mosaico) | Pata (detalhe) |
| `shelter-space.jpg` | Sobre (PageHeader), Home (mosaico) | Estrutura do abrigo |
| `community-event.jpg` | Sobre (história), Home (mosaico) | Evento comunitário |
| `adoption-event.jpg` | Eventos (PageHeader), Home (mosaico), EventsEmptyState | Feira de adoção |
| `care-volunteer.jpg` | Voluntariado (PageHeader), Home (quem cuida) | Voluntário cuidando |
| `volunteer-care.jpg` | Como Ajudar (card) | Voluntário cuidando |
| `volunteer-team.jpg` | Como Ajudar (card) | Equipe de voluntários |
| `volunteering/volunteers-team.jpg` | Home (mosaico) | Voluntários em ação |
| `animals/two-dogs.jpg` | Home (mosaico) | Amizade no acolhimento |

## Conclusão

Todas as imagens pertencem ao universo de animais domésticos, voluntários,
abrigo e eventos da ONG. Nenhuma imagem de animal selvagem/exótico precisa ser
substituída por esse motivo. Manter `animal-bunny.jpg` em uso é aceitável, pois
coelho doméstico é animal de companhia.
