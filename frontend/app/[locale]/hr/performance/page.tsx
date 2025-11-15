'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { TrendingUp, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { PerformanceReview } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function PerformancePage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'performance-reviews', page, pageSize],
    queryFn: () =>
      hrApi.getPerformanceReviews({
        page,
        page_size: pageSize,
      }),
    retry: false,
  })

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
            <CardTitle>{t('performance')}</CardTitle>
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
      </div>
    </DashboardLayout>
  )
}

