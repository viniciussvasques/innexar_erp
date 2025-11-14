# ⚙️ Configuração da API - Innexar ERP Frontend

**Última atualização:** 2025-11-13  
**Versão:** 1.0.0

## 📋 Visão Geral

Este documento descreve como configurar e usar a API no frontend do Innexar ERP.

---

## 🔧 Configuração de Variáveis de Ambiente

### Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe (opcional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=
```

### URLs por Ambiente

#### Desenvolvimento

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Produção

```env
NEXT_PUBLIC_API_URL=https://api.innexar.app
```

---

## 📡 Cliente API

### Localização

O cliente API está em `lib/api/client.ts` e usa **Axios** para fazer requisições HTTP.

### Configuração Base

```typescript
import apiClient from '@/lib/api/client'

// Todas as requisições usam automaticamente:
// - baseURL: process.env.NEXT_PUBLIC_API_URL
// - Content-Type: application/json
// - Authorization: Bearer {token} (se autenticado)
// - Accept-Language: {locale} (en | pt-BR | es)
```

### Interceptors

#### Request Interceptor

Adiciona automaticamente:

- **Authorization header** com o token JWT (se disponível)
- **Accept-Language header** baseado no locale do usuário

```typescript
// Exemplo de requisição
apiClient.get('/api/v1/crm/leads/')
// Headers enviados:
// Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
// Accept-Language: pt-BR
// Content-Type: application/json
```

#### Response Interceptor

Trata automaticamente:

- **401 Unauthorized**: Tenta refresh token automaticamente
- **Token expirado**: Renova token e repete requisição
- **Refresh falhou**: Limpa autenticação e redireciona para login

---

## 🔐 Autenticação

### Login

```typescript
import { authApi } from '@/lib/api/auth'

const response = await authApi.login({
  email: 'user@example.com',
  password: 'password123',
})

// Response:
// {
//   access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
//   refresh: "eyJ0eXAiOiJKV1QiLCJhbGc...",
//   user: { id, email, name, role, tenant }
// }
```

### Refresh Token Automático

O interceptor do Axios renova automaticamente o token quando expira:

1. Requisição retorna **401**
2. Interceptor captura o erro
3. Faz requisição para `/api/v1/auth/refresh/` com o refresh token
4. Atualiza o access token no localStorage
5. Repete a requisição original com o novo token

### Logout

```typescript
import { authApi } from '@/lib/api/auth'

await authApi.logout()
// Limpa tokens e redireciona para login
```

---

## 📦 Módulos de API

### CRM

```typescript
import { crmApi } from '@/lib/api/crm'

// Leads
const leads = await crmApi.getLeads({ page: 1, page_size: 50 })
const lead = await crmApi.getLead(1)
const newLead = await crmApi.createLead({ name: 'John', email: 'john@example.com' })
await crmApi.updateLead(1, { status: 'contacted' })
await crmApi.deleteLead(1)

// Contacts
const contacts = await crmApi.getContacts()
const contact = await crmApi.createContact({ name: 'Jane', email: 'jane@example.com' })

// Deals
const deals = await crmApi.getDeals({ stage: 'proposal' })
const deal = await crmApi.createDeal({ title: 'Deal 1', contact_id: 1, value: '1000.00' })
await crmApi.markDealWon(1)
await crmApi.markDealLost(1, 'Price too high')

// Activities
const activities = await crmApi.getActivities({ completed: false })
const activity = await crmApi.createActivity({ type: 'call', subject: 'Follow-up' })
await crmApi.completeActivity(1)
```

---

## 🛡️ Proteção de Rotas

### Componente ProtectedRoute

Todas as rotas protegidas devem usar o componente `ProtectedRoute`:

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Conteúdo protegido */}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
```

### Comportamento

- Verifica se o usuário está autenticado
- Verifica se há token válido no localStorage
- Redireciona para `/` (login) se não autenticado
- Mostra loading enquanto verifica autenticação

---

## ❌ Tratamento de Erros

### Erros Comuns

#### 401 Unauthorized

```typescript
// Tratado automaticamente pelo interceptor
// Tenta refresh token, se falhar redireciona para login
```

#### 400 Bad Request

