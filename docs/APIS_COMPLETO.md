# 🔌 APIs Completas - Innexar ERP

**Última atualização:** 2025-11-14  
**Versão:** 1.3.0  
**Base URL:** `http://localhost:8000` (desenvolvimento) | `https://api.innexar.com` (produção)

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Multi-Tenancy](#multi-tenancy)
3. [CRM](#crm)
4. [Roles e Permissions](#roles-e-permissions)
5. [HR (Recursos Humanos)](#hr-recursos-humanos)
6. [Admin](#admin)
7. [Documentação Interativa](#documentação-interativa)
8. [Códigos de Status](#códigos-de-status)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Exemplos de Uso](#exemplos-de-uso)

---

## 🔐 Autenticação

### Base URL

```
/api/v1/auth/
```

### Endpoints

#### 1. Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "default_tenant": {
      "id": 1,
      "name": "Minha Empresa",
      "schema_name": "minha-empresa"
    }
  }
}
```

**Erros:**

- `400 Bad Request` - Credenciais inválidas
- `401 Unauthorized` - Usuário inativo

---

#### 2. Registro

```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "novo@example.com",
  "password": "senha123",
  "password_confirm": "senha123",
  "first_name": "Maria",
  "last_name": "Santos"
}
```

**Resposta (201 Created):**

```json
{
  "id": 2,
  "email": "novo@example.com",
  "first_name": "Maria",
  "last_name": "Santos",
  "is_active": true
}
```

**Erros:**

- `400 Bad Request` - Validação falhou (email já existe, senhas não coincidem, etc)

---

#### 3. Obter Usuário Atual

```http
GET /api/v1/auth/me/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "default_tenant": {
    "id": 1,
    "name": "Minha Empresa"
  }
}
```

**Erros:**

- `401 Unauthorized` - Token inválido ou expirado

---

#### 4. Refresh Token

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Resposta (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

#### 5. Alterar Senha

```http
POST /api/v1/auth/change-password/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "old_password": "senha123",
  "new_password": "novaSenha456",
  "new_password_confirm": "novaSenha456"
}
```

**Resposta (200 OK):**

```json
{
  "message": "Password changed successfully."
}
```

---

#### 6. Solicitar Reset de Senha

```http
POST /api/v1/auth/password-reset/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Resposta (200 OK):**

```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Nota:** Sempre retorna 200 para não revelar se o email existe.

---

#### 7. Confirmar Reset de Senha

```http
POST /api/v1/auth/password-reset/confirm/
Content-Type: application/json

{
  "uid": "base64_encoded_user_id",
  "token": "reset_token",
  "new_password": "novaSenha123",
  "new_password_confirm": "novaSenha123"
}
```

**Resposta (200 OK):**

```json
{
  "message": "Password has been reset successfully."
}
```

**Erros:**

- `400 Bad Request` - Token inválido ou expirado

---

#### 8. Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Resposta (200 OK):**

```json
{
  "message": "Logged out successfully."
}
```

---

## 🏢 Multi-Tenancy

### Base URL

```
/api/v1/public/tenants/
```

### Endpoints

#### 1. Listar Tenants

```http
GET /api/v1/public/tenants/
```

**Resposta (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Minha Empresa",
    "schema_name": "minha-empresa",
    "plan": "professional",
    "is_active": true,
    "max_users": 50,
    "max_storage_mb": 10000
  }
]
```

---

#### 2. Criar Tenant

```http
POST /api/v1/public/tenants/
Content-Type: application/json

{
  "name": "Nova Empresa",
  "schema_name": "nova-empresa",
  "plan": "starter"
}
```

**Resposta (201 Created):**

```json
{
  "id": 2,
  "name": "Nova Empresa",
  "schema_name": "nova-empresa",
  "plan": "starter",
  "is_active": true,
  "created_on": "2025-11-14T10:00:00Z"
}
```

---

#### 3. Verificar Subdomínio

```http
GET /api/v1/public/tenants/check-subdomain/?subdomain=nova-empresa
```

**Resposta (200 OK):**

```json
{
  "subdomain": "nova-empresa",
  "available": true
}
```

**Resposta (200 OK - Indisponível):**

```json
{
  "subdomain": "minha-empresa",
  "available": false
}
```

---

#### 4. Detalhes do Tenant

```http
GET /api/v1/public/tenants/{id}/
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "name": "Minha Empresa",
  "schema_name": "minha-empresa",
  "plan": "professional",
  "is_active": true,
  "max_users": 50,
  "max_storage_mb": 10000,
  "trial_ends_on": null
}
```

---

#### 5. Atualizar Tenant

```http
PUT /api/v1/public/tenants/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Empresa Atualizada",
  "plan": "enterprise"
}
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "name": "Empresa Atualizada",
  "plan": "enterprise",
  ...
}
```

---

#### 6. Deletar Tenant

```http
DELETE /api/v1/public/tenants/{id}/
Authorization: Bearer {access_token}
```

**Resposta (204 No Content)**

---

#### 7. Teste de Internacionalização

```http
GET /api/v1/public/i18n/test/
Accept-Language: pt-BR
```

**Resposta (200 OK):**

```json
{
  "dashboard": "Dashboard",
  "crm": "CRM",
  "finance": "Finanças",
  "invoicing": "Faturamento",
  "leads": "Leads",
  "contacts": "Contatos",
  "deals": "Negócios",
  "login": "Login",
  "logout": "Sair",
  "save": "Salvar",
  "cancel": "Cancelar",
  "success": "Sucesso",
  "error": "Erro",
  "today": "Hoje",
  "message": "Criado com sucesso"
}
```

---

## 📊 CRM

### Base URL

```
/api/v1/crm/
```

### Leads

#### 1. Listar Leads

```http
GET /api/v1/crm/leads/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `status` - Filtrar por status (`new`, `contacted`, `qualified`, `converted`, `lost`)
- `source` - Filtrar por origem (`website`, `social`, `referral`, etc)
- `owner` - Filtrar por dono (ID do usuário)
- `search` - Busca textual (nome, email, empresa)
- `ordering` - Ordenação (`score`, `created_at`, `updated_at`, `-score`, etc)

**Exemplo:**

```http
GET /api/v1/crm/leads/?status=new&search=joão&ordering=-score
```

**Resposta (200 OK):**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "company": "Empresa ABC",
      "position": "CEO",
      "source": "website",
      "status": "new",
      "score": 85,
      "notes": "Interessado em produto X",
      "owner": 1,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Lead

```http
POST /api/v1/crm/leads/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+5511888888888",
  "company": "Empresa XYZ",
  "position": "Diretora",
  "source": "social",
  "status": "new",
  "notes": "Contato via LinkedIn"
}
```

**Resposta (201 Created):**

```json
{
  "id": 2,
  "name": "Maria Santos",
  "email": "maria@example.com",
  ...
}
```

**Nota:** O campo `owner` é automaticamente definido como o usuário autenticado se não fornecido.

---

#### 3. Converter Lead em Contato

```http
POST /api/v1/crm/leads/{id}/convert/
Authorization: Bearer {access_token}
```

**Resposta (201 Created):**

```json
{
  "id": 1,
  "name": "Maria Santos",
  "email": "maria@example.com",
  "is_customer": false,
  "converted_from_lead": 2,
  ...
}
```

**Erros:**

- `400 Bad Request` - Lead já convertido

---

### Contacts

#### 1. Listar Contatos

```http
GET /api/v1/crm/contacts/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `is_customer` - Filtrar por clientes (`true`/`false`)
- `owner` - Filtrar por dono
- `search` - Busca textual
- `ordering` - Ordenação

