# Testes do Painel Administrativo

## Comandos

```bash
npm test              # Vitest (uma execução)
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
npm run lint          # ESLint
npm run typecheck     # TypeScript (tsc --noEmit)
npm run build         # tsc -b && vite build
```

## Cobertura Atual

A suíte roda em `tests/` e cobre atualmente (20 testes em 4 arquivos):

- `animals-service.test.ts` — mocks do cliente Supabase e comportamento do serviço de animais.
- `format.test.ts` — formatação de datas, rótulos de status, espécie/porte/sexo.
- `responsive-picture.test.tsx` — renderização de imagem com fallback.
- `header.test.tsx` — comportamento do cabeçalho do portal.

## O que Validar no Admin (além da suíte automatizada)

Como o admin depende de Supabase autenticado, a validação de integração é manual (ver `VALIDACAO-VISUAL-ADMIN.md`). Roteiro de checagem funcional:

1. **Permissões**: perfil `admin` não vê Usuários/Auditoria no menu e é redirecionado a `/admin/403` ao acessar a rota diretamente.
2. **Perfil inativo**: `active = false` bloqueia o login e derruba sessões existentes.
3. **Ações destrutivas**: arquivar/excluir exigem `ConfirmDialog` e não executam no cancelamento.
4. **Auditoria**: publicar/destacar/arquivar/atualizar status/excluir geram registros em `audit_logs`.
5. **Regressão pública**: após interagir no admin, o portal não herda estilos nem comportamentos novos.

## Sugestões de Testes Futuros

- `permissions.test.ts`: matriz `canAccessModule` (admin vs superadmin, ativo vs inativo).
- `admin-header.test.tsx`: geração de breadcrumb e iniciais do avatar.
- `confirm-dialog.test.tsx`: renderização, foco, confirmação e cancelamento.
- `gallery-form.test.tsx`: geração de slug a partir do título.

## Padrões

- Testes usam Vitest + React Testing Library (configuração em `vite.config.ts` e `tests/setup.ts`).
- Dados de demonstração são isolados; componentes do admin não dependem de fallback para funcionar.
- Mantenha testes determinísticos: congele datas, mocke `supabase` e evite rede.
