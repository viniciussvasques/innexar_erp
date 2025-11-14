# 🔌 Innexar ERP - API Reference

**Última atualização:** 13 de Novembro de 2025  
**Versão da API:** v1  
**Base URL (Dev):** `http://localhost:8000/api/v1/`  
**Base URL (Prod):** `https://api.innexar.app/api/v1/`

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Tenants (Multi-tenancy)](#tenants)
3. [CRM](#crm)
4. [Financeiro](#financeiro) 🚧
5. [Faturamento](#faturamento) 🚧
6. [Estoque](#estoque) 🚧
7. [Projetos](#projetos) 🚧
8. [Integrações](#integrações) 🚧
9. [i18n](#i18n)

**Legenda:**
- ✅ Implementado e testado
- 🟡 Implementado, pendente testes
- 🚧 Planejado, não implementado

---

## 🔐 Autenticação

### Headers obrigatórios

```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept-Language: en | pt-BR | es
```

### Registro de Tenant (Público)

**POST** `/public/tenants/`

Cria novo tenant (empresa) no sistema.

**Request:**
```json
{
  "name": "ACME Corporation",
  "schema_name": "acme",
  "plan": "professional",
  "admin_user": {
    "name": "John Doe",
    "email": "john@acme.com",
    "password": "Senha@123"
  }
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "ACME Corporation",
  "schema_name": "acme",
  "plan": "professional",
  "domains": [
    {
      "domain": "acme.localhost",
      "is_primary": true
    }
  ],
  "admin_user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@acme.com"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Status:** ✅ Implementado

---

### Login ✅

**POST** `/public/auth/login/`

Autentica usuário com email e senha. O sistema encontra automaticamente o tenant associado ao usuário através do email.

**Request:**
```json
{
  "email": "john@acme.com",
  "password": "Test@123"
}
```

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "john@acme.com",
    "username": "john",
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tenant": {
    "id": 1,
    "name": "ACME Corporation",
    "schema_name": "acme",
    "plan": "professional",
    "domain": "acme.localhost"
  }
}
```

**Uso do Access Token:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Status:** ✅ Implementado e testado

---

### Refresh Token ✅

**POST** `/public/auth/token/refresh/`

Renova o access token usando o refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."  
}
```

**Notas:**
- Access token expira em **1 hora**
- Refresh token expira em **7 dias**
- Refresh tokens são rotacionados (novo refresh token a cada renovação)

**Status:** ✅ Implementado e testado

---

### Registro de Usuário ✅

**POST** `/public/auth/register/`

Cria novo usuário no tenant atual.

**Request:**
```json
{
  "email": "user@acme.com",
  "username": "johndoe",
  "password": "Senha@123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+5511999999999"
}
```

**Response 201:**
```json
{
  "id": 3,
  "email": "user@acme.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+5511999999999",
  "is_active": true
}
```

**Validações:**
- Senha mínimo 8 caracteres
- Email único no sistema
- Username único no tenant

**Status:** ✅ Implementado e testado

---

### Perfil do Usuário Atual ✅

**GET** `/public/auth/me/`

Retorna informações do usuário autenticado.

**Headers:**
```http
Authorization: Bearer {access_token}
```

**Response 200:**
```json
{
  "id": 1,
  "email": "john@acme.com",
  "username": "john",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+5511999999999",
  "is_active": true
}
```

**Status:** ✅ Implementado e testado

---

### Alterar Senha ✅

**POST** `/public/auth/change-password/`

Permite usuário autenticado alterar sua senha.

**Headers:**
```http
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "old_password": "SenhaAntiga@123",
  "new_password": "SenhaNova@123"
}
```

**Response 200:**
```json
{
  "message": "Password changed successfully"
}
```

**Status:** ✅ Implementado

---

### Solicitar Recuperação de Senha 🟡

**POST** `/public/auth/password-reset/`

Envia email com link de recuperação de senha.

**Request:**
```json
{
  "email": "john@acme.com"
}
```

**Response 200:**
```json
{
  "message": "Password reset link sent to your email"
}
```

**Notas:**
- Email contém link: `{FRONTEND_URL}/reset-password/{uid}/{token}/`
- Token válido por 24 horas
- ⚠️ Requer configuração RESEND_API_KEY para envio de emails

**Status:** 🟡 Implementado, requer configuração de email

---

### Confirmar Recuperação de Senha 🟡

**POST** `/public/auth/password-reset/confirm/`

Confirma reset de senha com UID e token recebidos por email.

**Request:**
```json
{
  "uid": "MQ",
  "token": "cz7qu5-550613369a14fbb2352a389160856126",
  "new_password": "NovaSenha@123"
}
```

**Response 200:**
```json
{
  "message": "Password reset successfully"
}
```

**Status:** 🟡 Implementado

---

### Logout ✅

**POST** `/public/auth/logout/`

Adiciona refresh token à blacklist, invalidando-o.

**Headers:**
```http
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response 200:**
```json
{
  "message": "Logged out successfully"
}
```

**Notas:**
- O refresh token fica em blacklist permanentemente
- Access token continua válido até expirar (máx 1 hora)
- Frontend deve limpar tokens localmente também

**Status:** ✅ Implementado e testado

---

## 🏢 Tenants

### Listar Tenants (Admin)

**GET** `/public/tenants/`

**Response 200:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "ACME Corp",
      "schema_name": "acme",
      "plan": "professional",
      "is_active": true,
      "created_on": "2025-11-13T13:56:12.995545-05:00"
    }
  ]
}
```

**Status:** ✅ Implementado

---

### Verificar Disponibilidade de Subdomínio

**GET** `/public/tenants/check_subdomain/?subdomain=acme`

**Response 200:**
```json
{
  "subdomain": "acme",
  "available": false
}
```

**Status:** ✅ Implementado

---

## 👥 CRM

> **Nota:** Todos os endpoints CRM requerem autenticação e são específicos por tenant.

### **Leads**

#### Listar Leads

**GET** `/crm/leads/`

**Query Params:**
- `status`: new | contacted | qualified | converted | lost
- `source`: website | social | referral | ads | cold_call | event | other
- `owner`: ID do usuário
- `search`: busca por name, email, company
- `ordering`: score | created_at | updated_at

**Response 200:**
```json
{
  "count": 10,
  "next": "http://api.innexar.app/api/v1/crm/leads/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "company": "Example Corp",
      "position": "CEO",
      "source": "website",
      "status": "new",
      "score": 85,
      "notes": "Interested in Professional plan",
      "owner": 1,
      "owner_name": "admin",
      "created_at": "2025-11-13T15:30:00Z",
      "updated_at": "2025-11-13T15:30:00Z"
    }
  ]
}
```

**Status:** 🟡 Implementado (migrations OK, endpoint pendente teste HTTP)

---

#### Criar Lead

**POST** `/crm/leads/`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "company": "Example Corp",
  "position": "CEO",
  "source": "website",
  "status": "new",
  "notes": "Interested in Professional plan"
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "company": "Example Corp",
  "position": "CEO",
  "source": "website",
  "status": "new",
  "score": 0,
  "notes": "Interested in Professional plan",
  "owner": 1,
  "owner_name": "admin",
  "created_at": "2025-11-13T15:30:00Z",
  "updated_at": "2025-11-13T15:30:00Z"
}
```

**Status:** 🟡 Implementado

---

#### Converter Lead em Contact

**POST** `/crm/leads/{id}/convert/`

Converte um lead em contato. Atualiza o status do lead para "converted" e cria um novo contato com os dados do lead.

**Request:**
```json
{}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "company": "Example Corp",
  "position": "CEO",
  "is_customer": false,
  "converted_from_lead": 1,
  "converted_from_lead_name": "John Doe",
  "owner": 1,
  "owner_name": "admin",
  "created_at": "2025-11-13T15:35:00Z",
  "updated_at": "2025-11-13T15:35:00Z"
}
```

**Status:** 🟡 Implementado

---

### **Contacts**

#### Listar Contacts

**GET** `/crm/contacts/`

**Query Params:**
- `is_customer`: true | false
- `owner`: ID do usuário
- `search`: name, email, company

**Response 200:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "mobile": "+1-555-0101",
      "company": "Example Corp",
      "position": "CEO",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "@johndoe",
      "notes": "VIP customer",
      "tags": "vip,enterprise",
      "is_customer": true,
      "converted_from_lead": 1,
      "converted_from_lead_name": "John Doe",
      "owner": 1,
      "owner_name": "admin",
      "created_at": "2025-11-13T15:35:00Z",
      "updated_at": "2025-11-13T15:35:00Z"
    }
  ]
}
```

**Status:** 🟡 Implementado

---

#### Criar Contact

**POST** `/crm/contacts/`

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0200",
  "company": "Tech Startup",
  "position": "CTO",
  "is_customer": false
}
```

