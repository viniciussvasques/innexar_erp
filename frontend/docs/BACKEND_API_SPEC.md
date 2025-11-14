# 🔌 Backend API - Especificação para Frontend

## 📋 OVERVIEW

Este documento define **EXATAMENTE** como o backend Django vai funcionar e quais endpoints estarão disponíveis. Use isso para implementar o frontend sem precisar esperar o backend estar 100% pronto.

---

## 🌐 BASE URLs

### Estrutura de Domínios (innexar.app)

```
innexar.app                    → Site institucional (landing page, pricing, blog)
admin.innexar.app              → Painel administrativo (gerenciar todos tenants)
{tenant}.innexar.app           → Cada cliente (ex: acme.innexar.app)
api.innexar.app                → Backend API (produção)
```

**Exemplo de tenant:**

```
Tenant: ACME Corporation
Schema: acme
URL: https://acme.innexar.app
```

### URLs de Desenvolvimento

```
Backend:  http://localhost:8000
Frontend: http://localhost:3000
Tenant:   http://acme.localhost:3000
```

### URLs de Produção

```
Backend:  https://api.innexar.app

Frontend:
  Site Institucional:  https://innexar.app
  Painel Admin:        https://admin.innexar.app
  Cliente (tenant):    https://{tenant}.innexar.app
  Exemplo:             https://acme.innexar.app
```

---

## 🔐 AUTENTICAÇÃO

### Sistema: JWT com Refresh Tokens

**Headers obrigatórios em todas requests autenticadas:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept-Language: en | pt-BR | es
```

### 1. Register (Criar Tenant)

```http
POST /api/v1/public/tenants/
Content-Type: application/json

{
  "name": "ACME Corporation",
  "schema_name": "acme",          // Subdomínio (único)
  "plan": "professional",          // starter | professional | enterprise
  "admin_user": {
    "name": "John Doe",
    "email": "john@acme.com",
    "password": "Senha@123"
  }
}

Response 201:
{
  "id": 1,
  "name": "ACME Corporation",
  "schema_name": "acme",
  "plan": "professional",
  "domains": [
    {
      "domain": "acme.localhost",  // Dev
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

### 2. Login

```http
POST /api/v1/public/auth/login/
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "Senha@123"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",   // Expira 30min
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",  // Expira 7 dias
  "user": {
    "id": 1,
    "email": "john@acme.com",
    "name": "John Doe",
    "role": "admin",                         // admin | manager | user
    "tenant": {
      "id": 1,
      "name": "ACME Corporation",
      "schema_name": "acme",
      "plan": "professional",
      "is_active": true,
      "trial_ends_on": "2025-12-13"
    }
  }
}
```

### 3. Refresh Token

```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."  // Novo token
}
```

### 4. Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response 204 No Content
```

### 5. Esqueci Senha

```http
POST /api/v1/public/auth/password/reset/
Content-Type: application/json

{
  "email": "john@acme.com"
}

Response 200:
{
  "detail": "Password reset email sent"
}
```

### 6. Confirmar Nova Senha

```http
POST /api/v1/public/auth/password/reset/confirm/
Content-Type: application/json

{
  "uid": "MQ",
  "token": "abc123-def456",
  "new_password": "NovaSenha@123"
}

Response 200:
{
  "detail": "Password reset successful"
}
```

---

## 💼 CRM

### Models

```typescript
interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source: 'website' | 'social' | 'referral' | 'ads' | 'other'
  score: number // 0-100, calculado por IA
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  notes?: string
  tags: string[]
  assigned_to?: User
  created_at: string // ISO 8601
  updated_at: string
}

interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  created_at: string
}

interface Deal {
  id: number
  title: string
  contact: Contact
  value: string // Decimal como string
  currency: 'USD' | 'BRL' | 'MXN' | 'ARS' | 'CLP' | 'COP'
  stage: 'prospect' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number // 0-100
  expected_close_date?: string
  assigned_to?: User
  created_at: string
  updated_at: string
}

interface Activity {
  id: number
  type: 'call' | 'email' | 'meeting' | 'task'
  subject: string
  description?: string
  related_to_type: 'lead' | 'contact' | 'deal'
  related_to_id: number
  due_date?: string
  completed: boolean
  completed_at?: string
  assigned_to?: User
  created_at: string
}
```

### Endpoints

#### Leads

```http
# List
GET /api/v1/crm/leads/
Query params:
  - page=1
  - page_size=50
  - search=john
  - status=new,contacted
  - score_min=70
  - score_max=100
  - created_after=2025-01-01
  - created_before=2025-12-31
  - ordering=-score (- para desc)

Response 200:
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/crm/leads/?page=2",
  "previous": null,
  "results": [Lead, Lead, ...]
}

