# Pendências de Conteúdo — SOS Focinho Carente

Documento consolidado (substitui os antigos `PENDENCIAS-CONTEUDO.md` e `PENDENCIAS-DE-CONTEUDO.md`).

## Conteúdo de demonstração já disponível

O projeto já conta com dados fictícios completos em `src/data/` (usados automaticamente em modo demonstração — `VITE_ENABLE_DEMO_AUTH=true`):

| Área | Status |
|------|--------|
| Animais para adoção (9 com foto, história, personalidade e saúde) | OK |
| Histórias individuais dos animais | OK |
| Eventos (5, com data, local e endereço) | OK |
| Notícias (5 publicadas) | OK |
| Produtos do brechó (4) | OK |
| Galeria (2 álbuns, 8 fotos) | OK |
| Chave PIX e titular | OK |
| E-mail, telefone, WhatsApp e endereço | OK |
| Redes sociais (Instagram, Facebook, YouTube) | OK |
| Missão e descrição institucional | OK |
| Fotos (em `public/images/demo/`) | OK |

## Pendências reais (substituir conteúdo de demonstração)

### Fotografias
- Substituir as fotos de demonstração por fotos reais dos animais e da ONG.
- Manter um retrato individual de cada animal disponível.
- Fotos dos voluntários, eventos e espaço de acolhimento.

### Dados da ONG
- Confirmar e substituir pelos dados reais: PIX, endereço, telefone, WhatsApp, e-mail e redes sociais.
- Informar horário de funcionamento.

### Equipe
- Cadastrar a equipe real (nomes e funções) no painel administrativo.

### Logotipo
- Substituir o logotipo ilustrado atual pelo logotipo oficial da ONG, se houver.

## Funcionalidades ainda não implementadas

- [ ] Pagamento online no brechó (checkout/carrinho)
- [ ] SEO/SSR (o site é uma SPA; pré-renderização recomendada)
- [ ] Dark mode
- [ ] Mais testes automatizados (principalmente no painel admin)
- [ ] Internacionalização
