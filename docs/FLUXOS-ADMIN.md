# Fluxos do Painel Administrativo

Descrição passo a passo dos fluxos principais do painel.

## 1. Login

1. Acessar `/admin` ou qualquer rota protegida sem sessão → redireciona para `/admin/login` com razão `no-access`.
2. Entrar com e-mail/senha do Supabase Auth.
3. A `LoginPage` valida o perfil: papel admin/superadmin **e** `active = true`.
4. Perfil inativo → aviso "Perfil desativado" (razão `inactive`). Sessão expirada → razão `expired`.
5. Sucesso → navega para `/admin`.

## 2. Publicar um Animal

1. `/admin/animais` → "Novo Animal" (`/admin/animais/novo`).
2. Preencha nome, dados, descrição e envie fotos (a primeira vira capa).
3. Salve como **rascunho** ou **publique** diretamente.
4. Na listagem, verifique o badge "Publicado"/"Rascunho".
5. Use a estrela para **destacar**; o animal aparece no portal (seção de destaques) e no painel "Animais em destaque" do Dashboard.
6. `Arquivar` (com confirmação) remove do portal e marca `archived`.

## 3. Acompanhar uma Adoção

1. `/admin/adocoes` lista as solicitações com status.
2. "Detalhes" abre `/admin/adocoes/:id` com dados do candidato e do animal.
3. Altere o status (novo → em análise → contato → entrevista → aprovado/recusado/...).
4. Uma **nota opcional** fica gravada no histórico (timeline) com autor e data.
5. A ação é registrada em auditoria com o status anterior e o novo.

## 4. Galeria

1. `/admin/galeria` lista álbuns (busca + excluir com confirmação).
2. "Novo álbum" (`/admin/galeria/novo`): título, descrição, publicar e upload de fotos.
3. Cada foto pode ter `caption` e `alt`; escolha a **capa**.
4. `/:id` → detalhe: publicar/despublicar, trocar capa, remover foto, excluir álbum.
5. `/:id/editar` → editar dados do álbum (slug regenerado ao mudar o título).

## 5. Atendimento (Mensagens e Voluntários)

- **Mensagens** (`/admin/mensagens`): abrir por link (`/:id`); abrir marca como lida; arquivar; excluir com confirmação.
- **Voluntários** (`/admin/voluntarios`): abrir por link (`/:id`); atualizar status com nota; excluir com confirmação.
- Contadores na sidebar refletem pendências (novas/em análise).

## 6. Auditoria

1. `/admin/auditoria` (superadmin).
2. Filtrar por texto (ação, entidade, id, ator) e por tipo de entidade.
3. Badges coloridas por ação; "Atualizar" recarrega.

## 7. Configurações

1. `/admin/configuracoes` — seções independentes (identidade, contato, redes sociais, etc.).
2. Cada seção tem "Salvar" próprio; sucesso/erro exibido com Alert.
3. Valores salvos em `site_settings` e consumidos pelo portal público.

## 8. Usuários (superadmin)

1. `/admin/usuarios` — leitura de todos os perfis (nome, papel, ativo, criado em).
2. Gestão (mudar papel/desativar) é feita no painel do Supabase; a página é somente leitura.

## Padrões Transversais

- Toda ação destrutiva pede confirmação via `ConfirmDialog`.
- Toda ação de escrita relevante chama `logAudit` em `src/services/audit.ts`.
- Erro de carregamento → `ErrorState` com retry; lista vazia → `EmptyState`.
- Alteração de dados em lote atualiza o estado local e/ou recarrega a lista.