**Resposta (200 OK):**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "company": "Empresa ABC",
      "is_customer": true,
      "converted_from_lead": null,
      ...
    }
  ]
}
```

---

#### 2. Criar Contato

```http
POST /api/v1/crm/contacts/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Pedro Costa",
  "email": "pedro@example.com",
  "phone": "+5511777777777",
  "company": "Empresa DEF",
  "address": "Rua ABC, 123",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "zip_code": "01234-567"
}
```

---

### Deals

#### 1. Listar Deals

```http
GET /api/v1/crm/deals/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `stage` - Filtrar por estágio
- `owner` - Filtrar por dono
- `contact` - Filtrar por contato (ID)
- `search` - Busca textual
- `ordering` - Ordenação

---

#### 2. Pipeline Overview

```http
GET /api/v1/crm/deals/pipeline/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
[
  {
    "stage": "prospecting",
    "stage_name": "Prospecting",
    "count": 5,
    "total_amount": 50000.00,
    "total_expected_revenue": 25000.00
  },
  {
    "stage": "qualification",
    "stage_name": "Qualification",
    "count": 3,
    "total_amount": 30000.00,
    "total_expected_revenue": 18000.00
  },
  ...
]
```

---

#### 3. Criar Deal

```http
POST /api/v1/crm/deals/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Venda Produto X",
  "description": "Negócio com cliente importante",
  "amount": "10000.00",
  "currency": "BRL",
  "probability": 75,
  "stage": "negotiation",
  "contact": 1,
  "expected_close_date": "2025-12-31"
}
```

**Nota:** O campo `expected_revenue` é calculado automaticamente: `amount × (probability / 100)`

---

### Activities

#### 1. Listar Atividades

```http
GET /api/v1/crm/activities/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `activity_type` - Filtrar por tipo (`call`, `email`, `meeting`, etc)
- `status` - Filtrar por status (`planned`, `completed`, `canceled`)
- `lead` - Filtrar por lead (ID)
- `contact` - Filtrar por contato (ID)
- `deal` - Filtrar por deal (ID)
- `owner` - Filtrar por dono

---

#### 2. Marcar Atividade como Concluída

```http
POST /api/v1/crm/activities/{id}/complete/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "activity_type": "call",
  "subject": "Ligação com cliente",
  "status": "completed",
  "completed_at": "2025-11-14T15:30:00Z",
  ...
}
```

---

## 🔐 Admin

### Base URL

```
/api/v1/admin/
```

### Endpoints

#### 1. Dashboard Stats

```http
GET /api/v1/admin/dashboard/stats/
Authorization: Bearer {access_token}
```

**Requer:** Permissão de administrador (`IsAdminUser`)

**Resposta (200 OK):**

```json
{
  "total_tenants": 50,
  "active_tenants": 45,
  "total_users": 200,
  "total_revenue": 17964.0,
  "mrr": 1497.0,
  "new_tenants_this_month": 5,
  "growth_rate": 12.5
}
```

**Erros:**

- `403 Forbidden` - Usuário não é administrador

---

## 📚 Documentação Interativa

### Swagger UI

```
http://localhost:8000/api/docs/
```

Acesse a documentação interativa completa com:

- Lista de todos os endpoints
- Esquemas de request/response
- Teste direto das APIs
- Autenticação integrada

### Schema OpenAPI

```
http://localhost:8000/api/schema/
```

Retorna o schema OpenAPI 3.0 em formato JSON/YAML.

---

## 📊 Códigos de Status

| Código                      | Significado         | Quando Usar                        |
| --------------------------- | ------------------- | ---------------------------------- |
| `200 OK`                    | Sucesso             | GET, PUT, PATCH bem-sucedidos      |
| `201 Created`               | Criado              | POST bem-sucedido                  |
| `204 No Content`            | Sem conteúdo        | DELETE bem-sucedido                |
| `400 Bad Request`           | Requisição inválida | Validação falhou, dados incorretos |
| `401 Unauthorized`          | Não autenticado     | Token ausente ou inválido          |
| `403 Forbidden`             | Sem permissão       | Usuário sem permissão para a ação  |
| `404 Not Found`             | Não encontrado      | Recurso não existe                 |
| `500 Internal Server Error` | Erro do servidor    | Erro interno não tratado           |

---

## ⚠️ Tratamento de Erros

### Formato Padrão de Erro

```json
{
  "error": "Mensagem de erro descritiva",
  "detail": "Detalhes adicionais (opcional)",
  "field": "campo_com_erro (se aplicável)"
}
```

### Exemplos

#### Validação de Campo

```json
{
  "email": ["Este campo é obrigatório."],
  "password": ["A senha deve ter pelo menos 8 caracteres."]
}
```

#### Erro de Autenticação

```json
{
  "detail": "No active account found with the given credentials"
}
```

#### Erro de Permissão

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Fluxo Completo de CRM

```javascript
// 1. Login
const loginResponse = await fetch("http://localhost:8000/api/v1/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "senha123",
  }),
});
const { access, user } = await loginResponse.json();

