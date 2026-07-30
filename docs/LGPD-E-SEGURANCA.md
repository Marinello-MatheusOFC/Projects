# LGPD e Segurança

## Dados Coletados

### Formulário de Contato
- Nome
- E-mail
- Telefone (opcional)
- Assunto
- Mensagem

**Finalidade**: Responder à solicitação do usuário
**Base legal**: Consentimento (Art. 7º, I - LGPD)
**Quem acessa**: Administradores da ONG
**Retenção**: Até solicitação de exclusão ou 12 meses após última interação

### Formulário de Adoção
- Nome completo
- E-mail
- Telefone
- Cidade
- Tipo de residência
- Informações sobre o ambiente

**Finalidade**: Processo de adoção responsável
**Base legal**: Consentimento (Art. 7º, I - LGPD)
**Quem acessa**: Administradores da ONG
**Retenção**: 5 anos após conclusão do processo

### Formulário de Voluntariado
- Nome
- E-mail
- Telefone
- Cidade
- Disponibilidade
- Áreas de interesse

**Finalidade**: Cadastro de voluntários
**Base legal**: Consentimento (Art. 7º, I - LGPD)
**Quem acessa**: Administradores da ONG
**Retenção**: Até solicitação de exclusão

## Medidas Implementadas

### Técnicas
- RLS (Row Level Security) em todas as tabelas
- Validação de dados no cliente (Zod) e no servidor (RLS)
- Honeypot antispam no formulário de contato
- Sem logging de dados pessoais
- Sem chaves secretas no frontend
- CSP configurável no deploy
- Sessões com token JWT gerenciadas pelo Supabase Auth

### Organizacionais
- Acesso administrativo restrito por papel (admin/superadmin)
- Registro de auditoria para ações críticas
- Consentimento explícito registrado em banco

## Pendências (dependentes da ONG)

- [ ] Política de privacidade oficial redigida e aprovada
- [ ] Definição do tempo de retenção específico para cada tipo de dado
- [ ] Processo formal de correção ou exclusão de dados pessoais
- [ ] Designação de encarregado (DPO)
- [ ] Registro na ANPD (quando aplicável)
- [ ] Termo de uso oficial

## Riscos

1. Ausência de política de privacidade oficial publicada
2. Dados armazenados em servidores externos (Supabase - verificar localização)
3. Consentimento não é renovado periodicamente
4. Sem criptografia adicional para dados em repouso (depende do Supabase)
