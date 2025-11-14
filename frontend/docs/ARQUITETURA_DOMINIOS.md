# 🌐 Arquitetura de Domínios - Innexar ERP

## 📋 Estrutura de Domínios

### Domínios Principais

```
innexar.app                    → Site institucional
  ├── Landing page
  ├── Pricing
  ├── Blog
  └── Cadastro de novos tenants (register)

admin.innexar.app              → Painel administrativo
  └── Gerenciar todos os tenants

{tenant}.innexar.app           → Aplicação ERP de cada cliente
  ├── Login (apenas)
  ├── Dashboard
  ├── CRM
  ├── Financeiro
  └── ... (módulos do ERP)
```

## 🔐 Fluxo de Cadastro

### 1. Usuário acessa site institucional

```
https://innexar.app/register
```

### 2. Preenche formulário de cadastro

- Nome da empresa
- Subdomínio desejado
- Dados do administrador
- Plano escolhido

### 3. Backend cria tenant

- Cria schema no banco
- Cria usuário admin
- Retorna tokens JWT

### 4. Redirecionamento

```
Após cadastro → https://{tenant}.innexar.app/dashboard
```

## 🚫 O que NÃO existe na aplicação tenant

- ❌ Página de registro (`/register`)
- ❌ Formulário de cadastro
- ❌ Criação de novos tenants

## ✅ O que existe na aplicação tenant

- ✅ Página de login (`/login`)
- ✅ Link para cadastro no site institucional
- ✅ Todas as funcionalidades do ERP

## 🔄 Fluxo de Login

### Na aplicação tenant (`{tenant}.innexar.app`)

1. Usuário acessa `https://acme.innexar.app/login`
2. Faz login com email/senha
3. É redirecionado para `/dashboard`
4. Se não tem conta, vê link para `https://innexar.app/register`

## 📝 Notas de Implementação

### Frontend Tenant

- Remover página `/register`
- Manter apenas `/login`
- Adicionar link para site institucional quando necessário

### Frontend Site Institucional (futuro)

- Criar página `/register` completa
- Integrar com API de criação de tenants
- Redirecionar após cadastro bem-sucedido

### Backend

- Endpoint público: `POST /api/v1/public/tenants/`
- Usado apenas pelo site institucional
- Não deve estar acessível de `{tenant}.innexar.app`