**Response 201:**
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0200",
  "company": "Tech Startup",
  "position": "CTO",
  "is_customer": false,
  "owner": 1,
  "owner_name": "admin",
  "created_at": "2025-11-13T15:40:00Z",
  "updated_at": "2025-11-13T15:40:00Z"
}
```

**Status:** 🟡 Implementado

---

### **Deals**

#### Listar Deals

**GET** `/crm/deals/`

**Query Params:**
- `stage`: prospecting | qualification | proposal | negotiation | closed_won | closed_lost
- `owner`: ID do usuário
- `contact`: ID do contato
- `search`: title, description, contact__name
- `ordering`: amount | expected_revenue | expected_close_date | created_at

**Response 200:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Professional Plan - Annual",
      "description": "Annual subscription",
      "amount": "948.00",
      "currency": "USD",
      "probability": 75,
      "expected_revenue": "711.00",
      "stage": "proposal",
      "contact": 1,
      "contact_name": "John Doe",
      "owner": 1,
      "owner_name": "admin",
      "expected_close_date": "2025-12-31",
      "actual_close_date": null,
      "created_at": "2025-11-13T15:45:00Z",
      "updated_at": "2025-11-13T15:45:00Z"
    }
  ]
}
```

**Status:** 🟡 Implementado

---

