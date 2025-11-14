'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ContactForm } from '@/components/crm/ContactForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Edit, Trash2, MoreVertical, Mail, Phone, Building2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '@/lib/api/crm'
import { Contact } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'

export default function ContactsPage() {
  const t = useTranslations('crm.contacts')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, pageSize, debouncedSearch],
    queryFn: () =>
      crmApi.getContacts({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => crmApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedContact(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete contact',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedContact) {
      deleteMutation.mutate(selectedContact.id)
    }
  }

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-3 w-3" />
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: t('company'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.company ? (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{row.original.company}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: t('phone'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.phone ? (
            <>
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{row.original.phone}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'is_customer',
      header: t('isCustomer'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_customer ? 'default' : 'secondary'}>
          {row.original.is_customer ? tCommon('yes') : tCommon('no')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contact = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedContact(contact)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(contact)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manage')}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedContact(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={tCommon('search')}
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
              </div>
            ) : data?.results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noContacts')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedContact(null)
                    setFormOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('new')}
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data?.results || []}
                pagination={{
                  page,
                  pageSize,
                  total: data?.count || 0,
                  onPageChange: setPage,
                }}
              />
            )}
          </CardContent>
        </Card>

        <ContactForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedContact(null)
          }}
          contact={selectedContact || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedContact(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedContact?.name
              ? t('deleteConfirm', { name: selectedContact.name })
              : t('deleteConfirmGeneric')
          }
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}
