'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DealForm } from '@/components/crm/DealForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Edit, Trash2, MoreVertical, TrendingUp, User, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '@/lib/api/crm'
import { Deal } from '@/types/api'
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

export default function DealsPage() {
  const t = useTranslations('crm.deals')
  const tCommon = useTranslations('common')
  const tStages = useTranslations('crm.deals.stages')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['deals', page, pageSize, debouncedSearch],
    queryFn: () =>
      crmApi.getDeals({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Como não há deleteDeal na API, vamos marcar como lost
      await crmApi.markDealLost(id, 'Deleted by user')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedDeal(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete deal',
        variant: 'destructive',
      })
    },
  })

  const markWonMutation = useMutation({
    mutationFn: (id: number) => crmApi.markDealWon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: tCommon('success'),
        description: t('updateSuccess'),
      })
    },
  })

  const markLostMutation = useMutation({
    mutationFn: (id: number) => crmApi.markDealLost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: tCommon('success'),
        description: t('updateSuccess'),
      })
    },
  })

  const handleDelete = (deal: Deal) => {
    setSelectedDeal(deal)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedDeal) {
      deleteMutation.mutate(selectedDeal.id)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'qualification':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'proposal':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'negotiation':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'closed_won':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'closed_lost':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const columns: ColumnDef<Deal>[] = [
    {
      accessorKey: 'title',
      header: t('title'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contact_name',
      header: t('contact'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.contact_name ? (
            <>
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{row.original.contact_name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('amount'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.currency} {parseFloat(row.original.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'probability',
      header: t('probability'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${row.original.probability}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.original.probability}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'stage',
      header: t('stage'),
      cell: ({ row }) => (
        <Badge className={getStageColor(row.original.stage)}>
          {tStages(row.original.stage)}
        </Badge>
      ),
    },
    {
      accessorKey: 'expected_close_date',
      header: t('expectedCloseDate'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.expected_close_date ? (
            <>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(row.original.expected_close_date).toLocaleDateString()}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const deal = row.original
        const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
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
                  setSelectedDeal(deal)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              {!isClosed && (
                <>
                  <DropdownMenuItem
                    onClick={() => markWonMutation.mutate(deal.id)}
                    disabled={markWonMutation.isPending}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t('markWon')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => markLostMutation.mutate(deal.id)}
                    disabled={markLostMutation.isPending}
                    className="text-orange-600"
                  >
                    <TrendingUp className="mr-2 h-4 w-4 rotate-180" />
                    {t('markLost')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => handleDelete(deal)} className="text-red-600">
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
              setSelectedDeal(null)
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
                <p className="text-muted-foreground">{t('noDeals') || 'No deals found'}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedDeal(null)
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

        <DealForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedDeal(null)
          }}
          deal={selectedDeal || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['deals'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedDeal(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedDeal?.title
              ? t('deleteConfirm', { title: selectedDeal.title })
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