// 2. Criar Lead
const leadResponse = await fetch("http://localhost:8000/api/v1/crm/leads/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${access}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Novo Cliente",
    email: "cliente@example.com",
    source: "website",
    status: "new",
  }),
});
const lead = await leadResponse.json();

// 3. Converter Lead em Contato
const convertResponse = await fetch(
  `http://localhost:8000/api/v1/crm/leads/${lead.id}/convert/`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${access}` },
  }
);
const contact = await convertResponse.json();

// 4. Criar Deal
const dealResponse = await fetch("http://localhost:8000/api/v1/crm/deals/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${access}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Negócio Importante",
    amount: "5000.00",
    probability: 80,
    stage: "proposal",
    contact: contact.id,
  }),
});
const deal = await dealResponse.json();
```

---

### Exemplo 2: Refresh Token

```javascript
// Token expirado, fazer refresh
const refreshResponse = await fetch(
  "http://localhost:8000/api/v1/auth/token/refresh/",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  }
);
const { access: newAccessToken } = await refreshResponse.json();

// Usar novo token
const data = await fetch("http://localhost:8000/api/v1/crm/leads/", {
  headers: { Authorization: `Bearer ${newAccessToken}` },
});
```

---

### Exemplo 3: Filtros e Busca

```javascript
// Buscar leads com filtros
const url = new URL("http://localhost:8000/api/v1/crm/leads/");
url.searchParams.append("status", "new");
url.searchParams.append("source", "website");
url.searchParams.append("search", "joão");
url.searchParams.append("ordering", "-score");

const response = await fetch(url, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const { results } = await response.json();
```

---

## 👥 Roles e Permissions

### Base URL

```
/api/v1/auth/
```

### Endpoints

#### 1. Listar Roles

```http
GET /api/v1/auth/roles/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "count": 7,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Administrator",
      "code": "admin",
      "description": "Full system access",
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Role

```http
POST /api/v1/auth/roles/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Custom Role",
  "code": "custom_role",
  "description": "Custom role description",
  "is_active": true
}
```

**Resposta (201 Created):**

```json
{
  "id": 8,
  "name": "Custom Role",
  "code": "custom_role",
  "description": "Custom role description",
  "is_active": true,
  "created_at": "2025-11-14T10:00:00Z",
  "updated_at": "2025-11-14T10:00:00Z"
}
```

---

#### 3. Listar Módulos

```http
GET /api/v1/auth/modules/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "code": "users",
      "name": "Users & Auth",
      "description": "User management and authentication",
      "icon": "users",
      "order": 1,
      "is_active": true
    }
  ]
}
```

---

#### 4. Listar Permissões

```http
GET /api/v1/auth/permissions/?role_id=1&module_id=1
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "role": 1,
      "role_name": "Administrator",
      "module": 1,
      "module_name": "Users & Auth",
      "level": "admin",
      "level_display": "Admin",
      "created_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 5. Atribuir Roles a Usuário

```http
POST /api/v1/auth/users/{user_id}/assign_roles/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role_ids": [1, 2, 3]
}
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "roles": [
    {
      "id": 1,
      "name": "Administrator",
      "code": "admin"
    }
  ]
}
```

---

#### 6. Ver Permissões do Usuário

```http
GET /api/v1/auth/users/{user_id}/permissions/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "user_id": 1,
  "user_email": "user@example.com",
  "permissions": [
    {
      "module_code": "sales",
      "module_name": "Sales",
      "level": "admin",
      "level_display": "Admin",
      "role": "Administrator"
    }
  ]
}
```

---

## 👔 HR (Recursos Humanos)

### Base URL

```
/api/v1/hr/
```

### ✅ Status de Implementação

**✅ 100% Implementado (57 endpoints):**

- ✅ Departments (6 endpoints) - CRUD completo
- ✅ Companies (6 endpoints) - CRUD completo
- ✅ Employees (7 endpoints) - CRUD completo + ação customizada `by_user`
- ✅ Benefits (6 endpoints) - CRUD completo
- ✅ Employee Benefits (6 endpoints) - CRUD completo
- ✅ Time Records (7 endpoints) - CRUD completo + ação `approve`
- ✅ Vacations (8 endpoints) - CRUD completo + ações `approve` e `reject`
- ✅ Performance Reviews (6 endpoints) - CRUD completo
- ✅ Trainings (7 endpoints) - CRUD completo + ação `enroll`
- ✅ Employee Trainings (2 endpoints) - List e Retrieve (read-only)
- ✅ Job Openings (6 endpoints) - CRUD completo
- ✅ Candidates (6 endpoints) - CRUD completo
- ✅ Payroll (3 endpoints) - List, Retrieve + ação `process`

**Total:** 57 endpoints implementados e disponíveis ✅

> 📝 **Nota:** Todos os endpoints do módulo HR estão implementados e disponíveis. Para ver a especificação completa do módulo HR, consulte `docs/modulos/08_HR.md`.

---

### Permissões

Todas as APIs do módulo HR requerem:

- **Módulo:** `hr`
- **Nível mínimo:** `view`
- **Classe de permissão:** `HasModulePermission`

**Níveis de permissão:**

- `view` - Visualizar
- `create` - Criar
- `edit` - Editar
- `delete` - Deletar
- `admin` - Administrador completo

---

### 📁 Departments (Departamentos)

#### 1. Listar Departamentos

