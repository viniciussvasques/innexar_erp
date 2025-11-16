'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Clock, Search, Plus, CheckCircle, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { TimeRecord } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { TimeRecordForm } from '@/components/hr/TimeRecordForm'
import { ApprovalDialog } from '@/components/hr/ApprovalDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdvancedFilters, FilterOption } from '@/components/hr/AdvancedFilters'

export default function TimeRecordsPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [dateFrom, setDateFrom] = useState<string>(
    format(new Date(new Date().setDate(1)), 'yyyy-MM-dd')
  )
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTimeRecord, setSelectedTimeRecord] = useState<TimeRecord | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>()
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [timeRecordToApprove, setTimeRecordToApprove] = useState<TimeRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [timeRecordToDelete, setTimeRecordToDelete] = useState<TimeRecord | null>(null)
  const [filters, setFilters] = useState<Record<string, string | number | undefined>>({
    employee_id: undefined,
    is_approved: undefined,
    record_type: undefined,
  })

  // Buscar funcionários para o filtro
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'filter'],
    queryFn: () => hrApi.getEmployees({ status: 'active', page_size: 1000 }),
  })

  const filterOptions: FilterOption[] = [
    {
      key: 'employee_id',
      label: t('employee'),
      type: 'select',
      options:
        employeesData?.results?.map(emp => ({
          value: emp.id.toString(),
          label: emp.user
            ? `${emp.user.first_name || ''} ${emp.user.last_name || ''}`.trim() || emp.user.email
            : emp.employee_number,
        })) || [],
    },
    {
      key: 'is_approved',
      label: t('approvalStatus') || 'Approval Status',
      type: 'select',
      options: [
        { value: 'true', label: t('approved') || 'Approved' },
        { value: 'false', label: t('pending') || 'Pending' },
      ],
    },
    {
      key: 'record_type',
      label: t('recordType') || 'Record Type',
      type: 'select',
      options: [
        { value: 'check_in', label: t('checkIn') || 'Check In' },
        { value: 'check_out', label: t('checkOut') || 'Check Out' },
        { value: 'lunch_in', label: t('lunchIn') || 'Lunch In' },
        { value: 'lunch_out', label: t('lunchOut') || 'Lunch Out' },
        { value: 'overtime_in', label: t('overtimeIn') || 'Overtime In' },
        { value: 'overtime_out', label: t('overtimeOut') || 'Overtime Out' },
      ],
    },
  ]

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'time-records', page, pageSize, dateFrom, dateTo, filters],
    queryFn: () =>
      hrApi.getTimeRecords({
        page,
        page_size: pageSize,
        date_from: dateFrom,
        date_to: dateTo,
        employee: filters.employee_id ? Number(filters.employee_id) : undefined,
        is_approved: filters.is_approved !== undefined ? filters.is_approved === 'true' : undefined,
        record_type: filters.record_type as string | undefined,
      }),
    retry: false,
  })

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({ employee_id: undefined, is_approved: undefined, record_type: undefined })
    setPage(1)
  }

  const approveMutation = useMutation({
    mutationFn: (id: number) => hrApi.approveTimeRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'time-records'] })
      toast({
        title: tCommon('success'),
        description: t('timeRecordApproved') || 'Time record approved successfully',
      })
      setApprovalDialogOpen(false)
      setTimeRecordToApprove(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (record: TimeRecord) => {
    setTimeRecordToApprove(record)
    setApprovalDialogOpen(true)
  }

  const confirmApproval = () => {
    if (timeRecordToApprove) {
      approveMutation.mutate(timeRecordToApprove.id)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteTimeRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'time-records'] })
      toast({
        title: tCommon('success'),
        description: t('timeRecordDeleted') || 'Time record deleted successfully',
      })
      setDeleteDialogOpen(false)
      setTimeRecordToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (record: TimeRecord) => {
    setTimeRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (timeRecordToDelete) {
      deleteMutation.mutate(timeRecordToDelete.id)
    }
  }

  const handleEdit = (record: TimeRecord) => {
    setSelectedTimeRecord(record)
    setFormOpen(true)
  }

  const handleNew = (employeeId?: number) => {
    setSelectedTimeRecord(null)
    setSelectedEmployeeId(employeeId)
    setFormOpen(true)
  }

  const columns: ColumnDef<TimeRecord>[] = [
    {
      accessorKey: 'employee',
      header: t('employee') || 'Employee',
      cell: ({ row }) => {
        const record = row.original
        const employee = record.employee
        const userName = employee?.user
          ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
          : 'N/A'
        return <span className="font-medium">{userName}</span>
      },
    },
    {
      accessorKey: 'record_date',
      header: t('date') || 'Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.record_date
            ? format(new Date(row.original.record_date), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'record_time',
      header: t('time') || 'Time',
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.record_time || '-'}</span>
      ),
    },
    {
      accessorKey: 'record_type',
      header: t('type') || 'Type',
      cell: ({ row }) => {
        const type = row.original.record_type
        const typeLabels: Record<string, string> = {
          check_in: t('checkIn') || 'Check In',
          check_out: t('checkOut') || 'Check Out',
          lunch_in: t('lunchIn') || 'Lunch In',
          lunch_out: t('lunchOut') || 'Lunch Out',
          overtime_in: t('overtimeIn') || 'Overtime In',
          overtime_out: t('overtimeOut') || 'Overtime Out',
        }
        return <span className="text-sm">{typeLabels[type] || type}</span>
      },
    },
    {
      accessorKey: 'is_approved',
      header: t('status'),
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_approved
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }
        >
          {row.original.is_approved ? t('approved') || 'Approved' : t('pending') || 'Pending'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!record.is_approved && (
                <DropdownMenuItem
                  onClick={() => handleApprove(record)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('approve') || 'Approve'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleEdit(record)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(record)}
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
            <h1 className="text-3xl font-bold tracking-tight">{t('timeRecords')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manageTimeRecords')}</p>
          </div>
          <Button onClick={() => handleNew()}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newTimeRecord') || 'New Time Record'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('timeRecords')}</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-40"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-40"
                />
                <AdvancedFilters
                  filters={filterOptions}
                  values={filters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
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
                <Clock className="h-12 w-12 text-muted-foreground" />
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
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noTimeRecords') || 'No time records found'}</p>
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

        <TimeRecordForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedTimeRecord(null)
            setSelectedEmployeeId(undefined)
          }}
          timeRecord={selectedTimeRecord || undefined}
          employeeId={selectedEmployeeId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'time-records'] })
          }}
        />

        <ApprovalDialog
          open={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false)
            setTimeRecordToApprove(null)
          }}
          type="approve"
          title={t('approveTimeRecord') || 'Approve Time Record'}
          description={t('approveTimeRecordDescription') || 'Are you sure you want to approve this time record?'}
          onConfirm={confirmApproval}
          isLoading={approveMutation.isPending}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setTimeRecordToDelete(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            timeRecordToDelete
              ? t('deleteTimeRecordConfirm') ||
                'Are you sure you want to delete this time record? This action cannot be undone.'
              : t('deleteTimeRecordConfirmGeneric') ||
                'Are you sure you want to delete this time record?'
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

