# Testes

## Estratégia

- **Testes unitários**: Helpers de formatação, serviços com fallback local, componentes isolados
- **Testes de componentes**: Drawer acessível do Header, fallback do ResponsivePicture
- **Testes de integração**: Serviços contra o Supabase (backend off → fallback de demonstração)

## Comandos

```bash
npm test               # Executa testes (vitest run)
npm run test:watch     # Modo watch
npm run test:coverage  # Relatório de cobertura
```

## Suíte Atual (20 testes em 4 arquivos)

| Arquivo | O que cobre |
|---------|-------------|
| `tests/format.test.ts` | `speciesLabel`, `sexLabel`, `sizeLabel`, `animalStatusLabel`, `animalCardMeta`, `formatDate`, `formatShortDate`, `formatPrice`, `slugify` |
| `tests/animals-service.test.ts` | `fetchAnimals`, `fetchAdoptableAnimals`, `fetchFeaturedAnimals`, `fetchAnimalBySlug` com backend indisponível (fallback para dados de demonstração) |
| `tests/responsive-picture.test.tsx` | Fallback contextual (src vazio) e renderização de `<img>` com src válido |
| `tests/header.test.tsx` | Abertura/fechamento do drawer móvel, fechamento com Escape, navegação principal |

## Padrões

- Testes usam `@testing-library/react` + `@testing-library/jest-dom` + `vitest` (globals habilitadas, ambiente jsdom)
- Serviços são testados com `vi.mock('@/lib/supabase')` para simular backend indisponível e validar o fallback local
- Componentes que dependem de roteamento usam `<MemoryRouter>`

## Cenários a adicionar

### Schemas Zod
- Validação de campos obrigatórios
- Validação de formatos (email, telefone)
- Validação de consentimento
- Mensagens de erro em português

### Formulários
- Envio com dados válidos
- Exibição de erros de validação
- Estados de loading, sucesso e erro
- Prevenção de duplo clique

### Listas e Filtros
- Empty state
- Loading state
- Error state com retry
- Filtros na URL

## Pendências

- [ ] Cobrir schemas Zod dos formulários
- [ ] Testes de integração dos fluxos de adoção/contato/voluntariado
- [ ] Configurar cobertura mínima
- [ ] Testes de acessibilidade automatizados (axe)
- [ ] Executar em CI
