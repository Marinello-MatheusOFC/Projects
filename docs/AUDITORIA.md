# Auditoria de Ações Administrativas

## Objetivo

Registrar as ações administrativas relevantes em `audit_logs` para rastreabilidade. A página `/admin/auditoria` (acesso restrito a **superadmin**) permite consultar o histórico.

## Tabela `audit_logs`

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| id | uuid (PK) | Identificador do registro |
| actor_id | uuid | Usuário autenticado que executou a ação (null se indisponível) |
| action | text | Ação executada (ex.: `publicar`, `arquivar`) |
| entity_type | text | Entidade afetada (ex.: `animal`, `gallery_album`) |
| entity_id | uuid | Registro afetado |
| metadata | jsonb | Detalhes adicionais (nome, slug, status anterior/novo) |
| created_at | timestamptz | Quando ocorreu |

## Como Registrar

O serviço `src/services/audit.ts` expõe:

```ts
logAudit(action, entityType, entityId?, metadata?)
```

Ele lê o usuário atual via `supabase.auth.getUser()` e insere o registro. Qualquer página que altere dados de forma relevante deve chamá-lo.

## Ações Registradas

| Ação | Entidade(s) | Contexto |
| --- | --- | --- |
| `criar` | animal, gallery_album | Criação de registro |
| `publicar` / `despublicar` | animal, gallery_album | Toggle de publicação |
| `destacar` / `remover_destaque` | animal | Toggle de destaque no portal |
| `arquivar` | animal, contact_message, volunteer_application | Arquivamento |
| `excluir` | contact_message, volunteer_application, gallery_album | Exclusão |
| `atualizar_status` | adoption_application, volunteer_application | Mudança de status (metadata: status anterior e novo) |
| `marcar_lida` | contact_message | Mensagem lida |

Registros de exclusão são mantidos mesmo após o registro original ser removido (contém `entity_id` + metadata).

## Página de Auditoria

- Lista os 200 registros mais recentes (`fetchAuditLogs`), mais novo primeiro.
- Busca por texto livre (ação, entidade, id, metadados).
- Filtro por tipo de entidade.
- Badges de cor derivadas da ação: criação/publicação em verde; exclusão/arquivamento em vermelho; demais em azul.
- Botão "Atualizar" recarrega o histórico.

## Boas Práticas

- Nunca logue dados pessoais em `metadata` (apenas referências e identificadores).
- Não logue dados sensíveis (ex.: telefone/e-mail do candidato em status).
- A inserção usa as políticas RLS: apenas admins podem inserir em `audit_logs`.
- Falha ao registrar a auditoria não deve bloquear a ação principal em casos não críticos; nos fluxos atuais, a falha de escrita da ação principal já aborta a operação.
