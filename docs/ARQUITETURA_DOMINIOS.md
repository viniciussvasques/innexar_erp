# 🌐 Arquitetura de Domínios - innexar.app

## 📋 ESTRUTURA ÚNICA DE DOMÍNIO

O Innexar ERP usa **innexar.app** como domínio único com subdomínios para diferentes contextos:

```
┌─────────────────────────────────────────────────────────────┐
│                      innexar.app                            │
│              (Site Institucional Principal)                 │
│                                                             │
│  • Landing page multilíngue (en/pt/es)                     │
│  • Pricing e planos                                        │
│  • Blog e recursos                                         │
│  • Registro de novos tenants                               │
│  • Documentação pública                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  admin.innexar.app                          │
│               (Painel Administrativo)                       │
│                                                             │
│  • Gerenciar todos os tenants                              │
│  • Analytics e métricas globais                            │
│  • Billing e faturamento consolidado                       │
│  • Support tickets de todos clientes                       │
│  • Configurações da plataforma                             │
│  • Logs e auditoria                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              {tenant}.innexar.app                           │
│                 (Apps dos Clientes)                         │
│                                                             │
│  • acme.innexar.app       → ACME Corporation               │
│  • techcorp.innexar.app   → Tech Corp                      │
│  • startup.innexar.app    → StartUp Inc                    │
│  • cada cliente tem seu próprio subdomínio                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ CONFIGURAÇÃO TÉCNICA

### Backend Django (Multi-tenancy)

```python
# config/settings.py

# Tenant settings
TENANT_MODEL = "apps.tenants.Tenant"
TENANT_DOMAIN_MODEL = "apps.tenants.Domain"

# URLs por contexto
ROOT_URLCONF = 'config.urls'                    # Tenant apps
PUBLIC_SCHEMA_URLCONF = 'config.urls_public'    # Landing page
ADMIN_SCHEMA_URLCONF = 'config.urls_admin'      # Admin panel

# Allowed hosts
ALLOWED_HOSTS = [
    'innexar.app',
    '*.innexar.app',           # Wildcard para subdomínios
    'localhost',
    '*.localhost',
]

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://innexar.app',
    'https://admin.innexar.app',
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.innexar\.app$',  # Qualquer subdomínio
]
```

### Frontend Next.js (Detecção de Contexto)

```typescript
// lib/utils/context.ts

export type AppContext = 'public' | 'admin' | 'tenant'

export function getAppContext(): {
  context: AppContext
  tenantSlug?: string
  locale: string
} {
  if (typeof window === 'undefined') {
    // Server-side
    const hostname = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
    return parseHostname(hostname)
  }
  
  // Client-side
  return parseHostname(window.location.hostname)
}

function parseHostname(hostname: string) {
  // Remove porta se tiver
  const domain = hostname.split(':')[0]
  
  // Desenvolvimento
  if (domain === 'localhost') {
    return { context: 'public' as AppContext, locale: 'en' }
  }
  if (domain === 'admin.localhost') {
    return { context: 'admin' as AppContext, locale: 'en' }
  }
  if (domain.endsWith('.localhost')) {
    const slug = domain.replace('.localhost', '')
    return { 
      context: 'tenant' as AppContext, 
      tenantSlug: slug,
      locale: 'en' 
    }
  }
  
  // Produção
  if (domain === 'innexar.app') {
    return { context: 'public' as AppContext, locale: 'en' }
  }
  if (domain === 'admin.innexar.app') {
    return { context: 'admin' as AppContext, locale: 'en' }
  }
  if (domain.endsWith('.innexar.app')) {
    const slug = domain.replace('.innexar.app', '')
    return { 
      context: 'tenant' as AppContext, 
      tenantSlug: slug,
      locale: 'en' 
    }
  }
  
  // Fallback
  return { context: 'public' as AppContext, locale: 'en' }
}
```

### Estrutura de Rotas Next.js

```
app/
├── (public)/              # innexar.app (landing page)
│   ├── layout.tsx
│   ├── page.tsx          # Homepage
│   ├── pricing/
│   ├── blog/
│   ├── docs/
│   └── [locale]/         # Rotas multilíngue
│
├── (admin)/              # admin.innexar.app
│   ├── layout.tsx
│   ├── dashboard/
│   ├── tenants/
│   ├── billing/
│   ├── analytics/
│   └── settings/
│
└── (tenant)/             # {tenant}.innexar.app
    ├── layout.tsx
    ├── dashboard/
    ├── crm/
    ├── financeiro/
    ├── faturamento/
    └── ...