#### Criar Deal

**POST** `/crm/deals/`

**Request:**
```json
{
  "title": "Enterprise Plan - 3 Years",
  "description": "3-year contract with custom integration",
  "amount": 5700.00,
  "currency": "USD",
  "probability": 50,
  "stage": "qualification",
  "contact": 1,
  "expected_close_date": "2026-03-31"
}
```

**Response 201:**
```json
{
  "id": 2,
  "title": "Enterprise Plan - 3 Years",
  "description": "3-year contract with custom integration",
  "amount": "5700.00",
  "currency": "USD",
  "probability": 50,
  "expected_revenue": "2850.00",
  "stage": "qualification",
  "contact": 1,
  "contact_name": "John Doe",
  "owner": 1,
  "owner_name": "admin",
  "expected_close_date": "2026-03-31",
  "actual_close_date": null,
  "created_at": "2025-11-13T15:50:00Z",
  "updated_at": "2025-11-13T15:50:00Z"
}
```

**Status:** 🟡 Implementado

---

#### Pipeline Overview

**GET** `/crm/deals/pipeline/`

Retorna visão geral do funil de vendas com totais por estágio.

**Response 200:**
```json
[
  {
    "stage": "prospecting",
    "stage_name": "Prospecting",
    "count": 5,
    "total_amount": 12500.00,
    "total_expected_revenue": 6250.00
  },
  {
    "stage": "qualification",
    "stage_name": "Qualification",
    "count": 3,
    "total_amount": 8400.00,
    "total_expected_revenue": 5040.00
  },
  {
    "stage": "proposal",
    "stage_name": "Proposal",
    "count": 2,
    "total_amount": 15000.00,
    "total_expected_revenue": 11250.00
  },
  {
    "stage": "negotiation",
    "stage_name": "Negotiation",
    "count": 1,
    "total_amount": 25000.00,
    "total_expected_revenue": 22500.00
  },
  {
    "stage": "closed_won",
    "stage_name": "Closed Won",
    "count": 10,
    "total_amount": 125000.00,
    "total_expected_revenue": 125000.00
  },
  {
    "stage": "closed_lost",
    "stage_name": "Closed Lost",
    "count": 4,
    "total_amount": 0,
    "total_expected_revenue": 0
  }
]
```

