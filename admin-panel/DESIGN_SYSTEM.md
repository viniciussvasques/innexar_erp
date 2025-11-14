# Innexar ERP - Admin Panel UI

## 🎨 Visual Corporativo Implementado

### Paleta de Cores
- **Primary (Brand Blue)**: `#2563eb` - Azul corporativo profissional
- **Success**: `#22c55e` - Verde para status positivos
- **Warning**: `#f59e0b` - Amarelo/laranja para alertas
- **Danger**: `#ef4444` - Vermelho para erros

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Tamanhos**:
  - Page Title: 24px
  - Section Title: 18px
  - Card Title: 16px
  - Body: 14px

## 📦 Componentes Criados

### 1. Layout Corporativo

#### Sidebar (`components/layout/sidebar.tsx`)
- **Largura**: 256px (64 = w-64)
- **Características**:
  - Logo no topo
  - Navegação por módulos
  - Itens com ícones Lucide
  - Estado ativo destacado
  - Footer com call-to-action
  - Sistema modular baseado em planos

```tsx
import { Sidebar } from '@/components/layout/sidebar';

// Usado automaticamente no layout do dashboard
```

#### Header (`components/layout/header.tsx`)
- **Altura**: 64px (16 = h-16)
- **Características**:
  - Busca global (Ctrl+K)
  - Notificações com badge
  - Menu de usuário com avatar
  - Dropdown de ações rápidas

```tsx
import { Header } from '@/components/layout/header';

// Usado automaticamente no layout do dashboard
```

### 2. Dashboard Corporativo

#### KPI Cards
Cards com métricas principais:
- Total Tenants
- Total Users
- Monthly Revenue (MRR)
- Growth Rate

**Características**:
- Ícone colorido em círculo
- Valor principal em destaque
- Indicador de crescimento (↑↓)
- Informação secundária

```tsx
<Card className="shadow-card">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Total Tenants
    </CardTitle>
    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
      <Building2 className="h-5 w-5 text-brand-600" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-foreground">128</div>
    <div className="flex items-center mt-2 text-sm">
      <span className="text-success-700 flex items-center font-medium">
        <ArrowUpRight className="h-4 w-4 mr-1" />
        12.5%
      </span>
      <span className="text-muted-foreground ml-2">vs last month</span>
    </div>
  </CardContent>
</Card>
```

#### Gráficos (Recharts)
- **Line Chart**: Revenue Overview
- **Pie Chart**: Plan Distribution

### 3. Componentes Reutilizáveis

#### Modal (`components/ui/modal.tsx`)
Modal corporativo com overlay, header, body e footer.

**Tamanhos**: `sm` (420px) | `md` (672px) | `lg` (896px) | `xl` (1152px)

```tsx
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';

function Example() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Criar Tenant</Button>
      </ModalTrigger>
      
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Novo Tenant</ModalTitle>
          <ModalDescription>
            Preencha os dados para criar um novo tenant
          </ModalDescription>
          <ModalCloseButton />
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input placeholder="Nome do tenant" />
            </div>
            <div>
              <Label>Plano</Label>
              <Select>
                <option>Trial</option>
                <option>Basic</option>
                <option>Professional</option>
                <option>Enterprise</option>
              </Select>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="outline">Cancelar</Button>
          </ModalClose>
          <Button>Criar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

#### DataTable (`components/ui/data-table.tsx`)
Tabela corporativa com busca, ordenação e exportação.

**Características**:
- Header fixo
- Filtros e busca
- Colunas ordenáveis
- Linhas zebra
- Hover state
- Paginação info
- Botão de exportação

```tsx
import { DataTable } from '@/components/ui/data-table';

interface Tenant {
  id: number;
  name: string;
  plan: string;
  status: string;
  created: string;
}

const columns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    key: 'plan',
    title: 'Plan',
    sortable: true,
    render: (value: string) => (
      <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
        {value}
      </span>
    ),
  },
  {
    key: 'status',
    title: 'Status',
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' 
          ? 'bg-success-100 text-success-700'
          : 'bg-gray-100 text-gray-700'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'created',
    title: 'Created',
    sortable: true,
  },
];

function TenantsPage() {
  const { data, isLoading } = useQuery(['tenants'], fetchTenants);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      showSearch={true}
      showExport={true}
      onExport={() => console.log('Export')}
      onRowClick={(row) => router.push(`/tenants/${row.id}`)}
    />
  );
}
```

## 🎯 Sistema de Módulos

Módulos são ativados automaticamente baseado no plano do tenant:

```typescript
// lib/modules.ts
const AVAILABLE_MODULES = [
  {
    id: 'crm',
    name: 'CRM',
    plans: ['professional', 'enterprise'],
  },
  {
    id: 'sales',
    name: 'Sales',
    plans: ['basic', 'professional', 'enterprise'],
  },
  // ...
];

// Uso na Sidebar
const availableModules = getModulesForPlan('enterprise');
```

## 🚀 Próximos Passos

### Páginas a Criar
1. **Tenants Management**
   - Lista com DataTable
   - Modal de criação/edição
   - Detalhes do tenant
   - Ativação/desativação

2. **Users Management**
   - Lista de usuários
   - Filtros por tenant
   - Criação de usuários admin
   - Reset de senha

3. **CRM Overview**
   - Leads pipeline
   - Funil de vendas
   - Métricas de conversão

4. **Settings**
   - Configurações gerais
   - Planos e preços
   - Integrações
   - Logs do sistema

### Componentes Adicionais
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Select com busca
- [ ] DatePicker
- [ ] File Upload
- [ ] Toast notifications (já tem Sonner)
- [ ] Skeleton loaders
- [ ] Empty states

### Melhorias
- [ ] Dark mode toggle
- [ ] Responsive mobile (sidebar collapse)
- [ ] Keyboard shortcuts (Cmd+K search)
- [ ] Infinite scroll nas tabelas
- [ ] Filtros avançados
- [ ] Exportação Excel/PDF
- [ ] Drag & drop em tabelas

## 📱 Responsividade

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile
- Sidebar deve colapsar em burger menu
- Cards empilham verticalmente
- Tabelas com scroll horizontal
- Modal ocupa 90% da tela

## 🎨 Guia de Estilo

### Espaçamento
- **Cards**: padding 24-32px
- **Inputs**: height 44px
- **Buttons**: height 40-44px
- **Gaps**: 16-24px entre elementos

### Bordas
- **Radius**: 12-16px (padrão 12px = rounded-xl)
- **Modal**: 16px (rounded-2xl)
- **Buttons**: 8px (rounded-lg)

### Sombras
- **Cards**: `shadow-card` (leve)
- **Modais**: `shadow-modal` (forte)

### Transições
- **Duração**: 150-200ms
- **Easing**: ease-out
- **Hover**: subtle scale ou opacity

## 🔧 Dependências Principais

```json
{
  "next": "15.1.5",
  "react": "19.0.0",
  "@tanstack/react-query": "^5.62.13",
  "zustand": "^5.0.3",
  "recharts": "^2.15.1",
  "lucide-react": "^0.468.0",
  "@radix-ui/react-*": "várias",
  "tailwindcss": "^4.0.0",
  "axios": "^1.7.9"
}
```

## 📖 Exemplos de Uso

### Criar Nova Página

```tsx
// app/(dashboard)/tenants/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TenantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all tenants in the system
          </p>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600">
          <Plus className="h-4 w-4 mr-2" />
          New Tenant
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        showSearch
        showExport
      />
    </div>
  );
}
```

---

**Versão**: 1.0  
**Data**: 2025-11-13  
**Status**: ✅ UI Corporativa Implementada
