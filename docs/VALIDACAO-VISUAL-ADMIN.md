# Validação Visual do Painel Administrativo

Checklist de inspeção manual a ser percorrido antes de considerar o painel finalizado.

## Como Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000/admin`. Faça login com um perfil admin/superadmin ativo.

## Viewports a Testar

- Mobile: 360x640 e 390x844
- Tablet: 768x1024
- Desktop: 1024x768, 1280x800 e 1440x900

## Checklist Geral

- [ ] Sidebar fixa em `>= 1024px`; drawer com overlay em `< 1024px`.
- [ ] Drawer fecha com: botão, clique no overlay, tecla `Escape` e troca de rota.
- [ ] Com o drawer aberto no mobile, o body não rola.
- [ ] Breadcrumb no header reflete a rota atual (ex.: Administrativo / Animais / Nome).
- [ ] Menu do perfil abre e fecha com clique fora e `Escape`; avatar mostra as iniciais.
- [ ] Foco visível em todos os controles (links, botões, inputs, selects).
- [ ] Sem scroll horizontal indesejado; tabelas com muitas colunas rolam internamente (`overflow-x`).
- [ ] `prefers-reduced-motion` respeitado (transições minimizadas).

## Por Rota

### Login (`/admin/login`)
- Layout de 2 colunas em `>= 1024px` (marca + formulário); empilhado no mobile.
- Avisos de "sessão expirada", "perfil inativo" e "acesso negado" aparecem conforme o estado vindo do `AdminRoute`.
- Botão "Voltar ao site" presente.

### Dashboard (`/admin`)
- Saudação com o nome do usuário.
- 6 cards de indicadores com link para as seções.
- Gráfico de adoções por status acessível (`role="img"` + `aria-label` descritivo).
- Painel "Animais em destaque" mostra miniaturas clicáveis.

### Animais (`/admin/animais` + detalhe + editar)
- Ações: destacar (estrela), editar, arquivar.
- ConfirmDialog aparece ao arquivar; animal some da lista após confirmar.
- Detalhe mostra fotos, capa, status, flag de destaque/publicado, dados e auditoria.
- Fluxo completo: criar → rascunho → publicar → ver no portal → destacar → arquivar.

### Adoções (`/admin/adocoes` + `/admin/adocoes/:id`)
- "Detalhes" abre a página de detalhe (não modal).
- Alteração de status grava nota opcional, atualiza histórico (timeline) e registra auditoria.

### Mensagens / Voluntários (`/admin/mensagens`, `/admin/voluntarios`)
- Abertura via link para `/admin/mensagens/:id` e `/admin/voluntarios/:id`.
- Mensagens: marcar como lida/arquivar/excluir (excluir com confirmação).
- Voluntários: mudança de status no detalhe; excluir com confirmação.

### Galeria (`/admin/galeria`, `/novo`, `/:id`, `/:id/editar`)
- Upload múltiplo de imagens, campo caption/alt por foto, definir capa.
- Publicar/despublicar álbum; excluir foto/álbum com confirmação.
- Slug gerado automaticamente a partir do título.

### Auditoria (`/admin/auditoria`)
- Busca por texto e filtro por entidade; badges por ação.
- Botão "Atualizar" recarrega os registros.

### Usuários (`/admin/usuarios`)
- Apenas superadmin vê no menu; página é somente leitura.
- Perfil inativo aparece como "Não".

### Configurações (`/admin/configuracoes`)
- Salvar cada seção mostra feedback de sucesso/erro.
- Valores alterados refletem no portal público após salvar.

## Contraste e Cores

- Texto principal `--admin-text` sobre `--admin-surface`/`--admin-cream`.
- Vermelho/amarelo/verde usados como acentos, nunca como única fonte de informação (badges sempre têm texto).
- Estados de erro/sucesso acompanham ícone e mensagem de texto.

## Regressão no Portal Público

- Verificar que `/` (home), `/adotar`, `/eventos`, `/brecho`, `/galeria`, `/contato` e `/voluntario` continuam com a identidade vibrante, sem nenhum estilo admin vazando.
