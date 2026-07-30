# Casos de Uso

## Atores
- **Visitante**: Usuário não autenticado que navega pelo portal público
- **Administrador**: Usuário autenticado com papel `admin`
- **Superadmin**: Usuário autenticado com papel `superadmin`

## UC001 - Visualizar Animais
**Ator**: Visitante
**Pré-condição**: Nenhuma
**Fluxo principal**:
1. Visitante acessa a página de adoção
2. Sistema exibe lista de animais publicados e disponíveis
3. Visitante pode filtrar por espécie, sexo, porte
4. Visitante pode buscar por nome
**Fluxo alternativo**: Nenhum animal encontrado → exibe estado vazio
**Pós-condição**: Visitante visualiza cards dos animais

## UC002 - Enviar Interesse em Adoção
**Ator**: Visitante
**Pré-condição**: Animal selecionado
**Fluxo principal**:
1. Visitante acessa detalhes do animal
2. Clica em "Tenho interesse em adotar"
3. Preenche formulário com dados pessoais e informações sobre a residência
4. Aceita consentimento de privacidade
5. Envia formulário
**Fluxo alternativo**: Dados inválidos → exibe erros de validação
**Pós-condição**: Solicitação registrada com status "nova"

## UC003 - Gerenciar Animais (Admin)
**Ator**: Administrador
**Pré-condição**: Autenticado com papel admin ou superadmin
**Fluxo principal**:
1. Acessa painel → Animais
2. Visualiza lista de animais cadastrados
3. Pode cadastrar, editar, arquivar ou excluir animal
4. Faz upload de imagens
**Pós-condição**: Animal cadastrado/atualizado no banco

## UC004 - Gerenciar Perfis (Superadmin)
**Ator**: Superadmin
**Pré-condição**: Autenticado com papel superadmin
**Fluxo principal**:
1. Acessa painel → Usuários
2. Visualiza lista de administradores
3. Pode promover ou revogar privilégios
**Restrição**: Admin comum não pode acessar esta funcionalidade
**Pós-condição**: Perfil atualizado