# Create
POST /api/v1/crm/leads/
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "source": "website",
  "notes": "Interessado em plano Professional"
}

Response 201: Lead

# Update
PATCH /api/v1/crm/leads/{id}/
{
  "status": "contacted",
  "score": 85
}

Response 200: Lead

# Delete
DELETE /api/v1/crm/leads/{id}/
Response 204 No Content

# Convert to Contact
POST /api/v1/crm/leads/{id}/convert/
Response 200:
{
  "contact": Contact,
  "deal": Deal
}

# Bulk Import
POST /api/v1/crm/leads/import/
Content-Type: multipart/form-data

file: leads.csv

Response 200:
{
  "imported": 45,
  "errors": [
    { "row": 12, "error": "Email já existe" }
  ]
}
```

#### Contacts

```http
# List
GET /api/v1/crm/contacts/
# Same query params as Leads

# CRUD operations similar to Leads
POST /api/v1/crm/contacts/
PATCH /api/v1/crm/contacts/{id}/
DELETE /api/v1/crm/contacts/{id}/
```

#### Deals

```http
# List
GET /api/v1/crm/deals/
Query params:
  - stage=prospect,proposal
  - value_min=1000
  - value_max=50000

Response 200: Paginated Deals

# Create
POST /api/v1/crm/deals/
{
  "title": "ACME Enterprise License",
  "contact_id": 123,
  "value": "25000.00",
  "currency": "USD",
  "stage": "proposal",
  "probability": 60,
  "expected_close_date": "2025-12-31"
}

# Update stage (drag & drop)
PATCH /api/v1/crm/deals/{id}/
{
  "stage": "negotiation",
  "probability": 80
}

# Won/Lost
POST /api/v1/crm/deals/{id}/mark_won/
POST /api/v1/crm/deals/{id}/mark_lost/
{
  "lost_reason": "Preço muito alto"
}
```

#### Activities

```http
# List
GET /api/v1/crm/activities/
Query params:
  - type=call,meeting
  - completed=false
  - due_before=2025-11-20

# Create
POST /api/v1/crm/activities/
{
  "type": "call",
  "subject": "Follow-up call",
  "description": "Discutir proposta",
  "related_to_type": "deal",
  "related_to_id": 456,
  "due_date": "2025-11-15T14:00:00Z"
}

# Complete
POST /api/v1/crm/activities/{id}/complete/
Response 200: Activity
```

---

## 💰 FINANCEIRO

### Models

```typescript
interface Account {
  id: number
  name: string
  type: 'receivable' | 'payable' // A receber | A pagar
  category: Category
  description: string
  amount: string // Decimal
  currency: 'USD' | 'BRL' | 'MXN'
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paid_at?: string
  payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'pix' | 'boleto'
  customer?: Contact
  vendor?: string
  invoice_id?: number
  notes?: string
  created_at: string
}

interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  parent?: Category
  color: string // Hex color
}

interface BankAccount {
  id: number
  name: string
  bank: string
  account_number: string
  agency?: string
  balance: string
  currency: 'USD' | 'BRL' | 'MXN'
  is_active: boolean
  plaid_account_id?: string // Open Banking
}

interface Transaction {
  id: number
  bank_account: BankAccount
  date: string
  description: string
  amount: string
  type: 'debit' | 'credit'
  category?: Category
  matched_account_id?: number // Link com Account
  reconciled: boolean
}
```

### Endpoints

#### Accounts (Contas a Pagar/Receber)

```http
# List
GET /api/v1/finance/accounts/
Query params:
  - type=receivable | payable
  - status=pending,overdue
  - due_after=2025-11-01
  - due_before=2025-11-30
  - category_id=5

Response 200: Paginated Accounts

