# Permissões do Painel Administrativo

## Regra Central

Nenhum usuário é tratado como admin pela autenticação. A autorização é feita **sempre** pelo perfil no banco (`profiles.role` e `profiles.active`), nunca pelo `auth.role()`.

- Papéis existentes: `admin` e `superadmin`.
- Perfil **inativo** (`active = false`) perde o acesso mesmo mantendo `role` de admin.

## Módulos

Módulo é a unidade de permissão da navegação e das rotas. Estão definidos em `src/features/auth/permissions.ts`:

```
dashboard, animais, adocoes, eventos, noticias, produtos,
galeria, mensagens, voluntarios, configuracoes, usuarios, auditoria
```

## Matriz de Permissões

| Módulo | admin | superadmin |
| --- | --- | --- |
| dashboard | sim | sim |
| animais | sim | sim |
| adocoes | sim | sim |
| eventos | sim | sim |
| noticias | sim | sim |
| produtos | sim | sim |
| galeria | sim | sim |
| mensagens | sim | sim |
| voluntarios | sim | sim |
| configuracoes | sim | sim |
| usuarios | não | sim |
| auditoria | não | sim |

## Implementação

### `canAccessModule(module, profile)`

- Exige `profile.active === true`.
- `usuarios` e `auditoria` retornam `true` apenas para `superadmin`.
- Demais módulos retornam `true` para qualquer papel de admin ativo.

### `AdminRoute` (rota `/admin`)

Redireciona para `/admin/login` com uma razão legível no estado (`state.reason`):

- `no-access`: não autenticado.
- `expired`: sessão expirada (logado mas sem perfil).
- `inactive`: perfil desativado (`active = false`).
- Se o usuário está logado mas **não** é admin, `AdminRoute` chama `signOut()` para limpar a sessão antes de redirecionar.

A `LoginPage` exibe um aviso correspondente à razão recebida.

### `AdminModuleRoute`

Protege rotas de módulos específicos. Sem permissão, redireciona para `/admin/403` (página "Acesso negado") exibida dentro do layout do painel, mantendo o usuário autenticado.

## Camadas de Defesa (banco)

Mesmo com a UI protegida, o banco reforça a regra:

- `is_admin()` e `is_superadmin()` nas políticas RLS também exigem `profiles.active = TRUE`.
- Políticas de escrita (INSERT/UPDATE/DELETE) são restritas a admins; nenhuma ação administrativa depende de políticas anônimas.

## Como Tornar Alguém Superadmin

A aplicação não expõe essa operação. Execute no SQL Editor do Supabase:

```sql
UPDATE public.profiles
SET role = 'superadmin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com' LIMIT 1);
```

Para desativar um acesso (logout forçado na próxima navegação):

```sql
UPDATE public.profiles SET active = false WHERE id = '<id-do-usuario>';
```
