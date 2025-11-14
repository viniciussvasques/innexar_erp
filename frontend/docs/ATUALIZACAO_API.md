# 🔄 Atualização da API - Sincronização Frontend

**Data:** 2025-11-13  
**Versão:** 1.0.0

## 📋 Resumo

Este documento registra as atualizações feitas no frontend para sincronizar com as mudanças na API do backend.

---

## ✅ Mudanças Implementadas

### 1. Endpoint de Refresh Token

**Antes:**
```typescript
POST /api/v1/auth/refresh/
Response: { access: string }
```

**Depois:**
```typescript
POST /api/v1/public/auth/token/refresh/
Response: { access: string, refresh: string }
```

**Arquivos Atualizados:**
- `lib/api/auth.ts` - Endpoint atualizado
- `lib/api/client.ts` - Interceptor atualizado para salvar novo refresh token

**Mudanças:**
- ✅ Endpoint mudou para `/api/v1/public/auth/token/refresh/`
- ✅ Agora retorna `refresh` também (token rotacionado)
- ✅ Interceptor salva o novo refresh token automaticamente

---

### 2. Modelo de User

**Mudanças:**
- Adicionado `username?: string`
- Adicionado `first_name?: string`
- Adicionado `last_name?: string`
- `role` agora é opcional
- `tenant` agora é opcional (pode vir separado)

**Arquivo Atualizado:**
- `types/api.ts`

---

### 3. Modelo de AuthResponse

**Mudanças:**
- Adicionado `tenant?: Tenant` (pode vir separado do user)

**Arquivo Atualizado:**
- `types/api.ts`

---

### 4. Modelo de Lead

**Mudanças:**
- Adicionado `owner?: number` (ID do usuário)
- Adicionado `owner_name?: string`
- `source` agora inclui: `'cold_call' | 'event'`
- Mantido `assigned_to?: User` para compatibilidade

**Arquivo Atualizado:**
- `types/api.ts`

---

### 5. Modelo de Contact

**Mudanças:**
- Adicionado `mobile?: string`
- Adicionado `address?: string`
- Adicionado `city?: string`
- Adicionado `state?: string`
- Adicionado `country?: string`
- Adicionado `zip_code?: string`
- Adicionado `linkedin?: string`
- Adicionado `twitter?: string`
- Adicionado `notes?: string`
- `tags` agora pode ser `string | string[]`
- Adicionado `is_customer?: boolean`
- Adicionado `converted_from_lead?: number`
- Adicionado `converted_from_lead_name?: string`
- Adicionado `owner?: number`
- Adicionado `owner_name?: string`
- Adicionado `updated_at?: string`

**Arquivo Atualizado:**
- `types/api.ts`

---

### 6. Modelo de Deal

**Mudanças:**
- Adicionado `description?: string`
- `value` renomeado para `amount`
- Adicionado `expected_revenue?: string`
- `stage` agora inclui: `'prospecting' | 'qualification'`
- `contact` agora é `number` (ID) ao invés de objeto
- Adicionado `contact_name?: string`
- Adicionado `owner?: number`
- Adicionado `owner_name?: string`
- Adicionado `actual_close_date?: string`
- Mantido `contact_obj?: Contact` e `assigned_to?: User` para compatibilidade

**Arquivo Atualizado:**
- `types/api.ts`

---

### 7. Modelo de Activity

**Mudanças:**
- `type` renomeado para `activity_type` (mantido `type` para compatibilidade)
- Adicionado tipos: `'note' | 'whatsapp'`
- `completed` renomeado para `status: 'planned' | 'completed' | 'canceled'`
- `related_to_type` e `related_to_id` substituídos por campos específicos:
  - `lead?: number | null`
  - `lead_name?: string | null`
  - `contact?: number | null`
  - `contact_name?: string | null`
  - `deal?: number | null`
  - `deal_title?: string | null`
- `due_date` renomeado para `scheduled_at` (mantido `due_date` para compatibilidade)
- Adicionado `owner?: number`
- Adicionado `owner_name?: string`
- Adicionado `updated_at?: string`

**Arquivo Atualizado:**
- `types/api.ts`
- `lib/api/crm.ts` - `getActivities` agora retorna `PaginatedResponse<Activity>`
- `lib/api/crm.ts` - Adicionado `updateActivity` e `deleteActivity`

---

### 8. Endpoints Adicionados

**CRM:**
- `GET /api/v1/crm/deals/pipeline/` - Visão geral do pipeline
- `PATCH /api/v1/crm/activities/{id}/` - Atualizar activity
- `DELETE /api/v1/crm/activities/{id}/` - Deletar activity

**Arquivo Atualizado:**
- `lib/api/crm.ts`

---

### 9. Parâmetros de Query Atualizados

**Leads:**
- Adicionado `source?: string`
- Adicionado `owner?: number`
- Adicionado `created_after?: string`
- Adicionado `created_before?: string`
- Adicionado `ordering?: string`

**Contacts:**
- Adicionado `is_customer?: boolean`
- Adicionado `owner?: number`

**Deals:**
- Adicionado `owner?: number`
- Adicionado `contact?: number`
- Adicionado `search?: string`
- Adicionado `ordering?: string`

**Activities:**
- Adicionado `activity_type?: string`
- Adicionado `status?: string`
- Adicionado `owner?: number`
- Adicionado `lead?: number`
- Adicionado `contact?: number`
- Adicionado `deal?: number`
- Adicionado `search?: string`
- Adicionado `ordering?: string`

**Arquivo Atualizado:**
- `lib/api/crm.ts`

---

## 🔍 Verificações Realizadas

### Endpoints de Autenticação

- ✅ Login: `/api/v1/public/auth/login/` - OK
- ✅ Refresh: `/api/v1/public/auth/token/refresh/` - **ATUALIZADO**
- ✅ Logout: `/api/v1/auth/logout/` - OK
- ✅ Reset Password: `/api/v1/public/auth/password/reset/` - OK
- ✅ Confirm Reset: `/api/v1/public/auth/password/reset/confirm/` - OK
- ✅ Register: `/api/v1/public/tenants/` - OK

### Endpoints de CRM

- ✅ Leads: Todos os endpoints OK
- ✅ Contacts: Todos os endpoints OK
- ✅ Deals: Todos os endpoints OK
- ✅ Activities: Todos os endpoints OK

---

## 📝 Notas Importantes

### Refresh Token Rotacionado

O backend agora implementa **refresh token rotation**, ou seja, a cada renovação:
1. Um novo `access` token é gerado
2. Um novo `refresh` token é gerado
3. O `refresh` token antigo é invalidado

O interceptor do frontend foi atualizado para:
- Salvar automaticamente o novo `refresh` token
- Garantir que sempre temos o token mais recente

### Compatibilidade

Os tipos foram atualizados mantendo campos antigos como opcionais para garantir compatibilidade durante a transição.

---

## 🚀 Próximos Passos

1. ✅ Endpoint de refresh token atualizado
2. ✅ Tipos atualizados
3. ⏳ Testar refresh token rotation
4. ⏳ Verificar se há outros endpoints que mudaram
5. ⏳ Atualizar documentação se necessário

---

**Última atualização:** 2025-11-13

