# 🎨 Componentes UI - Innexar ERP Frontend

**Última atualização:** 2025-11-13  
**Versão:** 1.0.0

## 📋 Visão Geral

Este documento descreve os componentes UI implementados no projeto, baseados em shadcn/ui e Radix UI.

---

## ✅ Componentes Implementados

### 1. Toast (Notificações)

**Localização:** `components/ui/toast.tsx`, `components/ui/toaster.tsx`

**Hook:** `lib/hooks/use-toast.ts`

**Utilitário:** `lib/utils/toast.ts`

#### Variantes Disponíveis

- `default` - Notificação padrão
- `success` - Sucesso (verde)
- `error` / `destructive` - Erro (vermelho)
- `warning` - Aviso (amarelo)
- `info` - Informação (azul)

#### Uso Básico

```typescript
import { toast } from '@/lib/utils/toast'

// Sucesso
toast.success('Lead criado com sucesso!', 'O lead foi adicionado ao sistema.')

// Erro
toast.error('Erro ao salvar', 'Verifique os dados e tente novamente.')

// Aviso
toast.warning('Atenção', 'Este lead já existe no sistema.')

// Info
toast.info('Informação', 'Sincronização em andamento...')
```

#### Uso Avançado (Hook)

```typescript
import { useToast } from '@/lib/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  const handleClick = () => {
    toast({
      title: 'Título',
      description: 'Descrição',
      variant: 'success',
      action: <Button>Desfazer</Button>,
    })
  }

  return <Button onClick={handleClick}>Clique</Button>
}
```

#### Configuração

O `Toaster` já está adicionado no layout principal (`app/[locale]/layout.tsx`).

---

### 2. Dialog (Modal)

**Localização:** `components/ui/dialog.tsx`

**Componente de Confirmação:** `components/ui/confirm-dialog.tsx`

#### Uso Básico

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Abrir Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descrição do modal</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### Dialog de Confirmação

```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

function MyComponent() {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    await deleteItem()
    toast.success('Item excluído!')
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Excluir</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Excluir item?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmText="Excluir"
      />
    </>
  )
}
```

---

### 3. DataTable

**Localização:** `components/ui/data-table.tsx`

**Dependência:** `@tanstack/react-table`

#### Uso Básico

```typescript
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

interface Lead {
  id: number
  name: string
  email: string
  status: string
}

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]

function LeadsPage() {
  const { data } = useQuery({
    queryKey: ['leads'],
    queryFn: () => crmApi.getLeads(),
  })

  return <DataTable columns={columns} data={data?.results || []} searchKey="name" />
}
```

#### Funcionalidades

- ✅ Ordenação por colunas
- ✅ Busca/filtro
- ✅ Paginação
- ✅ Seleção de linhas
- ✅ Responsivo

#### Colunas com Ações

```typescript
const columns: ColumnDef<Lead>[] = [
  // ... outras colunas
  {
    id: 'actions',
    cell: ({ row }) => {
      const lead = row.original

      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(lead)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(lead)}>
            Excluir
          </Button>
        </div>
      )
    },
  },
]
```

---

### 4. Table (Base)

**Localização:** `components/ui/table.tsx`

Componente base para tabelas, usado pelo DataTable.

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function SimpleTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
```

---

## 🌍 Internacionalização

Todos os componentes UI suportam traduções através do namespace `ui`:

```typescript
import { useTranslations } from 'next-intl'

const t = useTranslations('ui')

// Traduções disponíveis:
t('loading')      // "Loading..." / "Carregando..." / "Cargando..."
t('error')        // "Error" / "Erro" / "Error"
t('success')      // "Success" / "Sucesso" / "Éxito"
t('close')        // "Close" / "Fechar" / "Cerrar"
t('cancel')       // "Cancel" / "Cancelar" / "Cancelar"
t('confirm')      // "Confirm" / "Confirmar" / "Confirmar"
t('delete')       // "Delete" / "Excluir" / "Eliminar"
t('edit')         // "Edit" / "Editar" / "Editar"
t('save')         // "Save" / "Salvar" / "Guardar"
t('search')       // "Search" / "Buscar" / "Buscar"
t('noResults')    // "No results found" / "Nenhum resultado encontrado"
t('previous')     // "Previous" / "Anterior" / "Anterior"
t('next')         // "Next" / "Próximo" / "Siguiente"
```

---

## 📦 Dependências

### Já Instaladas

- `@radix-ui/react-toast` - Toast component
- `@radix-ui/react-dialog` - Dialog component
- `class-variance-authority` - Variantes de componentes
- `lucide-react` - Ícones

### Adicionadas

- `@tanstack/react-table` - DataTable (tabelas avançadas)

---

## 🎯 Próximos Componentes

### Planejados

- [ ] Select/Dropdown
- [ ] Form components (Label, FormField, etc.)
- [ ] DatePicker
- [ ] Combobox
- [ ] Popover
- [ ] Dropdown Menu
- [ ] Tabs
- [ ] Accordion

---

## 📝 Exemplos de Uso Completo

### Exemplo: CRUD com Toast e Dialog

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/lib/utils/toast'
import { crmApi } from '@/lib/api/crm'
import type { Lead } from '@/types/api'

export function LeadsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => crmApi.getLeads(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => crmApi.deleteLead(id),
    onSuccess: () => {
      toast.success('Lead excluído!', 'O lead foi removido com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setDeleteDialogOpen(false)
    },
    onError: () => {
      toast.error('Erro ao excluir', 'Não foi possível excluir o lead.')
    },
  })

  const handleDelete = (lead: Lead) => {
    setSelectedLead(lead)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedLead) {
      deleteMutation.mutate(selectedLead.id)
    }
  }

  const columns: ColumnDef<Lead>[] = [
    // ... colunas
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original)}>
          Excluir
        </Button>
      ),
    },
  ]

  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <DataTable columns={columns} data={data?.results || []} searchKey="name" />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir lead?"
        description={`Tem certeza que deseja excluir ${selectedLead?.name}?`}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </>
  )
}
```

---

**Última atualização:** 2025-11-13

