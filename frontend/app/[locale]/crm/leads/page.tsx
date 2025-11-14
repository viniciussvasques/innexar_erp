'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { LeadForm } from '@/components/crm/LeadForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '@/lib/api/crm'
import { Lead } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/lib/hooks/use-debounce'

export default function LeadsPage() {
  const t = useTranslations('crm.leads')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, pageSize, debouncedSearch],
    queryFn: () =>
      crmApi.getLeads({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => crmApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast({
        title: tCommon('success'),
        description: 'Lead deleted successfully',
      })
      setDeleteDialogOpen(false)
      setSelectedLead(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete lead',
        variant: 'destructive',
      })
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
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: t('company'),
      cell: ({ row }) => row.original.company || '-',
    },
    {
      accessorKey: 'source',
      header: t('source'),
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize">
          {row.original.source.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 capitalize">
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'score',
      header: t('score'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${row.original.score}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.original.score}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const lead = row.original
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
                  setSelectedLead(lead)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(lead)} className="text-red-600">
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
          <Button onClick={() => {
            setSelectedLead(null)
            setFormOpen(true)
          }}>
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
                <p className="text-muted-foreground">{t('noLeads')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedLead(null)
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

        <LeadForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedLead(null)
          }}
          lead={selectedLead || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['leads'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedLead(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedLead?.name
              ? t('deleteConfirm', { name: selectedLead.name })
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
