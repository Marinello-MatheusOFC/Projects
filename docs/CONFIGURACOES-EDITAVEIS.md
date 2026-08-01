# Configurações Editáveis do Site

O painel de configurações (`/admin/configuracoes`) edita registros da tabela `site_settings`, armazenados como `value_json` (JSONB) por chave. O portal público lê apenas as chaves com `public = true`.

## Seções Editáveis

| Seção | Chave | Campos |
| --- | --- | --- |
| Contatos | `org_contacts` | email, phone, whatsapp, address |
| Redes sociais | `org_social` | instagram, facebook, youtube |
| Doação PIX | `donations_pix` | pix_key, pix_owner |
| Sobre | `org_about` | mission, short_description |

## Comportamento

- Cada seção é um formulário independente com botão "Salvar" próprio e feedback de sucesso (`Alert`) e de erro.
- `saveSiteSetting` (em `src/services/settings.ts`) faz *upsert* por chave: atualiza se já existe ou insere com `public = true`.
- O campo `updated_by` recebe o nome do perfil que salvou (via `useAuth().profile`).
- Enquanto não houver registro no banco, a página exibe os valores de demonstração (`demoSettings`) e mostra um aviso "Exibindo dados de demonstração".

## Como o Portal Consome

`fetchOrgInfo()` (também em `settings.ts`) busca `site_settings` com `public = true`, monta `OrgInfo` e aplica os valores em contato, rodapé, links de redes sociais, dados do PIX e textos "Sobre". Se a tabela estiver vazia, usa os valores de demonstração — mesma regra aplicada no painel.

## Adicionar uma Nova Configuração

1. Defina a interface do dado (ex.: `OrgContacts`) em `src/services/settings.ts`.
2. Adicione a chave em `SETTING_KEYS` em `AdminSettingsPage.tsx` e o bloco de formulário com seu "Salvar".
3. Inclua um default em `emptyOrgInfo` e, se aplicável, um valor de demonstração em `src/data/content.ts`.
4. Consuma em `fetchOrgInfo` e na página pública desejada.
5. Registre a chave em `docs/CONFIGURACOES-EDITAVEIS.md`.

## Observações

- Não edite diretamente o JSONB fora da aplicação sem seguir o formato das chaves acima.
- Alterar valores não exige re-deploy: o portal reflete a mudança ao recarregar.
