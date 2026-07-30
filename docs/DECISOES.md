# Decisões de Projeto

Este documento registra as principais decisões técnicas e de design, alternativas consideradas e justificativas.

## 1. Framework e Build

| Decisão | Opção | Justificativa |
|---------|-------|---------------|
| Bundler | Vite | Mais rápido que CRA, suporte nativo a TypeScript e HMR |
| Linguagem | TypeScript strict | Maior segurança de tipos e documentação embutida |
| Roteamento | React Router v7 | Padrão da comunidade, suporte a layouts aninhados |
| CSS | CSS global + tokens | Simplicidade, sem dependência extra, fácil manutenção |
| State async | TanStack Query | Cache, retry, loading states prontos |
| Formulários | React Hook Form + Zod | Performance e validação declarativa |
| Ícones | Lucide React | Leve, tree-shakeable, acessível |

## 2. Arquitetura

| Decisão | Opção | Justificativa |
|---------|-------|---------------|
| Auth | Supabase Auth + Context | Sem dependência extra, integração direta |
| Autorização | RLS no PostgreSQL | Segurança em nível de banco, não confia apenas no cliente |
| Storage | Supabase Storage | Integração nativa com RLS |
| Estado global | Não utilizado | Escopo não exige; Context + TanStack Query é suficiente |

## 3. Estrutura

| Decisão | Opção | Justificativa |
|---------|-------|---------------|
| Organização | Feature-based | Cada domínio concentra seus componentes, hooks e tipos |
| Páginas | Separadas por público/admin/erro | Clareza de responsabilidade |
| Componentes | Atômicos (ui/) e compostos (features/) | Reutilização e separação de concerns |

## 4. Banco de Dados

| Decisão | Opção | Justificativa |
|---------|-------|---------------|
| Chaves primárias | UUID | Segurança (não expõe sequenciais) e distribuição |
| Timestamps | TIMESTAMPTZ | Fuso horário consistente |
| Exclusão | Lógica (deleted_at) | Rastreabilidade e recuperação |
| Idade animal | Data estimada + texto livre | Precisão vs flexibilidade |

## 5. Segurança

| Decisão | Opção | Justificativa |
|---------|-------|---------------|
| Chaves no frontend | Apenas anon key | Service role key nunca no cliente |
| Validação | Cliente + RLS | Dupla camada de proteção |
| Autenticação como admin | Verificação em profiles | Não confiar em auth.role() |
| Consentimento | Checkbox obrigatório | LGPD - base legal para tratamento |

## 6. Pendências que exigem decisão da ONG

- Chave Pix oficial para doações
- Endereço e telefone da ONG
- Membros da equipe autorizados
- Depoimentos reais
- Estatísticas institucionais
- Documentos de prestação de contas
- Etapas confirmadas do processo de adoção
- Política de privacidade oficial
- Termo de adoção oficial