```typescript
try {
  await crmApi.createLead(data)
} catch (error: any) {
  if (error.response?.status === 400) {
    const errors = error.response.data
    // errors = { email: ["Este campo é obrigatório."] }
  }
}
```

#### 403 Forbidden

```typescript
// Usuário não tem permissão
// Logado no console, requisição rejeitada
```

#### 404 Not Found

```typescript
// Recurso não encontrado
// Logado no console, requisição rejeitada
```

#### 500 Internal Server Error

```typescript
// Erro no servidor
// Logado no console, requisição rejeitada
```

#### Network Error

```typescript
// Sem conexão com o servidor
// Logado no console, requisição rejeitada
```

### Exemplo de Tratamento Completo

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true)
    setError(null)

    const response = await crmApi.createLead(data)
    // Sucesso
    toast.success('Lead criado com sucesso!')
    router.push('/crm/leads')
  } catch (err: any) {
    if (err.response?.status === 400) {
      // Erros de validação
      const errors = err.response.data
      setError(errors.email?.[0] || errors.name?.[0] || 'Erro de validação')
    } else if (err.response?.status === 401) {
      // Não autenticado (já tratado pelo interceptor)
      setError('Sessão expirada. Faça login novamente.')
    } else if (err.message === 'Network Error') {
      setError('Erro de conexão. Verifique sua internet.')
    } else {
      setError('Erro ao criar lead. Tente novamente.')
    }
  } finally {
    setLoading(false)
  }
}
```

---

## 🌍 Internacionalização

### Headers de Idioma

O cliente API envia automaticamente o header `Accept-Language` baseado no locale do usuário:

- `en` → `Accept-Language: en`
- `pt` → `Accept-Language: pt-BR`
- `es` → `Accept-Language: es`

### Respostas Traduzidas

O backend retorna mensagens de erro traduzidas baseadas no header `Accept-Language`:

```typescript
// Request com locale pt-BR
// Response 400:
{
  "email": ["Este campo é obrigatório."],
  "name": ["Certifique-se de que este campo não tenha mais de 100 caracteres."]
}
```

---

## 📊 Paginação

### Formato Padrão

Todas as listagens retornam no formato:

```typescript
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

### Exemplo de Uso

```typescript
const response = await crmApi.getLeads({ page: 1, page_size: 50 })

console.log(response.count) // 150
console.log(response.next) // "http://localhost:8000/api/v1/crm/leads/?page=2"
console.log(response.previous) // null
console.log(response.results) // [Lead, Lead, ...]
```

---

## 🔍 Filtros e Busca

### Query Params

```typescript
// Busca simples
const leads = await crmApi.getLeads({ search: 'john' })

// Filtros múltiplos
const leads = await crmApi.getLeads({
  status: 'new,contacted',
  score_min: 70,
  score_max: 100,
  page: 1,
  page_size: 50,
})

// Ordenação
const leads = await crmApi.getLeads({
  ordering: '-score', // - para descendente
})
```

---

## 🧪 Testes

### Mock do Cliente API

Para testes, você pode mockar o cliente API:

```typescript
import { crmApi } from '@/lib/api/crm'

jest.mock('@/lib/api/crm', () => ({
  crmApi: {
    getLeads: jest.fn().mockResolvedValue({
      count: 10,
      results: [{ id: 1, name: 'Test Lead' }],
    }),
  },
}))
```

---

## 📝 Checklist de Implementação

Ao criar um novo módulo de API:

- [ ] Criar arquivo em `lib/api/{module}.ts`
- [ ] Definir tipos TypeScript em `types/api.ts`
- [ ] Implementar funções CRUD básicas
- [ ] Adicionar tratamento de erros
- [ ] Adicionar traduções (se necessário)
- [ ] Escrever testes unitários
- [ ] Documentar endpoints usados
- [ ] Atualizar este documento

---

## 🚀 Próximos Passos

1. ✅ Cliente API configurado
2. ✅ Interceptors de autenticação
3. ✅ Proteção de rotas
4. 🔄 Componentes UI (Toast, Modal, DataTable)
5. 🔄 CRUD completo de CRM
6. ⏳ Analytics API
7. ⏳ Financeiro API
8. ⏳ Faturamento API

---

**Última atualização:** 2025-11-13