# Create
POST /api/v1/finance/accounts/
{
  "type": "receivable",
  "category_id": 10,
  "description": "Consultoria Projeto X",
  "amount": "5000.00",
  "currency": "USD",
  "due_date": "2025-12-15",
  "customer_id": 123
}

# Mark as Paid
POST /api/v1/finance/accounts/{id}/mark_paid/
{
  "paid_at": "2025-11-13T10:00:00Z",
  "payment_method": "bank_transfer"
}

# Dashboard
GET /api/v1/finance/accounts/dashboard/
Response 200:
{
  "receivable_pending": "45000.00",
  "receivable_overdue": "12000.00",
  "payable_pending": "23000.00",
  "payable_overdue": "5000.00",
  "next_7_days": {
    "receivable": "8000.00",
    "payable": "15000.00"
  }
}
```

#### Categories

```http
GET /api/v1/finance/categories/
Response 200: [Category, ...]

POST /api/v1/finance/categories/
{
  "name": "Consultoria",
  "type": "income",
  "color": "#10b981"
}
```

#### Bank Accounts

```http
GET /api/v1/finance/bank-accounts/
POST /api/v1/finance/bank-accounts/
{
  "name": "Conta Corrente BB",
  "bank": "Banco do Brasil",
  "account_number": "12345-6",
  "agency": "1234",
  "currency": "BRL"
}

# Balance
GET /api/v1/finance/bank-accounts/{id}/balance/
Response 200:
{
  "balance": "125000.50",
  "currency": "BRL",
  "last_sync": "2025-11-13T09:00:00Z"
}
```

#### Transactions (Extrato)

```http
GET /api/v1/finance/transactions/
Query params:
  - bank_account_id=1
  - date_after=2025-11-01
  - reconciled=false

# Import OFX/CSV
POST /api/v1/finance/transactions/import/
Content-Type: multipart/form-data

file: extrato.ofx
bank_account_id: 1

Response 200:
{
  "imported": 87,
  "duplicates": 12
}

# Reconcile (match com Account)
POST /api/v1/finance/transactions/{id}/reconcile/
{
  "account_id": 456
}
```

#### Cash Flow

```http
GET /api/v1/finance/cash-flow/
Query params:
  - start_date=2025-11-01
  - end_date=2026-02-01
  - projection=true  # Incluir projeções

Response 200:
{
  "data": [
    {
      "date": "2025-11-01",
      "inflow": "12000.00",
      "outflow": "8500.00",
      "balance": "128500.00"
    },
    ...
  ],
  "projection": [
    {
      "date": "2025-12-01",
      "expected_inflow": "45000.00",
      "expected_outflow": "32000.00",
      "projected_balance": "141500.00"
    }
  ]
}
```

---

## 🧾 FATURAMENTO

### Models

```typescript
interface Invoice {
  id: number
  number: string // Auto-gerado: INV-2025-001
  customer: Contact
  issue_date: string
  due_date: string
  currency: 'USD' | 'BRL' | 'MXN'
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue'

  items: InvoiceItem[]

  subtotal: string
  discount: string
  tax: string
  total: string

  notes?: string
  payment_link?: string // Stripe link

  // Brasil
  nfe_number?: string
  nfe_key?: string
  nfe_xml_url?: string
  nfe_pdf_url?: string
  nfe_status?: 'pending' | 'authorized' | 'denied' | 'cancelled'

  // México
  cfdi_uuid?: string
  cfdi_xml_url?: string

  created_at: string
  updated_at: string
}

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unit_price: string
  discount: string
  tax_rate: number // % (ex: 18 para 18%)
  total: string
}

interface Boleto {
  id: number
  invoice: Invoice
  bank: 'bb' | 'itau' | 'bradesco' | 'sicredi'
  barcode: string
  digitableLine: string
  due_date: string
  amount: string
  pdf_url: string
  status: 'pending' | 'paid' | 'cancelled'
}

interface Pix {
  id: number
  invoice?: Invoice
  type: 'static' | 'dynamic'
  qr_code: string // Base64 image
  qr_code_text: string // Copy/paste
  amount?: string
  expires_at?: string
  paid_at?: string
}

