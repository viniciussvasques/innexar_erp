'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { TrendingUp, Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { PerformanceReview } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { PerformanceReviewForm } from '@/components/hr/PerformanceReviewForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/lib/hooks/use-debounce'

export default function PerformancePage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<PerformanceReview | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'performance-reviews', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getPerformanceReviews({
        page,
        page_size: pageSize,
      }),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrApi.deletePerformanceReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'performance-reviews'] })
      toast({
        title: tCommon('success'),
        description: t('deletePerformanceReviewSuccess') || 'Performance review deleted successfully',
      })
      setDeleteDialogOpen(false)
      setReviewToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (review: PerformanceReview) => {
    setReviewToDelete(review)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (reviewToDelete) {
      deleteMutation.mutate(reviewToDelete.id)
    }
  }

  const handleEdit = (review: PerformanceReview) => {
    setSelectedReview(review)
    setIsFormOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const columns: ColumnDef<PerformanceReview>[] = [
    {
      accessorKey: 'employee',
      header: t('employee') || 'Employee',
      cell: ({ row }) => {
        const review = row.original
        const employee = review.employee
        const userName = employee?.user
          ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
          : 'N/A'
        return <span className="font-medium">{userName}</span>
      },
    },
    {
      accessorKey: 'review_date',
      header: t('reviewDate') || 'Review Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.review_date
            ? format(new Date(row.original.review_date), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'overall_score',
      header: t('score') || 'Score',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.overall_score ? Number(row.original.overall_score).toFixed(1) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.status
        const statusLabels: Record<string, string> = {
          draft: t('draft') || 'Draft',
          in_progress: t('inProgress') || 'In Progress',
          completed: t('completed') || 'Completed',
          cancelled: t('cancelled') || 'Cancelled',
        }
        return (
          <Badge className={getStatusColor(status)}>
            {statusLabels[status] || status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const review = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(review)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(review)}
                className="text-red-600"
              >
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
            <h1 className="text-3xl font-bold tracking-tight">{t('performance')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('performanceReviews') || 'Performance Reviews'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('performance')}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search') || 'Search...'}
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedReview(null)
                    setIsFormOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newPerformanceReview') || 'New Performance Review'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-red-500">
                  {(error as any)?.response?.status === 404 ||
                  (error instanceof Error &&
                    (error.message.includes('404') || error.message.includes('Not Found')))
                    ? t('apiNotAvailable')
                    : tCommon('error')}
                </p>
                {((error as any)?.response?.status === 404 ||
                  (error instanceof Error &&
                    (error.message.includes('404') || error.message.includes('Not Found')))) && (
                  <p className="text-xs text-muted-foreground text-center max-w-md">
                    {t('apiNotAvailableDescription')}
                  </p>
                )}
              </div>
            ) : data?.results.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {t('noPerformanceReviews') || 'No performance reviews found'}
                </p>
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

        <PerformanceReviewForm
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedReview(null)
          }}
          performanceReview={selectedReview || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'performance-reviews'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setReviewToDelete(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            reviewToDelete
              ? t('deletePerformanceReviewConfirm') ||
                'Are you sure you want to delete this performance review? This action cannot be undone.'
              : t('deletePerformanceReviewConfirmGeneric') ||
                'Are you sure you want to delete this performance review?'
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

