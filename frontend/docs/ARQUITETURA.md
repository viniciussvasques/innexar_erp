# 🏗️ Arquitetura - Innexar ERP Frontend

## 📋 Visão Geral

Frontend construído com Next.js 14 (App Router), TypeScript, TailwindCSS e shadcn/ui.

## 🎯 Princípios Arquiteturais

1. **Server Components First** - Usar Server Components por padrão
2. **Component Composition** - Componentes pequenos e compostos
3. **Type Safety** - TypeScript strict mode
4. **Performance** - Code splitting, lazy loading
5. **Acessibilidade** - WCAG 2.1 AA
6. **Internacionalização** - Suporte a 3 idiomas

## 📁 Estrutura de Pastas

```
frontend/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Rotas por idioma
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Autenticação
│   │   ├── dashboard/            # Dashboard
│   │   └── crm/                  # Módulo CRM
│   └── globals.css               # Estilos globais
│
├── components/                  # Componentes React
│   ├── ui/                       # shadcn/ui components
│   ├── layouts/                  # Layouts
│   ├── providers/                # Context providers
│   └── forms/                    # Formulários
│
├── lib/                          # Utilitários
│   ├── api/                      # Cliente API
│   ├── hooks/                    # Custom hooks
│   ├── store/                    # Zustand stores
│   ├── utils/                    # Funções utilitárias
│   └── i18n/                     # Configuração i18n
│
├── types/                        # TypeScript types
├── messages/                     # Traduções i18n
├── tests/                        # Testes automatizados
└── docs/                         # Documentação
```

## 🔄 Fluxo de Dados

### Autenticação

```
User → Login Form → authApi.login() → Backend API
  ↓
AuthResponse → useAuthStore.setAuth() → localStorage
  ↓
Protected Routes → useAuthStore.user → Render
```

### Dados da API

```
Component → useQuery(['key']) → React Query
  ↓
React Query → apiClient → Axios → Backend API
  ↓
Response → Cache → Component Re-render
```

## 🎨 Design System

### Componentes Base (shadcn/ui)

- Button, Input, Card, Dialog, etc.
- Customizáveis via TailwindCSS
- Acessíveis por padrão

### Temas

- Light mode (padrão)
- Dark mode
- Configurável via next-themes

## 🌍 Internacionalização

### Estrutura

- `messages/en.json` - Inglês
- `messages/pt.json` - Português
- `messages/es.json` - Espanhol

### Uso

```typescript
import { useTranslations } from 'next-intl'

const t = useTranslations('nav')
return <h1>{t('dashboard')}</h1>
```

## 🔐 Segurança

### Autenticação

- JWT tokens (access + refresh)
- Armazenado em localStorage
- Refresh automático via interceptor

### Validação

- Zod para validação de formulários
- Validação no frontend E backend

## ⚡ Performance

### Otimizações

- Server Components
- Code splitting automático
- Image optimization (next/image)
- React Query caching
- Lazy loading

### Métricas Alvo

- Lighthouse: 90+
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s

## 🧪 Testes

### Estrutura

- Unit tests para componentes
- Integration tests para fluxos
- Coverage mínimo: 70%

### Ferramentas

- Jest
- React Testing Library
- MSW (Mock Service Worker) - futuro

## 📦 Build e Deploy

### Build

```bash
npm run build
```

### Output

- `.next/` - Build otimizado
- Static assets
- Server components

### Deploy

- Vercel (recomendado)
- Multi-region
- Edge functions

## 🔄 CI/CD

### Pipeline

1. Lint
2. Type check
3. Tests
4. Build
5. Deploy

### Workflows

- `.github/workflows/ci.yml`

## 📚 Dependências Principais

- **next** - Framework React
- **react** - Biblioteca UI
- **typescript** - Type safety
- **tailwindcss** - Estilização
- **next-intl** - i18n
- **@tanstack/react-query** - Data fetching
- **zustand** - State management
- **axios** - HTTP client
- **zod** - Validação
- **jest** - Testes