interface Subscription {
  id: number
  customer: Contact
  plan: string
  amount: string
  currency: 'USD' | 'BRL' | 'MXN'
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  billing_day: number // 1-28
  status: 'active' | 'past_due' | 'cancelled' | 'paused'
  trial_ends_at?: string
  started_at: string
  next_billing_date: string
  stripe_subscription_id?: string
}
```

### Endpoints

#### Invoices

```http
# List
GET /api/v1/invoicing/invoices/
Query params:
  - status=issued,paid
  - customer_id=123
  - issue_date_after=2025-01-01

# Create
POST /api/v1/invoicing/invoices/
{
  "customer_id": 123,
  "issue_date": "2025-11-13",
  "due_date": "2025-12-13",
  "currency": "USD",
  "items": [
    {
      "description": "Web Development - 40h",
      "quantity": 40,
      "unit_price": "150.00",
      "tax_rate": 0
    },
    {
      "description": "Hosting - Monthly",
      "quantity": 1,
      "unit_price": "99.00",
      "tax_rate": 0
    }
  ],
  "notes": "Payment via bank transfer"
}

Response 201: Invoice

# Issue (gerar NF-e no Brasil)
POST /api/v1/invoicing/invoices/{id}/issue/
Response 200:
{
  ...invoice,
  "nfe_number": "000123",
  "nfe_key": "35251111222333000145550010001234561234567890",
  "nfe_xml_url": "https://...",
  "nfe_pdf_url": "https://..."
}

# Create Payment Link (Stripe)
POST /api/v1/invoicing/invoices/{id}/payment_link/
Response 200:
{
  "payment_link": "https://checkout.stripe.com/c/pay/cs_test_..."
}

# Cancel
POST /api/v1/invoicing/invoices/{id}/cancel/
{
  "reason": "Cliente cancelou pedido"
}
```

#### Boletos (Brasil)

```http
POST /api/v1/invoicing/boletos/
{
  "invoice_id": 456,
  "bank": "bb",
  "due_date": "2025-12-15",
  "amount": "5999.00"
}

Response 201:
{
  "id": 1,
  "barcode": "34191234567890123456789012345678901234567890",
  "digitableLine": "34191.23456 78901.234567 89012.345678 9 12345678901234",
  "pdf_url": "https://storage/boletos/12345.pdf",
  "status": "pending"
}

# Check Status (webhook do banco)
GET /api/v1/invoicing/boletos/{id}/
```

#### PIX (Brasil)

```http
# Generate
POST /api/v1/invoicing/pix/
{
  "type": "dynamic",
  "invoice_id": 456,
  "amount": "5999.00",
  "expires_in_hours": 24
}

Response 201:
{
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qr_code_text": "00020126580014br.gov.bcb.pix...",
  "expires_at": "2025-11-14T10:00:00Z"
}

# Webhook (pagamento recebido)
POST /webhooks/pix/
{
  "pix_id": 123,
  "paid_at": "2025-11-13T15:30:00Z",
  "amount": "5999.00"
}
```

#### Subscriptions

```http
# List
GET /api/v1/invoicing/subscriptions/
Query params:
  - status=active
  - customer_id=123

# Create
POST /api/v1/invoicing/subscriptions/
{
  "customer_id": 123,
  "plan": "Professional",
  "amount": "79.00",
  "currency": "USD",
  "billing_cycle": "monthly",
  "billing_day": 1,
  "trial_days": 14
}

# Cancel
POST /api/v1/invoicing/subscriptions/{id}/cancel/
{
  "cancel_at": "end_of_period"  # ou immediate
}
```

---

## 📦 ESTOQUE (Professional+)

### Models

```typescript
interface Product {
  id: number
  sku: string
  name: string
  description?: string
  category?: string
  unit: 'un' | 'kg' | 'l' | 'm'
  cost_price: string
  sale_price: string
  barcode?: string
  stock: number
  min_stock: number
  max_stock?: number
  is_active: boolean
}

interface StockMovement {
  id: number
  product: Product
  type: 'in' | 'out'
  quantity: number
  reason: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer'
  reference?: string // Ex: Invoice ID
  created_at: string
  created_by: User
}

interface Inventory {
  id: number
  date: string
  status: 'in_progress' | 'completed'
  items: InventoryItem[]
}

interface InventoryItem {
  product: Product
  expected_quantity: number
  actual_quantity: number
  difference: number
}
```

### Endpoints

```http
# Products
GET /api/v1/inventory/products/
POST /api/v1/inventory/products/
PATCH /api/v1/inventory/products/{id}/

