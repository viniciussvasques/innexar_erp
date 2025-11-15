# 📦 Módulos e Funções Implementadas - Innexar ERP

**Última atualização:** 2025-11-14  
**Versão:** 1.1.0

---

## 📋 Índice

1. [Módulos do Backend](#módulos-do-backend)
2. [Módulos do Frontend](#módulos-do-frontend)
3. [Módulos do Admin Panel](#módulos-do-admin-panel)
4. [Funcionalidades por Módulo](#funcionalidades-por-módulo)

---

## 🔧 Módulos do Backend

### 1. **apps.users** - Gerenciamento de Usuários e Permissões

#### Modelos

- **User** (extends AbstractUser)

  - Campos: `email`, `first_name`, `last_name`, `default_tenant`, `is_active`, `is_staff`, `is_superuser`
  - Campos adicionais: `phone`, `avatar`, `discount_limit_percent`
  - Relacionamentos:
    - ForeignKey com `Tenant` (default_tenant)
    - ManyToMany com `Role` (roles)
  - Métodos: `has_module_permission()`, `can_apply_discount()`, `get_accessible_warehouses()`

- **Role** - Função/Cargo dentro da empresa

  - Campos: `name`, `code`, `description`, `is_active`
  - Exemplos: Administrator, Sales Manager, Seller, Warehouse Manager, Picker, Financial Analyst, HR Manager

- **Module** - Módulo do ERP

  - Campos: `code`, `name`, `description`, `icon`, `order`, `is_active`
  - Módulos: users, crm, sales, warehouse, logistics, invoicing, hr, products, pricing, customer_portal

- **Permission** - Permissão de acesso a módulo
  - Campos: `role`, `module`, `level` (none, view, create, edit, delete, admin)
  - Define o nível de acesso de uma Role a um Module

#### Views e Funções

- **CustomTokenObtainPairView** - Login com email/password
  - Retorna JWT tokens + informações do usuário e tenant
  - Auto-detecta tenant do usuário
- **register** - Registro de novo usuário
  - Criação de conta com validação de email
- **me** - Obter informações do usuário autenticado
  - Retorna dados completos do usuário logado
- **change_password** - Alterar senha do usuário autenticado
  - Validação de senha antiga e nova
- **password_reset_request** - Solicitar reset de senha
  - Envia email com link de reset
- **password_reset_confirm** - Confirmar reset de senha
  - Valida token e define nova senha
- **logout** - Logout do usuário
  - Blacklist do refresh token
- **RoleViewSet** - CRUD de roles
- **ModuleViewSet** - Listar módulos (read-only)
- **PermissionViewSet** - CRUD de permissões
- **UserViewSet** - CRUD de usuários
  - `assign_roles` - Atribuir roles a usuário
  - `permissions` - Ver permissões do usuário

#### Endpoints

**Autenticação:**

- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/logout/` - Logout
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/token/refresh/` - Refresh token
- `GET /api/v1/auth/me/` - Dados do usuário
- `POST /api/v1/auth/change-password/` - Alterar senha
- `POST /api/v1/auth/password-reset/` - Solicitar reset
- `POST /api/v1/auth/password-reset/confirm/` - Confirmar reset

**Roles e Permissions:**

- `GET /api/v1/auth/roles/` - Listar roles
- `POST /api/v1/auth/roles/` - Criar role
- `GET /api/v1/auth/roles/{id}/` - Detalhes da role
- `PUT /api/v1/auth/roles/{id}/` - Atualizar role
- `DELETE /api/v1/auth/roles/{id}/` - Deletar role
- `GET /api/v1/auth/modules/` - Listar módulos
- `GET /api/v1/auth/permissions/` - Listar permissões
- `POST /api/v1/auth/permissions/` - Criar permissão
- `GET /api/v1/auth/users/` - Listar usuários
- `POST /api/v1/auth/users/` - Criar usuário
- `GET /api/v1/auth/users/{id}/` - Detalhes do usuário
- `POST /api/v1/auth/users/{id}/assign_roles/` - Atribuir roles
- `GET /api/v1/auth/users/{id}/permissions/` - Ver permissões do usuário

---

### 2. **apps.tenants** - Multi-Tenancy

#### Modelos

- **Tenant** (TenantMixin)
  - Campos: `name`, `schema_name`, `stripe_customer_id`, `stripe_subscription_id`, `plan`, `max_users`, `max_storage_mb`, `is_active`, `trial_ends_on`
  - Planos: `free`, `starter`, `professional`, `enterprise`
  - Auto-criação de schema PostgreSQL
- **Domain** (DomainMixin)
  - Campos: `domain`, `tenant`, `is_primary`
  - Relacionamento com Tenant

#### Views e Funções

- **TenantViewSet** - CRUD de tenants
  - `check_subdomain` - Verificar disponibilidade de subdomínio
  - `create` - Criar novo tenant (público)
- **DomainViewSet** - Gerenciamento de domínios
  - Read-only para listar domínios
- **I18nTestViewSet** - Teste de internacionalização
  - `test` - Retorna traduções baseadas em Accept-Language header

#### Endpoints

- `GET /api/v1/public/tenants/` - Listar tenants
- `POST /api/v1/public/tenants/` - Criar tenant
- `GET /api/v1/public/tenants/{id}/` - Detalhes do tenant
- `PUT /api/v1/public/tenants/{id}/` - Atualizar tenant
- `DELETE /api/v1/public/tenants/{id}/` - Deletar tenant
- `GET /api/v1/public/tenants/check-subdomain/?subdomain=xxx` - Verificar subdomínio
- `GET /api/v1/public/domains/` - Listar domínios
- `GET /api/v1/public/i18n/test/` - Teste de traduções

---

### 3. **apps.crm** - Customer Relationship Management

#### Modelos

- **Lead** - Prospecção
  - Campos: `name`, `email`, `phone`, `company`, `position`, `source`, `status`, `score`, `notes`, `owner`
  - Status: `new`, `contacted`, `qualified`, `converted`, `lost`
  - Source: `website`, `social`, `referral`, `ads`, `cold_call`, `event`, `other`
  - Score: 0-100 (calculado por IA)
- **Contact** - Contatos
  - Campos: `name`, `email`, `phone`, `mobile`, `company`, `position`, `address`, `city`, `state`, `country`, `zip_code`, `linkedin`, `twitter`, `notes`, `tags`, `is_customer`, `converted_from_lead`, `owner`
  - Relacionamento: ForeignKey com Lead (opcional)
- **Deal** - Oportunidades de Venda
  - Campos: `title`, `description`, `amount`, `currency`, `probability`, `expected_revenue`, `stage`, `contact`, `owner`, `expected_close_date`, `actual_close_date`
  - Stages: `prospecting`, `qualification`, `proposal`, `negotiation`, `closed_won`, `closed_lost`
  - Auto-cálculo: `expected_revenue = amount × (probability / 100)`
- **Activity** - Atividades do CRM
  - Campos: `activity_type`, `subject`, `description`, `status`, `lead`, `contact`, `deal`, `owner`, `scheduled_at`, `completed_at`
  - Types: `call`, `email`, `meeting`, `task`, `note`, `whatsapp`
  - Status: `planned`, `completed`, `canceled`

#### Views e Funções

- **LeadViewSet** - CRUD de leads
  - `convert` - Converter lead em contato
  - Filtros: `status`, `source`, `owner`
  - Busca: `name`, `email`, `company`
  - Ordenação: `score`, `created_at`, `updated_at`
- **ContactViewSet** - CRUD de contatos
  - Filtros: `is_customer`, `owner`
  - Busca: `name`, `email`, `company`
- **DealViewSet** - CRUD de deals
  - `pipeline` - Visão geral do pipeline por stage
  - Filtros: `stage`, `owner`, `contact`
  - Busca: `title`, `description`, `contact__name`
- **ActivityViewSet** - CRUD de atividades
  - `complete` - Marcar atividade como concluída
  - Filtros: `activity_type`, `status`, `owner`, `lead`, `contact`, `deal`

#### Endpoints

- `GET /api/v1/crm/leads/` - Listar leads
- `POST /api/v1/crm/leads/` - Criar lead
- `GET /api/v1/crm/leads/{id}/` - Detalhes do lead
- `PUT /api/v1/crm/leads/{id}/` - Atualizar lead
- `DELETE /api/v1/crm/leads/{id}/` - Deletar lead
- `POST /api/v1/crm/leads/{id}/convert/` - Converter lead em contato
- `GET /api/v1/crm/contacts/` - Listar contatos
- `POST /api/v1/crm/contacts/` - Criar contato
- `GET /api/v1/crm/contacts/{id}/` - Detalhes do contato
- `PUT /api/v1/crm/contacts/{id}/` - Atualizar contato
- `DELETE /api/v1/crm/contacts/{id}/` - Deletar contato
- `GET /api/v1/crm/deals/` - Listar deals
- `POST /api/v1/crm/deals/` - Criar deal
- `GET /api/v1/crm/deals/{id}/` - Detalhes do deal
- `PUT /api/v1/crm/deals/{id}/` - Atualizar deal
- `DELETE /api/v1/crm/deals/{id}/` - Deletar deal
- `GET /api/v1/crm/deals/pipeline/` - Pipeline overview
- `GET /api/v1/crm/activities/` - Listar atividades
- `POST /api/v1/crm/activities/` - Criar atividade
- `GET /api/v1/crm/activities/{id}/` - Detalhes da atividade
- `PUT /api/v1/crm/activities/{id}/` - Atualizar atividade
- `DELETE /api/v1/crm/activities/{id}/` - Deletar atividade
- `POST /api/v1/crm/activities/{id}/complete/` - Marcar como concluída

---

### 4. **apps.subscriptions** - Assinaturas e Billing

#### Modelos

- **Subscription** - Assinatura Stripe
  - Campos: `stripe_subscription_id`, `stripe_customer_id`, `plan`, `status`, `current_period_start`, `current_period_end`
  - Status: `active`, `trialing`, `past_due`, `canceled`, `unpaid`

#### Endpoints

- ⚠️ **Em desenvolvimento** - Endpoints serão adicionados em breve

---

### 5. **apps.admin_api** - API Administrativa

#### Views e Funções

- **dashboard_stats** - Estatísticas do dashboard admin
  - Retorna: `total_tenants`, `active_tenants`, `total_users`, `total_revenue`, `mrr`, `new_tenants_this_month`, `growth_rate`
  - Requer: `IsAdminUser` permission

#### Endpoints

- `GET /api/v1/admin/dashboard/stats/` - Estatísticas do dashboard

---

### 6. **apps.customers** - Clientes

#### Status

- ⚠️ **Em desenvolvimento** - Módulo criado, endpoints serão implementados

---

### 7. **apps.hr** - Recursos Humanos ✅

#### Modelos

- **Department** - Departamento

  - Campos: `name`, `code`, `description`, `manager`, `is_active`
  - Relacionamento: ForeignKey com `Employee` (manager)

- **Company** - Empresa da Pessoa (LLC, S-Corp, etc.)

  - Campos: `legal_name`, `trade_name`, `company_type`, `ein`, `address`, `city`, `state`, `zip_code`, `country`, `phone`, `email`, `website`, `owner`, `is_active`
  - Tipos: LLC, S-Corp, C-Corp, Partnership, Sole Proprietorship
  - Relacionamento: ForeignKey com `Employee` (owner)

- **Employee** - Funcionário
  - Campos: `user`, `employee_number`, `date_of_birth`, `cpf`, `ssn`, `rg`, `marital_status`, `nationality`, `address`, `city`, `state`, `zip_code`, `country`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `job_title`, `department`, `supervisor`, `contract_type`, `hire_type`, `company`, `hire_date`, `termination_date`, `base_salary`, `commission_percent`, `status`
  - Tipos de contrato: W2 Employee, 1099 Contractor, LLC, S-Corp, C-Corp, Partnership, CLT, PJ, Intern, Temporary
  - Tipos de contratação: Individual (Pessoa Física), Company (Via Empresa)
  - Status: Active, On Leave, Terminated, Resigned
  - `employee_number` gerado automaticamente (EMP-000001)
  - Relacionamentos: OneToOne com `User`, ForeignKey com `Department`, `Company`, `Employee` (supervisor)

#### Views e Funções

- **DepartmentViewSet** - CRUD de departamentos
  - Filtros: `active_only=true`
- **CompanyViewSet** - CRUD de empresas
  - Filtros: `owner_id`, `active_only=true`
- **EmployeeViewSet** - CRUD de funcionários
  - Filtros: `department_id`, `status`, `hire_type`, `active_only=true`
  - `by_user` - Obter funcionário por user_id

#### Endpoints

- `GET /api/v1/hr/departments/` - Listar departamentos
- `POST /api/v1/hr/departments/` - Criar departamento
- `GET /api/v1/hr/departments/{id}/` - Detalhes do departamento
- `PUT /api/v1/hr/departments/{id}/` - Atualizar departamento
- `DELETE /api/v1/hr/departments/{id}/` - Deletar departamento
- `GET /api/v1/hr/companies/` - Listar empresas
- `POST /api/v1/hr/companies/` - Criar empresa
- `GET /api/v1/hr/companies/{id}/` - Detalhes da empresa
- `PUT /api/v1/hr/companies/{id}/` - Atualizar empresa
- `DELETE /api/v1/hr/companies/{id}/` - Deletar empresa
- `GET /api/v1/hr/employees/` - Listar funcionários
- `POST /api/v1/hr/employees/` - Criar funcionário
- `GET /api/v1/hr/employees/{id}/` - Detalhes do funcionário
- `PUT /api/v1/hr/employees/{id}/` - Atualizar funcionário
- `DELETE /api/v1/hr/employees/{id}/` - Deletar funcionário
- `GET /api/v1/hr/employees/by_user/?user_id={id}` - Obter funcionário por user_id

---

### 8. **apps.invoices** - Faturas

#### Status

- ⚠️ **Em desenvolvimento** - Módulo criado, endpoints serão implementados

---

## 🎨 Módulos do Frontend

### 1. **components/crm** - Componentes CRM

- `LeadForm.tsx` - Formulário de criação/edição de leads
- `ContactForm.tsx` - Formulário de criação/edição de contatos
- `DealForm.tsx` - Formulário de criação/edição de deals
- `ActivityForm.tsx` - Formulário de criação/edição de atividades

### 2. **components/finance** - Componentes Financeiros

- `InvoiceForm.tsx` - Formulário de faturas

### 3. **components/inventory** - Componentes de Estoque

- `ProductForm.tsx` - Formulário de produtos

### 4. **components/invoicing** - Componentes de Faturamento

- `InvoiceList.tsx` - Lista de faturas

### 5. **components/projects** - Componentes de Projetos

- `ProjectForm.tsx` - Formulário de projetos

### 6. **components/auth** - Componentes de Autenticação

- `LoginForm.tsx` - Formulário de login

### 7. **components/layouts** - Componentes de Layout

- `DashboardLayout.tsx` - Layout principal do dashboard
- `Sidebar.tsx` - Barra lateral
- `Header.tsx` - Cabeçalho

### 8. **components/ui** - Componentes UI Base

- 19 componentes shadcn/ui: `alert`, `avatar`, `badge`, `button`, `card`, `data-table`, `dialog`, `dropdown-menu`, `input`, `label`, `modal`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `table`, `tooltip`

---

## 🔐 Módulos do Admin Panel

### 1. **components/layout** - Layout Admin

- `header.tsx` - Cabeçalho do admin
- `sidebar.tsx` - Barra lateral do admin

### 2. **components/ui** - Componentes UI

- Mesmos componentes shadcn/ui do frontend

### 3. **app/(dashboard)** - Páginas Admin

- `dashboard/page.tsx` - Dashboard principal
- `tenants/` - Gerenciamento de tenants
- `users/` - Gerenciamento de usuários

---

## 📊 Funcionalidades por Módulo

### ✅ Implementado e Funcional

#### Autenticação (apps.users)

- ✅ Login com JWT
- ✅ Registro de usuários
- ✅ Logout com blacklist
- ✅ Reset de senha via email
- ✅ Alteração de senha
- ✅ Perfil do usuário

#### Multi-Tenancy (apps.tenants)

- ✅ Criação de tenants
- ✅ Verificação de subdomínio
- ✅ Gerenciamento de domínios
- ✅ Isolamento de dados por schema
- ✅ Integração Stripe (preparado)

#### CRM (apps.crm)

- ✅ CRUD completo de Leads
- ✅ CRUD completo de Contacts
- ✅ CRUD completo de Deals
- ✅ CRUD completo de Activities
- ✅ Conversão de Lead para Contact
- ✅ Pipeline de vendas
- ✅ Filtros e busca avançada
- ✅ Score de leads (preparado para IA)

#### Admin (apps.admin_api)

- ✅ Dashboard com estatísticas
- ✅ Métricas de MRR
- ✅ Taxa de crescimento

---

### 🚧 Em Desenvolvimento

#### Subscriptions (apps.subscriptions)

- 🚧 Endpoints de assinatura
- 🚧 Webhooks Stripe
- 🚧 Gerenciamento de planos

#### Customers (apps.customers)

- 🚧 CRUD de clientes
- 🚧 Histórico de compras

#### Invoices (apps.invoices)

- 🚧 Geração de faturas
- 🚧 Histórico de pagamentos
- 🚧 Integração com Stripe

---

### 📦 Novos Módulos Planejados (Baseados na Especificação Completa)

#### Sales (apps.sales) - Módulo de Vendas

- 🚧 **Catálogo de Produtos**
  - Modo Card (visual para apresentação)
  - Modo Lista (produtividade)
  - Modo Detalhado (ficha completa)
  - Filtros por categoria, marca, disponibilidade
  - Modo offline para vendedores
- 🚧 **Sales Orders (Pedidos de Venda)**
  - Criação de pedidos
  - Seleção de warehouse
  - Seleção de cliente (carteira do vendedor)
  - Aplicação de descontos automáticos e manuais
  - Validação de estoque e crédito
  - Status detalhados (draft, confirmed, picking, shipped, etc.)
- 🚧 **Carteira de Clientes**
  - Vinculação cliente-vendedor
  - Histórico de compras
  - Invoices em aberto
  - Limite de crédito
  - Score de compra
- 🚧 **Dashboard do Vendedor**
  - KPIs (vendas do mês, meta, % atingido)
  - Pedidos em aberto
  - Faturas em aberto por cliente
  - Alertas de estoque baixo
  - Clientes sem compra há X dias

#### Warehouse (apps.warehouse) - Módulo de Estoque

- 🚧 **Cadastro de Produtos**
  - Tipos: físico, serviço, digital, assinatura, bundle
  - Embalagens (Unidade → Display → Caixa)
  - Códigos (SKU, EAN/UPC, EIN, HS Code)
  - Custo, markup, margem
  - Posição no warehouse (aisle/rack/level/bin)
  - Lote/série/validade
- 🚧 **Múltiplos Warehouses**
  - Cadastro de warehouses
  - Estoque por warehouse
  - Posições endereçáveis
  - Responsáveis
- 🚧 **Movimentações**
  - Entrada de mercadoria
  - Saída de mercadoria
  - Ajustes de inventário
  - Contagem física
- 🚧 **Transferências**
  - Entre warehouses
  - Aprovação
  - Rastreamento

#### Logistics (apps.logistics) - Módulo de Logística

- 🚧 **Picking (Separação)**
  - Lista de pedidos para separar
  - Mobile app com código de barras
  - Escaneamento de produtos
  - Rota otimizada
  - Registro de divergências
- 🚧 **Conferência**
  - Validação de itens separados
  - Packing list
  - Etiquetas
- 🚧 **Expedição**
  - Integração com carriers
  - Geração de AWB/tracking
  - Etiquetas de remessa
  - Atualização de status

#### Invoicing (apps.invoicing) - Módulo de Invoice

- 🚧 **Geração de Invoices**
  - Automática (após picking/shipping)
  - Manual
  - Numeração por warehouse (ORL-000001)
  - Termos de pagamento (Net 7/10/15/30)
- 🚧 **Contas a Receber**
  - Lista de invoices
  - Registro de pagamentos
  - Baixa automática/manual
  - Bloqueio de clientes inadimplentes
- 🚧 **Relatórios Financeiros**
  - DSO (Days Sales Outstanding)
  - Aging de invoices
  - Faturamento por período
  - Faturamento por vendedor/cliente

#### Customer Portal (apps.customer_portal) - Portal do Cliente

- 🚧 **Acompanhamento de Pedidos**
  - Timeline de status
  - Rastreamento com link do carrier
  - Download de documentos
- 🚧 **Invoices**
  - Visualização de invoices
  - Download PDF
  - Histórico de pagamentos
- 🚧 **RMA (Devoluções)**
  - Solicitação de devolução
  - Upload de fotos
  - Rastreamento de retorno

---

### 📝 Notas Técnicas

#### Filtros e Busca

- Todos os ViewSets suportam filtros via `django-filter`
- Busca textual via `SearchFilter`
- Ordenação customizável via `OrderingFilter`

#### Permissões

- APIs públicas: `AllowAny` (registro, login público)
- APIs autenticadas: `IsAuthenticated` (maioria)
- APIs admin: `IsAdminUser` (dashboard stats)

#### Internacionalização

- Suporte a i18n via Django translations
- Endpoint de teste: `/api/v1/public/i18n/test/`
- Headers: `Accept-Language: pt-BR, en-US, es-ES`

#### Performance

- Uso de `select_related` para otimizar queries
- Índices em campos frequentemente consultados
- Paginação automática via DRF

---

## 🔄 Changelog

### 2025-11-14

- ✅ Documentação inicial criada
- ✅ Mapeamento completo de módulos e funções
- ✅ Listagem de todos os endpoints

---

**⚠️ IMPORTANTE:** Este documento deve ser atualizado sempre que:

- Novos módulos forem criados
- Novas funções forem implementadas
- Novos endpoints forem adicionados
- Funcionalidades forem modificadas ou removidas