**Status:** 🟡 Implementado

---

### **Activities**

#### Listar Activities

**GET** `/crm/activities/`

**Query Params:**
- `activity_type`: call | email | meeting | task | note | whatsapp
- `status`: planned | completed | canceled
- `owner`: ID do usuário
- `lead`: ID do lead
- `contact`: ID do contato
- `deal`: ID do deal
- `search`: subject, description
- `ordering`: scheduled_at | completed_at | created_at

**Response 200:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "activity_type": "meeting",
      "subject": "Product Demo",
      "description": "Schedule product demo for next week",
      "status": "planned",
      "lead": null,
      "lead_name": null,
      "contact": 1,
      "contact_name": "John Doe",
      "deal": 1,
      "deal_title": "Professional Plan - Annual",
      "owner": 1,
      "owner_name": "admin",
      "scheduled_at": "2025-11-20T14:00:00Z",
      "completed_at": null,
      "created_at": "2025-11-13T16:00:00Z",
      "updated_at": "2025-11-13T16:00:00Z"
    }
  ]
}
```

**Status:** 🟡 Implementado

---

#### Criar Activity

**POST** `/crm/activities/`

**Request:**
```json
{
  "activity_type": "call",
  "subject": "Follow-up call",
  "description": "Call to discuss proposal",
  "status": "planned",
  "contact": 1,
  "deal": 1,
  "scheduled_at": "2025-11-15T10:00:00Z"
}
```

**Validação:** Pelo menos um de `lead`, `contact` ou `deal` deve ser fornecido.

**Response 201:**
```json
{
  "id": 2,
  "activity_type": "call",
  "subject": "Follow-up call",
  "description": "Call to discuss proposal",
  "status": "planned",
  "contact": 1,
  "contact_name": "John Doe",
  "deal": 1,
  "deal_title": "Professional Plan - Annual",
  "owner": 1,
  "owner_name": "admin",
  "scheduled_at": "2025-11-15T10:00:00Z",
  "completed_at": null,
  "created_at": "2025-11-13T16:05:00Z",
  "updated_at": "2025-11-13T16:05:00Z"
}
```

**Status:** 🟡 Implementado

---

#### Completar Activity

**POST** `/crm/activities/{id}/complete/`

Marca uma atividade como completa e registra o timestamp.

**Request:**
```json
{}
```

**Response 200:**
```json
{
  "id": 2,
  "activity_type": "call",
  "subject": "Follow-up call",
  "status": "completed",
  "completed_at": "2025-11-13T16:10:00Z",
  "updated_at": "2025-11-13T16:10:00Z"
}
```

**Status:** 🟡 Implementado

---

## 💰 Financeiro

> **Status:** 🚧 Planejado

### Models Planejados

- **Account** - Conta contábil
- **Category** - Categoria de transação
- **BankAccount** - Conta bancária
- **Transaction** - Transação financeira
- **CashFlow** - Fluxo de caixa

### Endpoints Planejados

```
GET    /finance/accounts/
POST   /finance/accounts/
GET    /finance/accounts/{id}/
PUT    /finance/accounts/{id}/
DELETE /finance/accounts/{id}/

GET    /finance/transactions/
POST   /finance/transactions/
GET    /finance/transactions/{id}/
GET    /finance/transactions/cash-flow/