```

---

## 🌍 DETECÇÃO DE IDIOMA

### Por Contexto

```typescript
// Landing Page (innexar.app)
// Auto-detecta idioma do navegador
// URL: innexar.app/pt-BR/pricing
//      innexar.app/en/pricing
//      innexar.app/es/pricing

// Admin Panel (admin.innexar.app)
// Sempre em inglês (padrão para admins)
// Pode mudar manualmente nas settings

// Tenant Apps ({tenant}.innexar.app)
// Idioma salvo nas preferências do tenant
// Pode ser alterado por usuário
```

### Implementação

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAppContext } from '@/lib/utils/context'

export function middleware(request: NextRequest) {
  const { context, tenantSlug } = getAppContext()
  
  if (context === 'public') {
    // Landing page - redirecionar para idioma correto
    const locale = getPreferredLocale(request)
    if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
      return NextResponse.redirect(
        new URL(`/${locale}${request.nextUrl.pathname}`, request.url)
      )
    }
  }
  
  if (context === 'tenant') {
    // Validar se tenant existe
    const tenantExists = await checkTenantExists(tenantSlug)
    if (!tenantExists) {
      return NextResponse.redirect(new URL('https://innexar.app', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

## 🔐 AUTENTICAÇÃO POR CONTEXTO

### 1. Landing Page (innexar.app)

```typescript
// Sem autenticação
// Apenas registro de novos tenants

POST https://api.innexar.app/api/v1/public/tenants/
{
  "name": "ACME Corporation",
  "schema_name": "acme",        // Será acme.innexar.app
  "plan": "professional",
  "admin_user": {
    "email": "admin@acme.com",
    "password": "xxx"
  }
}

Response:
{
  "tenant_url": "https://acme.innexar.app",
  "access_token": "..."
}
```

### 2. Admin Panel (admin.innexar.app)

```typescript
// Login especial para super admins
POST https://api.innexar.app/api/v1/admin/auth/login/
{
  "email": "admin@innexar.app",
  "password": "xxx"
}

Response:
{
  "access": "...",
  "user": {
    "role": "super_admin",
    "permissions": ["manage_all_tenants", "view_billing", ...]
  }
}
```

### 3. Tenant Apps ({tenant}.innexar.app)

```typescript
// Login normal de usuário do tenant
POST https://api.innexar.app/api/v1/auth/login/
Headers:
  X-Tenant-Slug: acme        // Enviado automaticamente

{
  "email": "john@acme.com",
  "password": "xxx"
}

Response:
{
  "access": "...",
  "user": {
    "tenant": {
      "name": "ACME Corporation",
      "schema_name": "acme"
    }
  }
}
```

---

## 🚀 DEPLOY E DNS

### Configuração Cloudflare DNS

```
Type    Name              Value                  Proxy
────────────────────────────────────────────────────────
A       @                 54.123.45.67           ✅
A       *                 54.123.45.67           ✅
CNAME   admin             innexar.app            ✅
CNAME   api               innexar.app            ✅
TXT     @                 v=spf1 include:...     -
```

### Next.js (Vercel)

```json
{
  "domains": [
    "innexar.app",
    "*.innexar.app"
  ],
  "wildcard": true
}
```

### Nginx (se self-hosted)

```nginx
# Landing Page
server {
  server_name innexar.app;
  
  location / {
    proxy_pass http://localhost:3000;
  }
}

# Admin Panel
server {
  server_name admin.innexar.app;
  
  location / {
    proxy_pass http://localhost:3001;
  }
}