# Low Stock Alert
GET /api/v1/inventory/products/low_stock/
Response 200:
[
  {
    product: Product,
    current_stock: 5,
    min_stock: 10,
    suggested_order: 20
  }
]

# Stock Movements
GET /api/v1/inventory/movements/
POST /api/v1/inventory/movements/
{
  "product_id": 123,
  "type": "in",
  "quantity": 50,
  "reason": "purchase"
}

# Inventory Count
POST /api/v1/inventory/inventories/
{
  "date": "2025-11-13"
}

POST /api/v1/inventory/inventories/{id}/items/
{
  "product_id": 123,
  "actual_quantity": 47
}

POST /api/v1/inventory/inventories/{id}/complete/
```

---

## 🏗️ PROJETOS

### Models

```typescript
interface Project {
  id: number
  name: string
  description?: string
  customer?: Contact
  start_date: string
  end_date?: string
  budget?: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  progress: number // 0-100
  tasks: Task[]
}

interface Task {
  id: number
  project: Project
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: User
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  position: number // Para ordenação no Kanban
  dependencies: number[] // IDs de tasks dependentes
}

interface TimeEntry {
  id: number
  task: Task
  user: User
  hours: number
  description?: string
  date: string
}
```

### Endpoints

```http
# Projects
GET /api/v1/projects/
POST /api/v1/projects/
{
  "name": "Website Redesign",
  "customer_id": 123,
  "start_date": "2025-11-15",
  "budget": "50000.00"
}

# Tasks
GET /api/v1/projects/{project_id}/tasks/
POST /api/v1/projects/{project_id}/tasks/
{
  "title": "Design homepage mockup",
  "status": "todo",
  "priority": "high",
  "assigned_to_id": 5,
  "due_date": "2025-11-20"
}

# Move task (Kanban)
PATCH /api/v1/projects/tasks/{id}/
{
  "status": "in_progress",
  "position": 2
}

# Time Tracking
POST /api/v1/projects/tasks/{id}/time-entries/
{
  "hours": 3.5,
  "description": "Created wireframes",
  "date": "2025-11-13"
}

# Gantt Data
GET /api/v1/projects/{id}/gantt/
Response 200:
{
  "tasks": [
    {
      "id": 1,
      "title": "Design",
      "start": "2025-11-15",
      "end": "2025-11-22",
      "progress": 0.6,
      "dependencies": []
    }
  ]
}
```

---

## ⚙️ CONFIGURAÇÕES & INTEGRAÇÕES

### QuickBooks

```http
# OAuth Flow
GET /api/v1/integrations/quickbooks/connect/
→ Redirect para QuickBooks OAuth

# Callback
GET /api/v1/integrations/quickbooks/callback/?code=xxx&realmId=yyy
→ Salva tokens, redirect para frontend

# Sync
POST /api/v1/integrations/quickbooks/sync/
{
  "sync_customers": true,
  "sync_invoices": true,
  "sync_vendors": true
}

Response 200:
{
  "synced_customers": 45,
  "synced_invoices": 123,
  "synced_vendors": 12
}

# Disconnect
DELETE /api/v1/integrations/quickbooks/disconnect/
```

### Stripe

```http
# Connect
POST /api/v1/integrations/stripe/connect/
{
  "publishable_key": "pk_test_...",
  "secret_key": "sk_test_..."
}

# Webhook
POST /webhooks/stripe/
Content-Type: application/json
Stripe-Signature: xxx

{
  "type": "invoice.paid",
  "data": { ... }
}
```

### WhatsApp

```http
# Connect
POST /api/v1/integrations/whatsapp/connect/
{
  "phone_number": "+5511999999999",
  "api_key": "xxx",
  "api_secret": "yyy"
}

# Send Template Message
POST /api/v1/integrations/whatsapp/send/
{
  "to": "+5511888888888",
  "template": "payment_reminder",
  "variables": {
    "customer_name": "João",
    "amount": "R$ 1.500,00"
  }
}
```

---

## 📊 ANALYTICS & REPORTS

```http
# Dashboard Geral
GET /api/v1/analytics/dashboard/
Query params:
  - period=7d | 30d | 90d | year | custom
  - start_date=2025-01-01
  - end_date=2025-11-13