```http
GET /api/v1/hr/departments/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `active_only=true` - Filtra apenas departamentos ativos

**Resposta (200 OK):**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Sales",
      "code": "SALES",
      "description": "Sales department",
      "manager": 1,
      "manager_name": "John Doe",
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Departamento

```http
POST /api/v1/hr/departments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Marketing",
  "code": "MKT",
  "description": "Marketing department",
  "manager": 1,
  "is_active": true
}
```

**Resposta (201 Created):**

```json
{
  "id": 2,
  "name": "Marketing",
  "code": "MKT",
  "description": "Marketing department",
  "manager": 1,
  "manager_name": "Jane Smith",
  "is_active": true,
  "created_at": "2025-11-14T10:00:00Z",
  "updated_at": "2025-11-14T10:00:00Z"
}
```

---

#### 3. Detalhes do Departamento

```http
GET /api/v1/hr/departments/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Mesmo formato do item na lista

**Erros:**

- `404 Not Found` - Departamento não encontrado

---

#### 4. Atualizar Departamento (Completo)

```http
PUT /api/v1/hr/departments/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Marketing Digital",
  "code": "MKT",
  "description": "Marketing Digital department",
  "manager": 2,
  "is_active": true
}
```

**Resposta (200 OK):** Departamento atualizado

---

#### 5. Atualizar Departamento (Parcial)

```http
PATCH /api/v1/hr/departments/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "description": "Updated description"
}
```

**Resposta (200 OK):** Departamento atualizado parcialmente

---

#### 6. Deletar Departamento

```http
DELETE /api/v1/hr/departments/{id}/
Authorization: Bearer {access_token}
```

**Resposta (204 No Content):** Departamento deletado com sucesso

**Erros:**

- `404 Not Found` - Departamento não encontrado
- `400 Bad Request` - Departamento possui funcionários vinculados

---

### 🏢 Companies (Empresas)

#### 1. Listar Empresas

```http
GET /api/v1/hr/companies/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `owner_id={id}` - Filtra por proprietário (employee_id)
- `active_only=true` - Filtra apenas empresas ativas

**Resposta (200 OK):**

```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "legal_name": "ABC LLC",
      "trade_name": "ABC",
      "company_type": "llc",
      "company_type_display": "LLC (Limited Liability Company)",
      "ein": "12-3456789",
      "address": "123 Main St",
      "city": "Orlando",
      "state": "FL",
      "zip_code": "32801",
      "country": "USA",
      "phone": "+1-555-1234",
      "email": "contact@abc.com",
      "website": "https://abc.com",
      "owner": 1,
      "owner_name": "John Doe",
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

**Tipos de empresa disponíveis:**

- `llc` - LLC (Limited Liability Company)
- `s_corp` - S-Corporation
- `c_corp` - C-Corporation
- `partnership` - Partnership
- `sole_proprietorship` - Sole Proprietorship
- `other` - Outro

---

#### 2. Criar Empresa

```http
POST /api/v1/hr/companies/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "legal_name": "XYZ S-Corp",
  "trade_name": "XYZ",
  "company_type": "s_corp",
  "ein": "98-7654321",
  "address": "456 Oak Ave",
  "city": "Miami",
  "state": "FL",
  "zip_code": "33101",
  "country": "USA",
  "phone": "+1-555-1234",
  "email": "contact@xyz.com",
  "website": "https://xyz.com",
  "owner": 1,
  "is_active": true
}
```

**Resposta (201 Created):** Empresa criada

**Validações:**

- `ein` deve ser único
- `ein` deve ter 9 ou 10 dígitos (sem hífens)

---

#### 3. Detalhes da Empresa

```http
GET /api/v1/hr/companies/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Mesmo formato do item na lista

---

#### 4. Atualizar Empresa

```http
PUT /api/v1/hr/companies/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "legal_name": "XYZ S-Corp Updated",
  ...
}
```

**Resposta (200 OK):** Empresa atualizada

---

#### 5. Atualizar Empresa (Parcial)

```http
PATCH /api/v1/hr/companies/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "is_active": false
}
```

**Resposta (200 OK):** Empresa atualizada parcialmente

---

#### 6. Deletar Empresa

```http
DELETE /api/v1/hr/companies/{id}/
Authorization: Bearer {access_token}
```

**Resposta (204 No Content):** Empresa deletada

---

### 👥 Employees (Funcionários)

#### 1. Listar Funcionários

```http
GET /api/v1/hr/employees/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `department_id={id}` - Filtra por departamento
- `status={status}` - Filtra por status (`active`, `on_leave`, `terminated`, `resigned`)
- `hire_type={type}` - Filtra por tipo de contratação (`individual`, `company`)
- `active_only=true` - Filtra apenas funcionários ativos

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "email": "employee@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe"
      },
      "employee_number": "EMP-000001",
      "date_of_birth": "1990-01-15",
      "cpf": "123.456.789-00",
      "ssn": "123-45-6789",
      "rg": "1234567",
      "marital_status": "Single",
      "nationality": "Brasileiro",
      "address": "123 Main St",
      "city": "Orlando",
      "state": "FL",
      "zip_code": "32801",
      "country": "Brasil",
      "emergency_contact_name": "Jane Doe",
      "emergency_contact_phone": "+1-555-5678",
      "emergency_contact_relation": "Spouse",
      "job_title": "Sales Manager",
      "department": 1,
      "department_name": "Sales",
      "supervisor": null,
      "supervisor_name": null,
      "contract_type": "w2_employee",
      "contract_type_display": "W2 Employee (Physical Person)",
      "hire_type": "individual",
      "hire_type_display": "Physical Person",
      "company": null,
      "company_name": null,
      "hire_date": "2024-01-01",
      "termination_date": null,
      "base_salary": "5000.00",
      "commission_percent": "5.00",
      "status": "active",
      "status_display": "Active",
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

**Tipos de contrato disponíveis:**

- `w2_employee` - W2 Employee (Pessoa Física)
- `1099_contractor` - 1099 Contractor (Empresa)
- `llc` - LLC
- `s_corp` - S-Corp
- `c_corp` - C-Corp
- `partnership` - Partnership
- `clt` - CLT (Brasil)
- `pj` - PJ (Brasil)
- `intern` - Estagiário
- `temporary` - Temporário

**Status disponíveis:**

- `active` - Ativo
- `on_leave` - Afastado
- `terminated` - Demitido
- `resigned` - Pediu Demissão