# Tenant Apps (wildcard)
server {
  server_name ~^(?<tenant>.+)\.innexar\.app$;
  
  location / {
    proxy_pass http://localhost:3002;
    proxy_set_header X-Tenant-Slug $tenant;
  }
}

# API Backend
server {
  server_name api.innexar.app;
  
  location / {
    proxy_pass http://localhost:8000;
  }
}
```

---

## 📊 EXEMPLOS DE USO

### Fluxo de Registro

```
1. Usuário acessa: https://innexar.app/pricing
2. Clica "Start Free Trial"
3. Preenche formulário:
   - Company: ACME Corporation
   - Subdomain: acme (valida se disponível)
   - Email: admin@acme.com
   - Password: ***

4. Backend cria:
   - Tenant com schema "acme"
   - Domain "acme.innexar.app"
   - Usuário admin
   - Schema PostgreSQL "acme"

5. Redireciona para: https://acme.innexar.app
6. Usuário já logado, vê onboarding
```

### Fluxo de Login Existente

```
1. Usuário acessa: https://innexar.app
2. Clica "Sign In"
3. Insere email: john@acme.com
4. Frontend detecta tenant pelo email:
   GET /api/v1/public/auth/tenant-by-email/?email=john@acme.com
   Response: { "tenant_slug": "acme" }

5. Redireciona para: https://acme.innexar.app/login
6. Usuário faz login no tenant correto
```

### Admin Gerenciando Tenants

```
1. Super admin acessa: https://admin.innexar.app
2. Login com credenciais especiais
3. Dashboard mostra:
   - 1,234 tenants ativos
   - $125k MRR
   - 45 novos signups hoje

4. Pode:
   - Ver detalhes de qualquer tenant
   - Desativar tenant
   - Acessar tenant como admin (impersonate)
   - Ver billing de todos
```

---

## 🔒 SEGURANÇA

### CORS

```python
# Backend permite apenas subdomínios conhecidos
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.innexar\.app$',
]

# Cookies com domínio correto
SESSION_COOKIE_DOMAIN = '.innexar.app'  # Compartilhado entre subdomínios
```

### CSP (Content Security Policy)

```typescript
// next.config.js
headers: [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self' *.innexar.app;
          script-src 'self' 'unsafe-inline' 'unsafe-eval';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          font-src 'self' data:;
          connect-src 'self' *.innexar.app;
        `
      }
    ]
  }
]
```

### SSL Wildcard

```bash
# Certificado para *.innexar.app
# Cobre todos subdomínios automaticamente
certbot certonly --dns-cloudflare \
  -d innexar.app \
  -d *.innexar.app
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Backend Django

- [ ] Configurar `ALLOWED_HOSTS` com wildcard
- [ ] Criar `urls_admin.py` para admin panel
- [ ] Middleware para detectar tenant por subdomínio
- [ ] Endpoint para validar disponibilidade de slug
- [ ] Super admin user model
- [ ] API específica para admin panel

### Frontend Next.js

- [ ] Context detection utility
- [ ] Middleware para roteamento por domínio
- [ ] 3 layouts separados (public, admin, tenant)
- [ ] Landing page multilíngue
- [ ] Admin dashboard
- [ ] Tenant app completo

### DevOps

- [ ] DNS wildcard configurado
- [ ] SSL wildcard
- [ ] Deploy Vercel com wildcard domain
- [ ] Variáveis de ambiente por contexto
- [ ] Monitoring por subdomínio

---

## 🎯 RESUMO

```
✅ Domínio único: innexar.app
✅ Subdomínios por tenant: {tenant}.innexar.app
✅ Admin separado: admin.innexar.app
✅ API centralizada: api.innexar.app
✅ Multi-idioma na landing page
✅ Isolamento total entre tenants
✅ Fácil de escalar
✅ SEO otimizado (cada subdomínio = site único)
```

Essa arquitetura é **padrão de mercado** usado por:
- Slack (acme.slack.com)
- Notion (acme.notion.so)
- Basecamp (acme.basecamporg)
- Zendesk (acme.zendesk.com)

**Simples, escalável e profissional!** 🚀
