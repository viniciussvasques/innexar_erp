'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { InvoiceForm } from '@/components/invoicing/InvoiceForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Calendar,
  DollarSign,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicingApi } from '@/lib/api/invoicing'
import { Invoice } from '@/types/api'
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

export default function InvoicingPage() {
  const t = useTranslations('invoicing')
  const tCommon = useTranslations('common')
  const tStatuses = useTranslations('invoicing.statuses')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['invoicing', 'invoices', page, pageSize, debouncedSearch],
    queryFn: () =>
      invoicingApi.getInvoices({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => invoicingApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicing'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedInvoice(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete invoice',
        variant: 'destructive',
      })
    },
  })

  const issueMutation = useMutation({
    mutationFn: (id: number) => invoicingApi.issueInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicing'] })
      toast({
        title: tCommon('success'),
        description: t('issueSuccess'),
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => invoicingApi.cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicing'] })
      toast({
        title: tCommon('success'),
        description: t('cancelSuccess'),
      })
    },
  })

  const paymentLinkMutation = useMutation({
    mutationFn: (id: number) => invoicingApi.createPaymentLink(id),
    onSuccess: (data) => {
      if (data.payment_link) {
        window.open(data.payment_link, '_blank')
        toast({
          title: tCommon('success'),
          description: t('paymentLinkSuccess'),
        })
      }
    },
  })

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedInvoice) {
      deleteMutation.mutate(selectedInvoice.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'issued':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'number',
      header: t('number'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: t('customer'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer.name}</div>
          {row.original.customer.email && (
            <div className="text-sm text-muted-foreground">{row.original.customer.email}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'issue_date',
      header: t('issueDate'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(row.original.issue_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'due_date',
      header: t('dueDate'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(row.original.due_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: t('total'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.currency}{' '}
            {parseFloat(row.original.total).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {tStatuses(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original
        const isDraft = invoice.status === 'draft'
        const isIssued = invoice.status === 'issued'
        const isPaid = invoice.status === 'paid'
        const isCancelled = invoice.status === 'cancelled'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isDraft && (
                <DropdownMenuItem
                  onClick={() => issueMutation.mutate(invoice.id)}
                  disabled={issueMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('issueInvoice')}
                </DropdownMenuItem>
              )}
              {isIssued && !isPaid && (
                <DropdownMenuItem
                  onClick={() => paymentLinkMutation.mutate(invoice.id)}
                  disabled={paymentLinkMutation.isPending}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('createPaymentLink')}
                </DropdownMenuItem>
              )}
              {(isDraft || isIssued) && (
                <DropdownMenuItem
                  onClick={() => cancelMutation.mutate(invoice.id)}
                  disabled={cancelMutation.isPending}
                  className="text-orange-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('cancelInvoice')}
                </DropdownMenuItem>
              )}
              {isDraft && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(invoice)
                    setFormOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {tCommon('edit')}
                </DropdownMenuItem>
              )}
              {isDraft && (
                <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {tCommon('delete')}
                </DropdownMenuItem>
              )}
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
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('description')}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedInvoice(null)
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
                <p className="text-muted-foreground">{t('noInvoices')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedInvoice(null)
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

        <InvoiceForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedInvoice(null)
          }}
          invoice={selectedInvoice || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['invoicing'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedInvoice(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedInvoice?.number
              ? t('deleteConfirm', { number: selectedInvoice.number })
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
