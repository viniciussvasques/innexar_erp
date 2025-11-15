'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { GraduationCap, Search, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Training } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function TrainingsPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'trainings', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getTrainings({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
    retry: false,
  })

  const columns: ColumnDef<Training>[] = [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'training_type',
      header: t('type') || 'Type',
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.training_type || '-'}</span>
      ),
    },
    {
      accessorKey: 'start_date',
      header: t('startDate') || 'Start Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.start_date
            ? format(new Date(row.original.start_date), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'end_date',
      header: t('endDate') || 'End Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.end_date
            ? format(new Date(row.original.end_date), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'duration_hours',
      header: t('duration') || 'Duration',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.duration_hours || 0}h</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: t('status'),
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }
        >
          {row.original.is_active ? t('active') || 'Active' : t('inactive') || 'Inactive'}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('trainings')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('manageTrainings') || 'Manage employee trainings'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('trainings')}</CardTitle>
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
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
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
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noTrainings') || 'No trainings found'}</p>
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