---

#### 2. Criar Funcionário

```http
POST /api/v1/hr/employees/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": 1,
  "date_of_birth": "1990-01-15",
  "cpf": "123.456.789-00",
  "ssn": "123-45-6789",
  "job_title": "Sales Representative",
  "department": 1,
  "supervisor": null,
  "contract_type": "w2_employee",
  "hire_type": "individual",
  "company": null,
  "hire_date": "2024-01-01",
  "base_salary": "3000.00",
  "commission_percent": "3.00",
  "status": "active"
}
```

**Resposta (201 Created):** Funcionário criado

**Nota:** O `employee_number` é gerado automaticamente (EMP-000001, EMP-000002, etc.)

**Validações:**

- `user_id` deve existir e não ter funcionário vinculado
- `hire_date` é obrigatório
- `base_salary` é obrigatório
- `job_title` é obrigatório

---

#### 3. Detalhes do Funcionário

```http
GET /api/v1/hr/employees/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Mesmo formato do item na lista

---

#### 4. Atualizar Funcionário

```http
PUT /api/v1/hr/employees/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "job_title": "Senior Sales Manager",
  "base_salary": "6000.00",
  ...
}
```

**Resposta (200 OK):** Funcionário atualizado

---

#### 5. Atualizar Funcionário (Parcial)

```http
PATCH /api/v1/hr/employees/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "on_leave"
}
```

**Resposta (200 OK):** Funcionário atualizado parcialmente

---

#### 6. Deletar Funcionário

```http
DELETE /api/v1/hr/employees/{id}/
Authorization: Bearer {access_token}
```

**Resposta (204 No Content):** Funcionário deletado

**Nota:** Deletar um funcionário também remove o relacionamento com o User, mas não deleta o User.

---

#### 7. Obter Funcionário por User ID (Ação Customizada)

```http
GET /api/v1/hr/employees/by_user/?user_id=1
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "employee@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "employee_number": "EMP-000001",
  "job_title": "Sales Manager",
  ...
}
```

**Erros:**

- `400 Bad Request` - `user_id` não fornecido
- `404 Not Found` - Funcionário não encontrado para este user_id

---

### 💼 Benefits (Benefícios)

#### 1. Listar Benefícios

```http
GET /api/v1/hr/benefits/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `benefit_type={type}` - Filtra por tipo (meal_voucher, food_voucher, transportation, health_insurance, etc.)
- `is_active={true/false}` - Filtra por status ativo
- `active_only=true` - Filtra apenas benefícios ativos

**Busca:** `search` - Busca em `name` e `description`

**Resposta (200 OK):**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Vale Refeição",
      "benefit_type": "meal_voucher",
      "benefit_type_display": "Vale Refeição",
      "description": "Vale refeição mensal",
      "value": "500.00",
      "limit": "600.00",
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Benefício

```http
POST /api/v1/hr/benefits/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Vale Alimentação",
  "benefit_type": "food_voucher",
  "description": "Vale alimentação mensal",
  "value": "400.00",
  "limit": "500.00",
  "is_active": true
}
```

**Resposta (201 Created):** Benefício criado

---

#### 3-6. CRUD Completo

- `GET /api/v1/hr/benefits/{id}/` - Detalhes
- `PUT /api/v1/hr/benefits/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/benefits/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/benefits/{id}/` - Deletar

---

### 👔 Employee Benefits (Benefícios do Funcionário)

#### 1. Listar Benefícios de Funcionários

```http
GET /api/v1/hr/employee-benefits/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário
- `benefit={id}` - Filtra por benefício
- `is_active={true/false}` - Filtra por status ativo
- `active_only=true` - Filtra apenas ativos

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "employee_name": "John Doe",
      "benefit": 1,
      "benefit_name": "Vale Refeição",
      "value": "500.00",
      "start_date": "2024-01-01",
      "end_date": null,
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2-6. CRUD Completo

- `POST /api/v1/hr/employee-benefits/` - Criar
- `GET /api/v1/hr/employee-benefits/{id}/` - Detalhes
- `PUT /api/v1/hr/employee-benefits/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/employee-benefits/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/employee-benefits/{id}/` - Deletar

---

### ⏰ Time Records (Registros de Ponto)

#### 1. Listar Registros de Ponto

```http
GET /api/v1/hr/time-records/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário
- `record_type={type}` - Filtra por tipo (check_in, check_out, lunch_in, lunch_out, overtime_in, overtime_out)
- `is_approved={true/false}` - Filtra por aprovação
- `record_date={date}` - Filtra por data (YYYY-MM-DD)

**Busca:** `search` - Busca em nome do funcionário e justificativa

**Ordenação:** `ordering` - Por `record_date`, `record_time`, `created_at`

**Resposta (200 OK):**

```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "employee_name": "John Doe",
      "record_type": "check_in",
      "record_type_display": "Entrada",
      "record_date": "2025-11-14",
      "record_time": "09:00:00",
      "latitude": "-28.123456",
      "longitude": "-52.654321",
      "is_approved": false,
      "approved_by": null,
      "approved_at": null,
      "justification": null,
      "created_at": "2025-11-14T09:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Registro de Ponto

```http
POST /api/v1/hr/time-records/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employee": 1,
  "record_type": "check_in",
  "record_date": "2025-11-14",
  "record_time": "09:00:00",
  "latitude": "-28.123456",
  "longitude": "-52.654321",
  "is_approved": false
}
```

**Resposta (201 Created):** Registro de ponto criado

---

#### 3-6. CRUD Completo

- `GET /api/v1/hr/time-records/{id}/` - Detalhes
- `PUT /api/v1/hr/time-records/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/time-records/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/time-records/{id}/` - Deletar

---

#### 7. Aprovar Registro de Ponto

```http
POST /api/v1/hr/time-records/{id}/approve/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Registro aprovado

**Nota:** Aprova automaticamente o registro, definindo `is_approved=True`, `approved_by=usuário atual` e `approved_at=agora`.

---

### 🏖️ Vacations (Férias)

#### 1. Listar Solicitações de Férias

