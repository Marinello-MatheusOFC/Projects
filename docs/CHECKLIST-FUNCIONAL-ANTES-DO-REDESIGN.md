# Checklist Funcional — Pré-Redesign

## Funcionalidades Implementadas

### Páginas Públicas
- [x] Home Page (com seções hero, destaques, missão, formas de ajudar, CTA)
- [x] Adoção (com filtros por nome, espécie, sexo, porte)
- [x] Detalhe do Animal (com formulário de adoção em modal)
- [x] Processo de Adoção (timeline das etapas)
- [x] Sobre Nós (história, valores, áreas de atuação)
- [x] Voluntariado (formulário de cadastro)
- [x] Contato (formulário com validação, honeypot)
- [x] Como Ajudar (categorias de contribuição)

### Páginas Públicas (vazias — apenas esqueleto)
- [ ] Eventos (lista)
- [ ] Detalhe do Evento
- [ ] Notícias (lista)
- [ ] Detalhe da Notícia
- [ ] Brechó (lista)
- [ ] Detalhe do Produto
- [ ] Galeria

### Páginas Admin
- [x] Login (autenticação Supabase)
- [x] Dashboard (cards indicadores estáticos)
- [x] Animais (lista com busca)
- [x] Animais (formulário de cadastro/edição completo)
- [ ] Adoções (funcionalidade em desenvolvimento)
- [ ] Eventos (funcionalidade em desenvolvimento)
- [ ] Eventos (formulário em desenvolvimento)
- [ ] Notícias (funcionalidade em desenvolvimento)
- [ ] Notícias (formulário em desenvolvimento)
- [ ] Brechó (funcionalidade em desenvolvimento)
- [ ] Brechó (formulário em desenvolvimento)
- [ ] Mensagens (funcionalidade em desenvolvimento)
- [ ] Voluntários (funcionalidade em desenvolvimento)
- [ ] Configurações (funcionalidade em desenvolvimento)
- [ ] Usuários (funcionalidade em desenvolvimento)

### Funcionalidades Transversais
- [x] Autenticação com Supabase
- [x] Proteção de rotas admin
- [x] Layout público com Header e Footer
- [x] Layout admin com Sidebar collapsible
- [x] Validação de formulários (React Hook Form + Zod)
- [x] Feedback visual (Alert, Toast, EmptyState, ErrorState, Skeleton)
- [x] Modal com gerenciamento de foco e teclado

### Pendências Funcionais (pós-redesign)
- [ ] Upload de imagens (animais, eventos, notícias, produtos)
- [ ] CRUD completo de animais
- [ ] CRUD completo de eventos
- [ ] CRUD completo de notícias
- [ ] CRUD completo de produtos
- [ ] Gerenciamento de adoções (listagem, aprovação/rejeição)
- [ ] Gerenciamento de mensagens de contato
- [ ] Gerenciamento de voluntários
- [ ] Gerenciamento de usuários
- [ ] Configurações da ONG (dados institucionais, chave Pix, etc.)
- [ ] Galeria de imagens com upload
- [ ] Responsividade completa em todas as páginas
- [ ] Páginas de erro customizadas (404, 403, 500)
