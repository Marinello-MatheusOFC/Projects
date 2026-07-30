# Testes

## Estratégia

- **Testes unitários**: Schemas Zod, formatadores, labels, componentes isolados
- **Testes de integração**: Fluxos completos (autenticação, formulários, CRUD)
- **Testes de acessibilidade**: Navegação por teclado, roles ARIA

## Comandos

```bash
npm test            # Executa testes
npm run test:watch  # Modo watch
npm run test:coverage # Relatório de cobertura
```

## Cobertura

A ser medida após implementação dos testes. As metas são:
- Unitários: > 80%
- Integração: Fluxos críticos cobertos

## Cenários a testar

### Schemas Zod
- Validação de campos obrigatórios
- Validação de formatos (email, telefone)
- Validação de consentimento
- Mensagens de erro em português

### Formatadores
- `formatCurrency`: Formato BRL
- `formatDate`: Formato pt-BR
- `slugify`: Remoção de acentos, substituição de espaços

### Componentes
- `Button`: Loading state, disabled
- `Modal`: Abertura, fechamento, foco, tecla Escape
- `EmptyState`: Renderização com título, descrição e ação
- `ErrorState`: Renderização com mensagem e retry

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

- [ ] Implementar testes unitários
- [ ] Implementar testes de integração
- [ ] Configurar cobertura mínima
- [ ] Adicionar testes de acessibilidade
- [ ] Executar em CI