```http
GET /api/v1/hr/vacations/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário
- `status={status}` - Filtra por status (requested, approved, rejected, taken, cancelled)

**Resposta (200 OK):**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "employee_name": "John Doe",
      "status": "requested",
      "status_display": "Solicitado",
      "start_date": "2025-12-01",
      "end_date": "2025-12-15",
      "days": 15,
      "acquisition_period_start": "2024-01-01",
      "acquisition_period_end": "2024-12-31",
      "sell_days": 0,
      "cash_allowance": false,
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "requested_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2. Criar Solicitação de Férias

```http
POST /api/v1/hr/vacations/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employee": 1,
  "status": "requested",
  "start_date": "2025-12-01",
  "end_date": "2025-12-15",
  "days": 15,
  "acquisition_period_start": "2024-01-01",
  "acquisition_period_end": "2024-12-31",
  "sell_days": 0,
  "cash_allowance": false
}
```

**Resposta (201 Created):** Solicitação de férias criada

---

#### 3-6. CRUD Completo

- `GET /api/v1/hr/vacations/{id}/` - Detalhes
- `PUT /api/v1/hr/vacations/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/vacations/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/vacations/{id}/` - Deletar

---

#### 7. Aprovar Férias

```http
POST /api/v1/hr/vacations/{id}/approve/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Férias aprovadas

**Nota:** Define `status=approved`, `approved_by=usuário atual` e `approved_at=agora`.

---

#### 8. Rejeitar Férias

```http
POST /api/v1/hr/vacations/{id}/reject/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rejection_reason": "Período indisponível"
}
```

**Resposta (200 OK):** Férias rejeitadas

**Nota:** Define `status=rejected`, `approved_by=usuário atual`, `approved_at=agora` e `rejection_reason`.

---

### 📊 Performance Reviews (Avaliações de Desempenho)

#### 1. Listar Avaliações

```http
GET /api/v1/hr/performance-reviews/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário avaliado
- `reviewer={id}` - Filtra por avaliador
- `status={status}` - Filtra por status (draft, completed, cancelled)

**Busca:** `search` - Busca em nome do funcionário e avaliador

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "employee_name": "John Doe",
      "reviewer": 2,
      "reviewer_name": "Jane Smith",
      "review_period_start": "2024-01-01",
      "review_period_end": "2024-12-31",
      "review_date": "2025-01-15",
      "status": "completed",
      "status_display": "Concluída",
      "criteria_scores": {
        "quality": 8.5,
        "productivity": 9.0,
        "communication": 8.0
      },
      "overall_score": "8.50",
      "strengths": "Excelente trabalho em equipe",
      "areas_for_improvement": "Comunicação",
      "goals": "Melhorar comunicação",
      "development_plan": "Curso de comunicação",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### 2-6. CRUD Completo

- `POST /api/v1/hr/performance-reviews/` - Criar
- `GET /api/v1/hr/performance-reviews/{id}/` - Detalhes
- `PUT /api/v1/hr/performance-reviews/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/performance-reviews/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/performance-reviews/{id}/` - Deletar

---

### 📚 Trainings (Treinamentos)

#### 1. Listar Treinamentos

```http
GET /api/v1/hr/trainings/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `training_type={type}` - Filtra por tipo (Internal, External, Online, Workshop, Seminar)
- `is_active={true/false}` - Filtra por status ativo
- `provides_certificate={true/false}` - Filtra por certificado
- `active_only=true` - Filtra apenas ativos

**Busca:** `search` - Busca em `name`, `description`, `instructor`, `location`

**Ordenação:** `ordering` - Por `start_date`, `name`, `created_at`

**Resposta (200 OK):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "Curso de Vendas",
      "description": "Treinamento em técnicas de vendas",
      "training_type": "Internal",
      "training_type_display": "Interno",
      "start_date": "2025-12-01",
      "end_date": "2025-12-14",
      "duration_hours": 40,
      "location": "Sala de Treinamento",
      "instructor": "João Silva",
      "provides_certificate": true,
      "certificate_validity_months": 12,
      "is_active": true,
      "created_at": "2025-11-14T10:00:00Z",
      "updated_at": "2025-11-14T10:00:00Z"
    }
  ]
}
```

---

#### 2-6. CRUD Completo

- `POST /api/v1/hr/trainings/` - Criar
- `GET /api/v1/hr/trainings/{id}/` - Detalhes
- `PUT /api/v1/hr/trainings/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/trainings/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/trainings/{id}/` - Deletar

---

#### 7. Inscrever Funcionário em Treinamento

```http
POST /api/v1/hr/trainings/{id}/enroll/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employee_id": 1
}
```

**Resposta (201 Created):** Funcionário inscrito no treinamento

**Nota:** Cria um registro em `EmployeeTraining` com `status=enrolled`.

---

### 🎓 Employee Trainings (Treinamentos do Funcionário)

#### 1. Listar Treinamentos de Funcionários

```http
GET /api/v1/hr/employee-trainings/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário
- `training={id}` - Filtra por treinamento
- `status={status}` - Filtra por status (enrolled, in_progress, completed, cancelled, failed)
- `certificate_issued={true/false}` - Filtra por certificado emitido

**Resposta (200 OK):**

```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "employee_name": "John Doe",
      "training": 1,
      "training_name": "Curso de Vendas",
      "status": "completed",
      "status_display": "Concluído",
      "enrollment_date": "2025-11-01",
      "completion_date": "2025-12-14",
      "score": "95.00",
      "certificate_issued": true,
      "certificate_issued_date": "2025-12-15",
      "certificate_expiry_date": "2026-12-15",
      "notes": "Excelente desempenho",
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-12-15T10:00:00Z"
    }
  ]
}
```

---

#### 2. Detalhes do Treinamento do Funcionário

```http
GET /api/v1/hr/employee-trainings/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Mesmo formato do item na lista

**Nota:** Este endpoint é read-only. Para atualizar, use os endpoints de `Trainings` ou `Employees`.

---

### 💼 Job Openings (Vagas)

#### 1. Listar Vagas

```http
GET /api/v1/hr/job-openings/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `department={id}` - Filtra por departamento
- `status={status}` - Filtra por status (open, closed, cancelled)
- `open_only=true` - Filtra apenas vagas abertas

