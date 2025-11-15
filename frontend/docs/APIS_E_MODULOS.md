# 📚 APIs e Módulos - Innexar ERP Frontend

**Última atualização:** 2025-11-14  
**Versão:** 1.2.0

> Este documento combina informações sobre módulos implementados e APIs disponíveis para referência rápida no desenvolvimento frontend.

---

## 📋 Índice

1. [Módulos Implementados](#módulos-implementados)
2. [APIs Disponíveis](#apis-disponíveis)
3. [Componentes Frontend](#componentes-frontend)
4. [Integração com Backend](#integração-com-backend)
5. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Módulos Implementados

### Backend - Módulos Funcionais

#### ✅ **apps.users** - Autenticação e Usuários
- Login com JWT
- Registro de usuários
- Logout com blacklist
- Reset de senha
- Alteração de senha
- Perfil do usuário
- **NOVO:** Sistema de Roles e Permissions
  - Gerenciamento de roles (funções)
  - Gerenciamento de módulos
  - Permissões por módulo (view, create, edit, delete, admin)
  - Atribuição de roles a usuários

#### ✅ **apps.tenants** - Multi-Tenancy
- Criação de tenants
- Verificação de subdomínio
- Gerenciamento de domínios
- Isolamento de dados por schema
- Integração Stripe (preparado)

#### ✅ **apps.crm** - Customer Relationship Management
- **Leads**: CRUD completo, conversão para contato, score (0-100)
- **Contacts**: CRUD completo, tags, histórico
- **Deals**: CRUD completo, pipeline, cálculo de receita esperada
- **Activities**: CRUD completo, tipos (call, email, meeting, task, note, whatsapp)

#### ✅ **apps.admin_api** - Dashboard Administrativo
- Estatísticas globais
- Métricas de MRR
- Taxa de crescimento

#### ✅ **apps.hr** - Recursos Humanos ✅ **NOVO**
- **Departments**: CRUD completo de departamentos
- **Companies**: CRUD completo de empresas (LLC, S-Corp, etc.)
- **Employees**: CRUD completo de funcionários
  - Suporte a contratação via empresa (LLC, S-Corp, etc.)
  - Tipos de contrato: W2, 1099, LLC, S-Corp, CLT, PJ, etc.
  - Geração automática de employee_number (EMP-000001)
  - Dados pessoais, profissionais e de contrato completos

#### 🚧 **apps.subscriptions** - Assinaturas (Em desenvolvimento)
#### 🚧 **apps.customers** - Clientes (Em desenvolvimento)
#### 🚧 **apps.invoices** - Faturas (Em desenvolvimento)

---

## 🔌 APIs Disponíveis

### Base URLs
- **Desenvolvimento**: `http://localhost:8000`
- **Produção**: `https://api.innexar.com` (configurar via env)

### Autenticação
```
POST   /api/v1/auth/login/                    # Login
POST   /api/v1/auth/logout/                   # Logout
POST   /api/v1/auth/register/                 # Registro
POST   /api/v1/auth/token/refresh/            # Refresh token
GET    /api/v1/auth/me/                       # Usuário atual
POST   /api/v1/auth/change-password/          # Alterar senha
POST   /api/v1/auth/password-reset/           # Solicitar reset
POST   /api/v1/auth/password-reset/confirm/   # Confirmar reset
```

### Multi-Tenancy
```
GET    /api/v1/public/tenants/                # Listar tenants
POST   /api/v1/public/tenants/                # Criar tenant
GET    /api/v1/public/tenants/{id}/            # Detalhes
PUT    /api/v1/public/tenants/{id}/           # Atualizar
DELETE /api/v1/public/tenants/{id}/           # Deletar
GET    /api/v1/public/tenants/check-subdomain/?subdomain=xxx  # Verificar subdomínio
GET    /api/v1/public/i18n/test/              # Teste i18n
```

### CRM - Leads
```
GET    /api/v1/crm/leads/                     # Listar (com filtros)
POST   /api/v1/crm/leads/                     # Criar
GET    /api/v1/crm/leads/{id}/                # Detalhes
PUT    /api/v1/crm/leads/{id}/                # Atualizar
DELETE /api/v1/crm/leads/{id}/               # Deletar
POST   /api/v1/crm/leads/{id}/convert/       # Converter em contato
```

**Filtros disponíveis:**
- `?status=new` - Filtrar por status
- `?source=website` - Filtrar por origem
- `?owner=1` - Filtrar por dono
- `?search=joão` - Busca textual
- `?ordering=-score` - Ordenar por score (desc)

### CRM - Contacts
```
GET    /api/v1/crm/contacts/                 # Listar
POST   /api/v1/crm/contacts/                 # Criar
GET    /api/v1/crm/contacts/{id}/            # Detalhes
PUT    /api/v1/crm/contacts/{id}/            # Atualizar
DELETE /api/v1/crm/contacts/{id}/           # Deletar
```

**Filtros disponíveis:**
- `?is_customer=true` - Apenas clientes
- `?owner=1` - Filtrar por dono
- `?search=maria` - Busca textual

### CRM - Deals
```
GET    /api/v1/crm/deals/                    # Listar
POST   /api/v1/crm/deals/                    # Criar
GET    /api/v1/crm/deals/{id}/               # Detalhes
PUT    /api/v1/crm/deals/{id}/               # Atualizar
DELETE /api/v1/crm/deals/{id}/               # Deletar
GET    /api/v1/crm/deals/pipeline/           # Pipeline overview
```

**Filtros disponíveis:**
- `?stage=negotiation` - Filtrar por estágio
- `?owner=1` - Filtrar por dono
- `?contact=1` - Filtrar por contato

### CRM - Activities
```
GET    /api/v1/crm/activities/                # Listar
POST   /api/v1/crm/activities/               # Criar
GET    /api/v1/crm/activities/{id}/          # Detalhes
PUT    /api/v1/crm/activities/{id}/          # Atualizar
DELETE /api/v1/crm/activities/{id}/          # Deletar
POST   /api/v1/crm/activities/{id}/complete/  # Marcar como concluída
```

**Filtros disponíveis:**
- `?activity_type=call` - Filtrar por tipo
- `?status=completed` - Filtrar por status
- `?lead=1` - Filtrar por lead
- `?contact=1` - Filtrar por contato
- `?deal=1` - Filtrar por deal

### Admin
```
GET    /api/v1/admin/dashboard/stats/        # Estatísticas (requer admin)
```

### Roles e Permissions ✅ **NOVO**
```
GET    /api/v1/auth/roles/                    # Listar roles
POST   /api/v1/auth/roles/                    # Criar role
GET    /api/v1/auth/roles/{id}/               # Detalhes
PUT    /api/v1/auth/roles/{id}/               # Atualizar
DELETE /api/v1/auth/roles/{id}/               # Deletar
GET    /api/v1/auth/modules/                  # Listar módulos
GET    /api/v1/auth/permissions/              # Listar permissões
POST   /api/v1/auth/permissions/              # Criar permissão
GET    /api/v1/auth/users/                   # Listar usuários
POST   /api/v1/auth/users/{id}/assign_roles/  # Atribuir roles
GET    /api/v1/auth/users/{id}/permissions/   # Ver permissões do usuário
```

### HR (Recursos Humanos) ✅ **NOVO**

**Permissões:** Módulo `hr`, nível mínimo `view`

```
# Departments (6 endpoints)
GET    /api/v1/hr/departments/                # Listar departamentos
POST   /api/v1/hr/departments/                # Criar departamento
GET    /api/v1/hr/departments/{id}/           # Detalhes
PUT    /api/v1/hr/departments/{id}/           # Atualizar (completo)
PATCH  /api/v1/hr/departments/{id}/           # Atualizar (parcial)
DELETE /api/v1/hr/departments/{id}/           # Deletar

# Companies (6 endpoints)
GET    /api/v1/hr/companies/                 # Listar empresas
POST   /api/v1/hr/companies/                 # Criar empresa
GET    /api/v1/hr/companies/{id}/            # Detalhes
PUT    /api/v1/hr/companies/{id}/            # Atualizar (completo)
PATCH  /api/v1/hr/companies/{id}/            # Atualizar (parcial)
DELETE /api/v1/hr/companies/{id}/            # Deletar

# Employees (7 endpoints)
GET    /api/v1/hr/employees/                 # Listar funcionários
POST   /api/v1/hr/employees/                 # Criar funcionário
GET    /api/v1/hr/employees/{id}/            # Detalhes
PUT    /api/v1/hr/employees/{id}/            # Atualizar (completo)
PATCH  /api/v1/hr/employees/{id}/            # Atualizar (parcial)
DELETE /api/v1/hr/employees/{id}/            # Deletar
GET    /api/v1/hr/employees/by_user/?user_id={id}  # Por user_id (ação customizada)
```

**Filtros HR:**
- `?active_only=true` - Apenas ativos (departments, companies)
- `?department_id=1` - Filtrar funcionários por departamento
- `?status=active` - Filtrar funcionários por status
- `?hire_type=individual` - Filtrar por tipo de contratação
- `?owner_id=1` - Filtrar empresas por proprietário

### Documentação
```
GET    /api/docs/                             # Swagger UI
GET    /api/schema/                            # OpenAPI Schema
```

---

## 🎨 Componentes Frontend

### Componentes CRM
- `components/crm/LeadForm.tsx` - Formulário de leads
- `components/crm/ContactForm.tsx` - Formulário de contatos
- `components/crm/DealForm.tsx` - Formulário de deals
- `components/crm/ActivityForm.tsx` - Formulário de atividades

### Componentes Financeiros
- `components/finance/InvoiceForm.tsx` - Formulário de faturas

### Componentes de Estoque
- `components/inventory/ProductForm.tsx` - Formulário de produtos

### Componentes de Faturamento
- `components/invoicing/InvoiceList.tsx` - Lista de faturas

### Componentes de Projetos
- `components/projects/ProjectForm.tsx` - Formulário de projetos

### Componentes de Autenticação
- `components/auth/LoginForm.tsx` - Formulário de login

### Componentes de Layout
- `components/layouts/DashboardLayout.tsx` - Layout principal
- `components/layouts/Sidebar.tsx` - Barra lateral
- `components/layouts/Header.tsx` - Cabeçalho

### Componentes UI Base (shadcn/ui)
- `alert`, `avatar`, `badge`, `button`, `card`, `data-table`, `dialog`, `dropdown-menu`, `input`, `label`, `modal`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `table`, `tooltip`

---

## 🔗 Integração com Backend

### Configuração da API

O frontend deve usar a variável de ambiente `NEXT_PUBLIC_API_URL`:

```typescript
// lib/api/config.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  baseURL: `${API_URL}/api/v1`,
  // ... configuração do cliente
};
```

### Autenticação

```typescript
// Exemplo de uso do token JWT
const token = localStorage.getItem('access_token');

fetch(`${API_URL}/api/v1/crm/leads/`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Tratamento de Erros

```typescript
try {
  const response = await fetch(`${API_URL}/api/v1/crm/leads/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado, fazer refresh ou redirecionar para login
      handleTokenRefresh();
    } else {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao buscar dados');
    }
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Listar Leads com Filtros

```typescript
import { apiClient } from '@/lib/api/config';

export async function getLeads(filters?: {
  status?: string;
  source?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.search) params.append('search', filters.search);
  
  const response = await apiClient.get(`/crm/leads/?${params.toString()}`);
  return response.data;
}
```

### Exemplo 2: Criar Lead

```typescript
export async function createLead(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
}) {
  const response = await apiClient.post('/crm/leads/', data);
  return response.data;
}
```

### Exemplo 3: Converter Lead em Contato

```typescript
export async function convertLeadToContact(leadId: number) {
  const response = await apiClient.post(`/crm/leads/${leadId}/convert/`);
  return response.data;
}
```

### Exemplo 4: Obter Pipeline de Deals

```typescript
export async function getDealsPipeline() {
  const response = await apiClient.get('/crm/deals/pipeline/');
  return response.data;
}
```

### Exemplo 5: Marcar Atividade como Concluída

```typescript
export async function completeActivity(activityId: number) {
  const response = await apiClient.post(
    `/crm/activities/${activityId}/complete/`
  );
  return response.data;
}
```

### Exemplo 6: Login e Armazenar Token

```typescript
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Credenciais inválidas');
  }
  
  const data = await response.json();
  
  // Armazenar tokens
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  
  return data;
}
```

---

## 📝 Notas Importantes

### Paginação
Todas as listagens retornam paginação padrão do DRF:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/crm/leads/?page=2",
  "previous": null,
  "results": [...]
}
```

### Filtros e Busca
- Use query parameters para filtros
- Busca textual funciona em múltiplos campos
- Ordenação suporta prefixo `-` para descendente

### Permissões
- Maioria das APIs requer autenticação (`IsAuthenticated`)
- Admin endpoints requerem `IsAdminUser`
- APIs públicas: registro, login, verificação de subdomínio

### Internacionalização
- Backend suporta i18n via `Accept-Language` header
- Idiomas suportados: `pt-BR`, `en-US`, `es-ES`

---

## 🔄 Changelog

### 2025-11-14
- ✅ Documentação inicial criada
- ✅ **NOVO:** APIs de Roles e Permissions adicionadas
- ✅ **NOVO:** APIs de HR (Recursos Humanos) adicionadas
- ✅ **ATUALIZADO:** Seção HR completa com todos os 19 endpoints (Departments, Companies, Employees)
- ✅ Módulos e APIs mapeados
- ✅ Exemplos práticos adicionados
- ✅ Guia de integração criado

---

**⚠️ IMPORTANTE:** Este documento deve ser atualizado sempre que:
- Novos módulos forem implementados
- Novas APIs forem criadas
- Componentes forem adicionados ou modificados
- Padrões de integração mudarem

**📚 Documentação Completa:**
- Módulos e Funções: `../../docs/MODULOS_E_FUNCOES.md`
- APIs Detalhadas: `../../docs/APIS_COMPLETO.md`

