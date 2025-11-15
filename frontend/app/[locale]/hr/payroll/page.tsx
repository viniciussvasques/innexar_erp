'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DollarSign, Search, Calendar, Download, Eye, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Payroll } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import { PayrollForm } from '@/components/hr/PayrollForm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function PayrollPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [processMonth, setProcessMonth] = useState(new Date().getMonth() + 1)
  const [processYear, setProcessYear] = useState(new Date().getFullYear())
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'payroll', page, pageSize, debouncedSearch, month, year],
    queryFn: () =>
      hrApi.getPayrolls({
        page,
        page_size: pageSize,
        month,
        year,
      }),
    retry: false,
  })

  const processMutation = useMutation({
    mutationFn: (data: { month: number; year: number; department_id?: number }) =>
      hrApi.processPayroll(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll'] })
      toast({
        title: tCommon('success'),
        description: t('payrollProcessed') || `Payroll processed for ${result.processed_count} employees`,
      })
      setProcessDialogOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to process payroll',
        variant: 'destructive',
      })
    },
  })

  const handleProcessPayroll = () => {
    processMutation.mutate({
      month: processMonth,
      year: processYear,
    })
  }

  const columns: ColumnDef<Payroll>[] = [
    {
      accessorKey: 'payroll_number',
      header: t('payrollNumber') || 'Payroll Number',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.payroll_number}</span>
      ),
    },
    {
      accessorKey: 'employee',
      header: t('employee') || 'Employee',
      cell: ({ row }) => {
        const payroll = row.original
        const employee = payroll.employee
        const userName = employee?.user
          ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
          : 'N/A'
        return <span className="font-medium">{userName}</span>
      },
    },
    {
      accessorKey: 'month',
      header: t('month') || 'Month',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.month}/{row.original.year}
        </span>
      ),
    },
    {
      accessorKey: 'total_earnings',
      header: t('totalEarnings') || 'Total Earnings',
      cell: ({ row }) => (
        <span className="font-medium">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(row.original.total_earnings))}
        </span>
      ),
    },
    {
      accessorKey: 'total_deductions',
      header: t('totalDeductions') || 'Total Deductions',
      cell: ({ row }) => (
        <span className="text-sm text-red-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(row.original.total_deductions))}
        </span>
      ),
    },
    {
      accessorKey: 'net_salary',
      header: t('netSalary') || 'Net Salary',
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(row.original.net_salary))}
        </span>
      ),
    },
    {
      accessorKey: 'is_processed',
      header: t('status'),
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_processed
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }
        >
          {row.original.is_processed ? t('processed') || 'Processed' : t('pending') || 'Pending'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payroll = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewPayroll(payroll)}>
                <Eye className="mr-2 h-4 w-4" />
                {tCommon('view') || 'View'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setFormOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('payroll')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('managePayroll')}</p>
          </div>
          <Button onClick={() => setProcessDialogOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            {t('processPayroll')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('payroll')}</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={month?.toString()}
                  onValueChange={value => setMonth(value ? Number(value) : undefined)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t('month') || 'Month'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-24"
                  placeholder="Year"
                />
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
                <DollarSign className="h-12 w-12 text-muted-foreground" />
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
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noPayrolls') || 'No payroll records found'}</p>
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

        <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('processPayroll')}</DialogTitle>
              <DialogDescription>
                {t('processPayrollDescription') || 'Process payroll for the selected month and year'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="process-month">{t('month') || 'Month'}</Label>
                <Select
                  value={processMonth.toString()}
                  onValueChange={value => setProcessMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="process-year">{t('year') || 'Year'}</Label>
                <Input
                  id="process-year"
                  type="number"
                  value={processYear}
                  onChange={e => setProcessYear(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleProcessPayroll} disabled={processMutation.isPending}>
                {processMutation.isPending ? tCommon('processing') || 'Processing...' : tCommon('process') || 'Process'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <PayrollForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedPayroll(null)
          }}
          payroll={selectedPayroll || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'payroll'] })
          }}
        />
      </div>
    </DashboardLayout>
  )
}