**Busca:** `search` - Busca em `title`, `description`, `requirements`

**Resposta (200 OK):**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Desenvolvedor Python",
      "department": 1,
      "department_name": "IT",
      "description": "Vaga para desenvolvedor Python sênior",
      "requirements": "Python, Django, REST API",
      "salary_min": "8000.00",
      "salary_max": "12000.00",
      "posted_date": "2025-11-01",
      "closing_date": "2025-12-31",
      "status": "open",
      "status_display": "Aberta",
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

#### 2-6. CRUD Completo

- `POST /api/v1/hr/job-openings/` - Criar
- `GET /api/v1/hr/job-openings/{id}/` - Detalhes
- `PUT /api/v1/hr/job-openings/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/job-openings/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/job-openings/{id}/` - Deletar

---

### 👥 Candidates (Candidatos)

#### 1. Listar Candidatos

```http
GET /api/v1/hr/candidates/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `job_opening={id}` - Filtra por vaga
- `status={status}` - Filtra por status (applied, screening, interview, test, approved, rejected, hired)

**Busca:** `search` - Busca em `first_name`, `last_name`, `email`, `phone`, `notes`

**Resposta (200 OK):**

```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "first_name": "João",
      "last_name": "Silva",
      "full_name": "João Silva",
      "email": "joao@example.com",
      "phone": "11999999999",
      "job_opening": 1,
      "job_opening_title": "Desenvolvedor Python",
      "status": "applied",
      "status_display": "Candidatou-se",
      "resume": "/media/resumes/joao_silva.pdf",
      "notes": "Candidato interessado",
      "applied_at": "2025-11-10T10:00:00Z",
      "updated_at": "2025-11-10T10:00:00Z"
    }
  ]
}
```

---

#### 2-6. CRUD Completo

- `POST /api/v1/hr/candidates/` - Criar
- `GET /api/v1/hr/candidates/{id}/` - Detalhes
- `PUT /api/v1/hr/candidates/{id}/` - Atualizar (completo)
- `PATCH /api/v1/hr/candidates/{id}/` - Atualizar (parcial)
- `DELETE /api/v1/hr/candidates/{id}/` - Deletar

---

### 💰 Payroll (Folha de Pagamento)

#### 1. Listar Folhas de Pagamento

```http
GET /api/v1/hr/payroll/
Authorization: Bearer {access_token}
```

**Filtros disponíveis:**

- `employee={id}` - Filtra por funcionário
- `month={1-12}` - Filtra por mês
- `year={year}` - Filtra por ano
- `is_processed={true/false}` - Filtra por processado

**Resposta (200 OK):**

```json
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "payroll_number": "PAY-2024-11-EMP-000001",
      "employee": 1,
      "employee_name": "John Doe",
      "month": 11,
      "year": 2024,
      "base_salary": "5000.00",
      "commissions": "500.00",
      "overtime": "200.00",
      "bonuses": "300.00",
      "benefits_value": "500.00",
      "total_earnings": "6500.00",
      "inss": "500.00",
      "irrf": "300.00",
      "fgts": "400.00",
      "transportation": "200.00",
      "meal_voucher": "100.00",
      "loans": "0.00",
      "advances": "0.00",
      "other_deductions": "0.00",
      "total_deductions": "1500.00",
      "net_salary": "5000.00",
      "is_processed": true,
      "processed_at": "2025-11-05T10:00:00Z",
      "created_at": "2025-11-05T10:00:00Z",
      "updated_at": "2025-11-05T10:00:00Z"
    }
  ]
}
```

---

#### 2. Detalhes da Folha de Pagamento

```http
GET /api/v1/hr/payroll/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):** Mesmo formato do item na lista

**Nota:** Este endpoint é read-only. Para criar/atualizar folhas, use a ação `process`.

---

#### 3. Processar Folha de Pagamento

```http
POST /api/v1/hr/payroll/process/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employee_ids": [1, 2, 3],
  "month": 11,
  "year": 2024
}
```

**Resposta (200 OK):**

```json
{
  "message": "Folha de pagamento processada com sucesso",
  "processed": 3,
  "payrolls": [
    {
      "id": 1,
      "payroll_number": "PAY-2024-11-EMP-000001",
      "employee": 1,
      "net_salary": "5000.00"
    }
  ]
}
```

**Nota:** Cria ou atualiza folhas de pagamento para os funcionários especificados, calculando automaticamente `total_earnings`, `total_deductions` e `net_salary`.

---

### 📊 Resumo de Endpoints HR