GET    /finance/bank-accounts/
POST   /finance/bank-accounts/
GET    /finance/bank-accounts/{id}/reconcile/
```

---

## 🧾 Faturamento

> **Status:** 🚧 Planejado

### Models Planejados

- **Invoice** - Nota fiscal/fatura
- **InvoiceItem** - Item da nota
- **Boleto** - Boleto bancário (Brasil)
- **Pix** - PIX (Brasil)
- **Subscription** - Assinatura recorrente

### Endpoints Planejados

```
GET    /invoicing/invoices/
POST   /invoicing/invoices/
GET    /invoicing/invoices/{id}/
POST   /invoicing/invoices/{id}/issue/
POST   /invoicing/invoices/{id}/cancel/
GET    /invoicing/invoices/{id}/pdf/

POST   /invoicing/boletos/
GET    /invoicing/boletos/{id}/
GET    /invoicing/boletos/{id}/pdf/

POST   /invoicing/pix/
GET    /invoicing/pix/{id}/qrcode/
```

---

## 📦 Estoque

> **Status:** 🚧 Planejado

### Models Planejados

- **Product** - Produto
- **Category** - Categoria de produto
- **StockMovement** - Movimentação de estoque
- **InventoryCount** - Contagem de inventário

### Endpoints Planejados

```
GET    /inventory/products/
POST   /inventory/products/
GET    /inventory/products/{id}/
PUT    /inventory/products/{id}/
DELETE /inventory/products/{id}/

GET    /inventory/stock-movements/
POST   /inventory/stock-movements/
GET    /inventory/products/{id}/stock/
```

---

## 📊 Projetos

> **Status:** 🚧 Planejado

### Models Planejados

- **Project** - Projeto
- **Task** - Tarefa
- **TimeEntry** - Apontamento de horas
- **Milestone** - Marco do projeto

### Endpoints Planejados

```
GET    /projects/
POST   /projects/
GET    /projects/{id}/
GET    /projects/{id}/tasks/
POST   /projects/{id}/tasks/

GET    /projects/tasks/{id}/
POST   /projects/tasks/{id}/time-entries/
GET    /projects/{id}/gantt/
```

---

## 🔗 Integrações

> **Status:** 🚧 Planejado

### QuickBooks Online

```
GET    /integrations/quickbooks/authorize/
GET    /integrations/quickbooks/callback/
POST   /integrations/quickbooks/sync/customers/
POST   /integrations/quickbooks/sync/invoices/
GET    /integrations/quickbooks/status/
```

### Stripe

```
POST   /integrations/stripe/webhooks/
GET    /integrations/stripe/payment-methods/
POST   /integrations/stripe/create-payment-intent/
```

### WhatsApp Business API

```
POST   /integrations/whatsapp/send/
POST   /integrations/whatsapp/webhooks/
GET    /integrations/whatsapp/templates/
```

### Open Banking (Brasil)

```
GET    /integrations/open-banking/authorize/
GET    /integrations/open-banking/accounts/
GET    /integrations/open-banking/transactions/
```

---

## 🌍 i18n (Internacionalização)

### Teste de Tradução

**GET** `/public/i18n/test/`

Endpoint de teste para validar traduções nos 3 idiomas suportados.

**Headers:**
```http
Accept-Language: pt-BR
```

**Response 200:**
```json
{
  "dashboard": "Painel de Controle",
  "crm": "CRM",
  "finance": "Financeiro",
  "invoicing": "Faturamento",
  "leads": "Leads",
  "contacts": "Contatos",
  "deals": "Negociações",
  "login": "Entrar",
  "logout": "Sair",
  "save": "Salvar",
  "cancel": "Cancelar",
  "success": "Sucesso",
  "error": "Erro",
  "today": "Hoje",
  "message": "Criado com sucesso"
}
```

**Idiomas suportados:**
- `en` - English (padrão)
- `pt-BR` - Português (Brasil)
- `es` - Español

**Status:** ✅ Implementado e testado

---

## 📝 Modelos TypeScript

### CRM Models

```typescript
// Lead
interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: 'website' | 'social' | 'referral' | 'ads' | 'cold_call' | 'event' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number; // 0-100
  notes?: string;
  owner: number;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

