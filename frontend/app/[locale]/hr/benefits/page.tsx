'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Award, Search, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Benefit } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'

export default function BenefitsPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'benefits', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getBenefits({
        page,
        page_size: pageSize,
      }),
    retry: false,
  })

  const columns: ColumnDef<Benefit>[] = [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'benefit_type',
      header: t('type') || 'Type',
      cell: ({ row }) => {
        const type = row.original.benefit_type
        const typeLabels: Record<string, string> = {
          meal_voucher: t('mealVoucher') || 'Meal Voucher',
          food_voucher: t('foodVoucher') || 'Food Voucher',
          transportation: t('transportation') || 'Transportation',
          health_insurance: t('healthInsurance') || 'Health Insurance',
          dental_insurance: t('dentalInsurance') || 'Dental Insurance',
          life_insurance: t('lifeInsurance') || 'Life Insurance',
          daycare: t('daycare') || 'Daycare',
          gympass: t('gympass') || 'Gympass',
          other: t('other') || 'Other',
        }
        return <span className="text-sm">{typeLabels[type] || type}</span>
      },
    },
    {
      accessorKey: 'value',
      header: t('value') || 'Value',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.value
            ? new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(row.original.value))
            : '-'}
        </span>
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
            <h1 className="text-3xl font-bold tracking-tight">{t('benefits')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manageBenefits')}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('benefits')}</CardTitle>
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
                <Award className="h-12 w-12 text-muted-foreground" />
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
                <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noBenefits') || 'No benefits found'}</p>
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