| Recurso                 | Método | Endpoint                                     | Descrição                        |
| ----------------------- | ------ | -------------------------------------------- | -------------------------------- |
| **Departments**         | GET    | `/api/v1/hr/departments/`                    | Listar departamentos             |
|                         | POST   | `/api/v1/hr/departments/`                    | Criar departamento               |
|                         | GET    | `/api/v1/hr/departments/{id}/`               | Detalhes                         |
|                         | PUT    | `/api/v1/hr/departments/{id}/`               | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/departments/{id}/`               | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/departments/{id}/`               | Deletar                          |
| **Companies**           | GET    | `/api/v1/hr/companies/`                      | Listar empresas                  |
|                         | POST   | `/api/v1/hr/companies/`                      | Criar empresa                    |
|                         | GET    | `/api/v1/hr/companies/{id}/`                 | Detalhes                         |
|                         | PUT    | `/api/v1/hr/companies/{id}/`                 | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/companies/{id}/`                 | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/companies/{id}/`                 | Deletar                          |
| **Employees**           | GET    | `/api/v1/hr/employees/`                      | Listar funcionários              |
|                         | POST   | `/api/v1/hr/employees/`                      | Criar funcionário                |
|                         | GET    | `/api/v1/hr/employees/{id}/`                 | Detalhes                         |
|                         | PUT    | `/api/v1/hr/employees/{id}/`                 | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/employees/{id}/`                 | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/employees/{id}/`                 | Deletar                          |
|                         | GET    | `/api/v1/hr/employees/by_user/?user_id={id}` | Por user_id                      |
| **Benefits**            | GET    | `/api/v1/hr/benefits/`                       | Listar benefícios                |
|                         | POST   | `/api/v1/hr/benefits/`                       | Criar benefício                  |
|                         | GET    | `/api/v1/hr/benefits/{id}/`                  | Detalhes                         |
|                         | PUT    | `/api/v1/hr/benefits/{id}/`                  | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/benefits/{id}/`                  | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/benefits/{id}/`                  | Deletar                          |
| **Employee Benefits**   | GET    | `/api/v1/hr/employee-benefits/`              | Listar benefícios funcionários   |
|                         | POST   | `/api/v1/hr/employee-benefits/`              | Criar benefício funcionário      |
|                         | GET    | `/api/v1/hr/employee-benefits/{id}/`         | Detalhes                         |
|                         | PUT    | `/api/v1/hr/employee-benefits/{id}/`         | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/employee-benefits/{id}/`         | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/employee-benefits/{id}/`         | Deletar                          |
| **Time Records**        | GET    | `/api/v1/hr/time-records/`                   | Listar registros de ponto        |
|                         | POST   | `/api/v1/hr/time-records/`                   | Criar registro de ponto          |
|                         | GET    | `/api/v1/hr/time-records/{id}/`              | Detalhes                         |
|                         | PUT    | `/api/v1/hr/time-records/{id}/`              | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/time-records/{id}/`              | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/time-records/{id}/`              | Deletar                          |
|                         | POST   | `/api/v1/hr/time-records/{id}/approve/`      | Aprovar registro                 |
| **Vacations**           | GET    | `/api/v1/hr/vacations/`                      | Listar férias                    |
|                         | POST   | `/api/v1/hr/vacations/`                      | Criar solicitação de férias      |
|                         | GET    | `/api/v1/hr/vacations/{id}/`                 | Detalhes                         |
|                         | PUT    | `/api/v1/hr/vacations/{id}/`                 | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/vacations/{id}/`                 | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/vacations/{id}/`                 | Deletar                          |
|                         | POST   | `/api/v1/hr/vacations/{id}/approve/`         | Aprovar férias                   |
|                         | POST   | `/api/v1/hr/vacations/{id}/reject/`          | Rejeitar férias                  |
| **Performance Reviews** | GET    | `/api/v1/hr/performance-reviews/`            | Listar avaliações                |
|                         | POST   | `/api/v1/hr/performance-reviews/`            | Criar avaliação                  |
|                         | GET    | `/api/v1/hr/performance-reviews/{id}/`       | Detalhes                         |
|                         | PUT    | `/api/v1/hr/performance-reviews/{id}/`       | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/performance-reviews/{id}/`       | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/performance-reviews/{id}/`       | Deletar                          |
| **Trainings**           | GET    | `/api/v1/hr/trainings/`                      | Listar treinamentos              |
|                         | POST   | `/api/v1/hr/trainings/`                      | Criar treinamento                |
|                         | GET    | `/api/v1/hr/trainings/{id}/`                 | Detalhes                         |
|                         | PUT    | `/api/v1/hr/trainings/{id}/`                 | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/trainings/{id}/`                 | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/trainings/{id}/`                 | Deletar                          |
|                         | POST   | `/api/v1/hr/trainings/{id}/enroll/`          | Inscrever funcionário            |
| **Employee Trainings**  | GET    | `/api/v1/hr/employee-trainings/`             | Listar treinamentos funcionários |
|                         | GET    | `/api/v1/hr/employee-trainings/{id}/`        | Detalhes (read-only)             |
| **Job Openings**        | GET    | `/api/v1/hr/job-openings/`                   | Listar vagas                     |
|                         | POST   | `/api/v1/hr/job-openings/`                   | Criar vaga                       |
|                         | GET    | `/api/v1/hr/job-openings/{id}/`              | Detalhes                         |
|                         | PUT    | `/api/v1/hr/job-openings/{id}/`              | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/job-openings/{id}/`              | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/job-openings/{id}/`              | Deletar                          |
| **Candidates**          | GET    | `/api/v1/hr/candidates/`                     | Listar candidatos                |
|                         | POST   | `/api/v1/hr/candidates/`                     | Criar candidato                  |
|                         | GET    | `/api/v1/hr/candidates/{id}/`                | Detalhes                         |
|                         | PUT    | `/api/v1/hr/candidates/{id}/`                | Atualizar (completo)             |
|                         | PATCH  | `/api/v1/hr/candidates/{id}/`                | Atualizar (parcial)              |
|                         | DELETE | `/api/v1/hr/candidates/{id}/`                | Deletar                          |
| **Payroll**             | GET    | `/api/v1/hr/payroll/`                        | Listar folhas de pagamento       |
|                         | GET    | `/api/v1/hr/payroll/{id}/`                   | Detalhes (read-only)             |
|                         | POST   | `/api/v1/hr/payroll/process/`                | Processar folha de pagamento     |

---

## 🔄 Changelog

### 2025-11-14

- ✅ Documentação inicial criada
- ✅ Todos os endpoints documentados
- ✅ Exemplos de uso adicionados
- ✅ Códigos de status documentados
- ✅ **NOVO:** APIs de Roles e Permissions adicionadas
- ✅ **NOVO:** APIs de HR (Recursos Humanos) adicionadas
- ✅ **ATUALIZADO:** Seção HR completa com todos os 57 endpoints implementados
- ✅ **COMPLETO:** Todos os endpoints HR documentados (Benefits, Employee Benefits, Time Records, Vacations, Performance Reviews, Trainings, Employee Trainings, Job Openings, Candidates, Payroll)
- ✅ **AÇÕES CUSTOMIZADAS:** Documentadas ações approve, reject, enroll, process, by_user

---

**⚠️ IMPORTANTE:** Este documento deve ser atualizado sempre que:

- Novos endpoints forem criados
- Endpoints forem modificados ou removidos
- Novos parâmetros forem adicionados
- Formato de resposta mudar
