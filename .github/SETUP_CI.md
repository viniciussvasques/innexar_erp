# Configuração de CI/CD - GitHub Actions

Este documento explica como configurar o CI/CD automático para o projeto Innexar ERP.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Token de acesso pessoal do GitHub (PAT)
3. Repositório Git configurado

## 🔑 Configuração do Token

### 1. Criar Token de Acesso Pessoal

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Configure:
   - **Note**: `Innexar ERP CI/CD`
   - **Expiration**: Escolha uma data (ou sem expiração)
   - **Scopes**: Marque pelo menos:
     - `repo` (acesso completo ao repositório)
     - `workflow` (atualizar workflows)
     - `write:packages` (se for usar GitHub Container Registry)

4. Clique em "Generate token"
5. **Copie o token** (você só verá ele uma vez!)

### 2. Configurar Secrets no Repositório

1. Vá para: `https://github.com/SEU_USUARIO/innexar_erp/settings/secrets/actions`
2. Clique em "New repository secret"
3. Adicione os seguintes secrets:

#### Secrets Obrigatórios:

- **`GITHUB_TOKEN`**: Seu token pessoal (ghp_...)
  - Este é usado automaticamente pelo GitHub Actions
  - Você pode usar o token fornecido ou criar um novo

#### Secrets Opcionais (para deploy):

- **`NEXT_PUBLIC_API_URL`**: URL da API em produção
  - Exemplo: `https://api.innexar.app/api/v1`

- **`DOCKER_USERNAME`**: Seu usuário Docker (se usar Docker Hub)
- **`DOCKER_PASSWORD`**: Senha do Docker

## 🚀 Configuração Inicial do Repositório

### 1. Inicializar Git (se ainda não foi feito)

```powershell
# Na raiz do projeto
git init
git add .
git commit -m "Initial commit: Setup CI/CD"
```

### 2. Adicionar Remote do GitHub

```powershell
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/innexar_erp.git

# Ou usando SSH (se configurado):
# git remote add origin git@github.com:SEU_USUARIO/innexar_erp.git
```

### 3. Configurar Branch Principal

```powershell
# Criar branch main (se não existir)
git branch -M main

# Ou usar develop como padrão
git branch -M develop
```

### 4. Fazer Push Inicial

```powershell
# Primeiro push
git push -u origin main

# Ou se usar develop:
git push -u origin develop
```

## ✅ Verificar Configuração

### 1. Verificar Workflows

1. Vá para: `https://github.com/SEU_USUARIO/innexar_erp/actions`
2. Você deve ver os workflows criados:
   - `Backend CI`
   - `Frontend CI`
   - `Admin Panel CI`
   - `CI - Full Stack`
   - `Deploy`

### 2. Testar CI

Faça um commit e push para testar:

```powershell
# Fazer uma mudança pequena
echo "# Test CI" >> README.md
git add README.md
git commit -m "test: Trigger CI workflow"
git push
```

### 3. Verificar Execução

1. Vá para a aba "Actions" no GitHub
2. Clique no workflow que está rodando
3. Verifique se todos os jobs passaram ✅

## 📝 Workflows Configurados

### 1. **Backend CI** (`.github/workflows/backend.yml`)
- Roda testes do Django
- Verifica migrations
- Executa linting (flake8, black)
- Usa PostgreSQL e Redis como serviços

### 2. **Frontend CI** (`.github/workflows/frontend.yml`)
- Instala dependências
- Roda linter
- Verifica tipos TypeScript
- Executa testes
- Faz build do Next.js

### 3. **Admin Panel CI** (`.github/workflows/admin-panel.yml`)
- Instala dependências
- Roda linter
- Faz build do Next.js

### 4. **CI - Full Stack** (`.github/workflows/ci.yml`)
- Executa todos os workflows acima em paralelo
- Roda em push e pull requests
- Pode ser executado manualmente

### 5. **Deploy** (`.github/workflows/deploy.yml`)
- Builda imagens Docker
- Faz deploy apenas na branch `main`
- Pode ser executado manualmente

## 🔧 Configurações Avançadas

### Branch Protection Rules

Para proteger a branch principal:

1. Vá para: `Settings` → `Branches`
2. Adicione uma regra para `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Selecione os workflows: `Backend Tests`, `Frontend Tests`, `Admin Panel Tests`

### Badges de Status

Adicione badges no README.md:

```markdown
![CI](https://github.com/SEU_USUARIO/innexar_erp/workflows/CI%20-%20Full%20Stack/badge.svg)
![Backend](https://github.com/SEU_USUARIO/innexar_erp/workflows/Backend%20CI/badge.svg)
![Frontend](https://github.com/SEU_USUARIO/innexar_erp/workflows/Frontend%20CI/badge.svg)
```

## 🐛 Troubleshooting

### Workflow não está rodando

1. Verifique se os arquivos estão na branch correta
2. Verifique se o caminho dos arquivos está correto no trigger
3. Veja os logs em `Actions` → `Workflow runs`

### Erro de autenticação

1. Verifique se o token está configurado corretamente
2. Verifique se o token tem as permissões necessárias
3. Gere um novo token se necessário

### Testes falhando

1. Verifique os logs do workflow
2. Execute os testes localmente primeiro
3. Verifique se as variáveis de ambiente estão configuradas

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