// Contact
interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  linkedin?: string;
  twitter?: string;
  notes?: string;
  tags?: string;
  is_customer: boolean;
  converted_from_lead?: number;
  converted_from_lead_name?: string;
  owner: number;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

// Deal
interface Deal {
  id: number;
  title: string;
  description?: string;
  amount: string; // Decimal as string
  currency: string;
  probability: number; // 0-100
  expected_revenue: string; // Calculated: amount * (probability/100)
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact: number;
  contact_name: string;
  owner: number;
  owner_name: string;
  expected_close_date?: string;
  actual_close_date?: string;
  created_at: string;
  updated_at: string;
}

// Activity
interface Activity {
  id: number;
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'whatsapp';
  subject: string;
  description?: string;
  status: 'planned' | 'completed' | 'canceled';
  lead?: number;
  lead_name?: string;
  contact?: number;
  contact_name?: string;
  deal?: number;
  deal_title?: string;
  owner: number;
  owner_name: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Pipeline Stage
interface PipelineStage {
  stage: string;
  stage_name: string;
  count: number;
  total_amount: number;
  total_expected_revenue: number;
}
```

### Tenant Models

```typescript
interface Tenant {
  id: number;
  name: string;
  schema_name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  is_active: boolean;
  created_on: string;
}

interface Domain {
  domain: string;
  is_primary: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  tenant: Tenant;
}

interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
```

---

## 🔧 Códigos de Erro HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 204 | No Content - Sucesso sem conteúdo |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error - Erro no servidor |

---

## 📚 Paginação

Todas as listagens retornam paginação no formato:

```json
{
  "count": 100,
  "next": "http://api.innexar.app/api/v1/crm/leads/?page=2",
  "previous": null,
  "results": [...]
}
```

**Query params:**
- `page`: Número da página
- `page_size`: Itens por página (padrão: 50, máx: 100)

---

## 🔍 Filtros e Busca

### Filtros

Use query params diretos:
```
GET /crm/leads/?status=new&source=website
```

### Busca (Search)

Campo especial `search`:
```
GET /crm/leads/?search=acme
```

Busca em múltiplos campos definidos por endpoint.

### Ordenação

Campo `ordering`:
```
GET /crm/leads/?ordering=-score,created_at
```

Prefixo `-` para ordem decrescente.

---

## 🎯 Próximas Implementações

**Prioridade Alta:**
1. ✅ CRM completo (implementado)
2. ✅ JWT Auth com email (implementado e testado)
3. 🚧 Endpoint /me para dados do usuário logado
4. 🚧 Módulo Financeiro
5. 🚧 Integração QuickBooks Online
6. 🚧 Módulo de Faturamento (NF-e Brasil)

**Prioridade Média:**
6. 🚧 Módulo de Estoque
7. 🚧 Integração WhatsApp Business API
8. 🚧 Módulo de Projetos
9. 🚧 Open Banking (Brasil)

**Prioridade Baixa:**
10. 🚧 BI & Analytics
11. 🚧 Portal do Cliente
12. 🚧 Automações com IA

---

## 📞 Suporte

**Documentação Swagger:** `http://localhost:8000/api/docs/`  
**Email:** dev@innexar.app  
**Repositório:** https://github.com/viniciussvasques/Innexar-erp

---

**🚀 Última atualização:** 13/Nov/2025 - **Login JWT com email implementado e testado!** ✅

**Credenciais de Teste:**
```
Email: john@acme.com
Senha: Test@123
```

**Tenant de Teste:**
- Nome: ACME Corp
- Schema: acme  
- Domain: acme.localhost
- Plan: professional