Response 200:
{
  "sales": {
    "total": "125000.00",
    "change_percent": 12.5,
    "chart": [
      { "date": "2025-11-01", "value": "4500.00" },
      ...
    ]
  },
  "leads": {
    "total": 47,
    "new_today": 5,
    "conversion_rate": 23.5
  },
  "receivable": {
    "total": "45000.00",
    "overdue": "12000.00"
  }
}

# Relatório Customizado
POST /api/v1/analytics/reports/
{
  "type": "sales_by_product",
  "start_date": "2025-01-01",
  "end_date": "2025-11-13",
  "format": "pdf" | "excel" | "csv"
}

Response 200:
{
  "report_id": "abc123",
  "download_url": "https://storage/reports/abc123.pdf",
  "expires_at": "2025-11-14T10:00:00Z"
}
```

---

## 🌍 INTERNACIONALIZAÇÃO

### Detectar Idioma

```http
# Frontend envia Accept-Language
GET /api/v1/crm/leads/
Headers:
  Accept-Language: pt-BR

# Backend responde com mensagens traduzidas
Response 400:
{
  "email": ["Este campo é obrigatório."],
  "name": ["Certifique-se de que este campo não tenha mais de 100 caracteres."]
}
```

### Formatar Valores

```http
# Moeda por tenant
GET /api/v1/finance/accounts/
Response 200:
{
  "results": [
    {
      "amount": "5000.00",
      "currency": "USD",
      "formatted": "$5,000.00"     # Se locale=en
      "formatted": "R$ 5.000,00"   # Se locale=pt-BR
    }
  ]
}
```

---

## 🔔 WEBHOOKS

```http
# Registrar Webhook
POST /api/v1/webhooks/
{
  "url": "https://myapp.com/webhooks/innexar",
  "events": ["invoice.paid", "lead.created", "subscription.cancelled"],
  "secret": "webhook_secret_123"
}

# Formato do Webhook
POST https://myapp.com/webhooks/innexar
Headers:
  X-Innexar-Signature: sha256=xxx
  Content-Type: application/json

{
  "event": "invoice.paid",
  "tenant_id": 1,
  "data": {
    "invoice_id": 456,
    "amount": "5999.00",
    "paid_at": "2025-11-13T15:30:00Z"
  },
  "created_at": "2025-11-13T15:30:05Z"
}
```

---

## ❌ TRATAMENTO DE ERROS

```http
# 400 Bad Request
{
  "email": ["Este campo é obrigatório."],
  "amount": ["Certifique-se de que este valor seja maior que 0."]
}

# 401 Unauthorized
{
  "detail": "Token inválido ou expirado"
}

# 403 Forbidden
{
  "detail": "Você não tem permissão para executar esta ação."
}

# 404 Not Found
{
  "detail": "Não encontrado."
}

# 429 Too Many Requests
{
  "detail": "Limite de requisições excedido. Tente novamente em 60 segundos."
}

# 500 Internal Server Error
{
  "detail": "Erro interno do servidor. Nossa equipe foi notificada."
}
```

---

## 🎯 STATUS DE DESENVOLVIMENTO

### ✅ Já Implementado

- Tenant multi-tenancy
- Autenticação JWT
- CRM: Tenants, Domains

### 🟡 Em Desenvolvimento (Você vai fazer)

- CRM: Leads, Contacts, Deals, Activities
- Financeiro: Accounts, Categories, Cash Flow
- Faturamento: Invoices, Boletos, PIX
- Integrações: QuickBooks, Stripe
- i18n completo

### 🔴 Planejado (depois)

- Estoque completo
- Projetos Gantt
- Atendimento chat real-time
- WhatsApp chatbot IA

---

## 📞 MOCKUP SERVER (Para começar frontend AGORA)

Se quiser começar frontend antes do backend ficar pronto, use **JSON Server**:

```bash
npm install -g json-server
json-server --watch db.json --port 8000
```

```json
// db.json
{
  "leads": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "score": 85,
      "status": "new"
    }
  ],
  "invoices": [
    {
      "id": 1,
      "number": "INV-2025-001",
      "total": "5999.00",
      "status": "issued"
    }
  ]
}
```

Depois só trocar a URL base! 🚀
