'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Calendar, Plus, CheckCircle, XCircle, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Vacation } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { VacationForm } from '@/components/hr/VacationForm'
import { ApprovalDialog } from '@/components/hr/ApprovalDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdvancedFilters, FilterOption } from '@/components/hr/AdvancedFilters'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function VacationsPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>()
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve')
  const [vacationToApprove, setVacationToApprove] = useState<Vacation | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vacationToDelete, setVacationToDelete] = useState<Vacation | null>(null)
  const [filters, setFilters] = useState<Record<string, string | number | undefined>>({
    status: undefined,
    employee_id: undefined,
  })

  // Buscar funcionários para o filtro
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'filter'],
    queryFn: () => hrApi.getEmployees({ status: 'active', page_size: 1000 }),
  })

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      options: [
        { value: 'requested', label: t('statuses.requested') || 'Requested' },
        { value: 'approved', label: t('statuses.approved') || 'Approved' },
        { value: 'rejected', label: t('statuses.rejected') || 'Rejected' },
        { value: 'taken', label: t('statuses.taken') || 'Taken' },
        { value: 'cancelled', label: t('statuses.cancelled') || 'Cancelled' },
      ],
    },
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
  ]

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'vacations', page, pageSize, filters],
    queryFn: () =>
      hrApi.getVacations({
        page,
        page_size: pageSize,
        status: filters.status as string | undefined,
        employee: filters.employee_id ? Number(filters.employee_id) : undefined,
      }),
    retry: false,
  })

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({ status: undefined, employee_id: undefined })
    setPage(1)
  }

  const approveMutation = useMutation({
    mutationFn: (id: number) => hrApi.approveVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'vacations'] })
      toast({
        title: tCommon('success'),
        description: t('vacationApproved') || 'Vacation approved successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => hrApi.rejectVacation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'vacations'] })
      toast({
        title: tCommon('success'),
        description: t('vacationRejected') || 'Vacation rejected',
      })
      setApprovalDialogOpen(false)
      setVacationToApprove(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (vacation: Vacation) => {
    setVacationToApprove(vacation)
    setApprovalType('approve')
    setApprovalDialogOpen(true)
  }

  const handleReject = (vacation: Vacation) => {
    setVacationToApprove(vacation)
    setApprovalType('reject')
    setApprovalDialogOpen(true)
  }

  const confirmApproval = (reason?: string) => {
    if (vacationToApprove) {
      if (approvalType === 'approve') {
        approveMutation.mutate(vacationToApprove.id)
      } else {
        rejectMutation.mutate({ id: vacationToApprove.id, reason })
      }
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'vacations'] })
      toast({
        title: tCommon('success'),
        description: t('vacationDeleted') || 'Vacation deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (vacation: Vacation) => {
    setVacationToDelete(vacation)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (vacationToDelete) {
      deleteMutation.mutate(vacationToDelete.id)
    }
  }

  const handleEdit = (vacation: Vacation) => {
    setSelectedVacation(vacation)
    setFormOpen(true)
  }

  const handleNew = (employeeId?: number) => {
    setSelectedVacation(null)
    setSelectedEmployeeId(employeeId)
    setFormOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'taken':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const columns: ColumnDef<Vacation>[] = [
    {
      accessorKey: 'employee',
      header: t('employee') || 'Employee',
      cell: ({ row }) => {
        const vacation = row.original
        const employee = vacation.employee
        const userName = employee?.user
          ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
          : 'N/A'
        return <span className="font-medium">{userName}</span>
      },
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
      accessorKey: 'days',
      header: t('days') || 'Days',
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.days}</span>,
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.status
        const statusLabels: Record<string, string> = {
          requested: t('requested') || 'Requested',
          approved: t('approved') || 'Approved',
          rejected: t('rejected') || 'Rejected',
          taken: t('taken') || 'Taken',
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
        const vacation = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {vacation.status === 'requested' && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleApprove(vacation)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('approve') || 'Approve'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReject(vacation)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('reject') || 'Reject'}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => handleEdit(vacation)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(vacation)}
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
            <h1 className="text-3xl font-bold tracking-tight">{t('vacations')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manageVacations')}</p>
          </div>
          <Button onClick={() => handleNew()}>
            <Plus className="mr-2 h-4 w-4" />
            {t('requestVacation') || 'Request Vacation'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('vacations')}</CardTitle>
              <div className="flex items-center gap-2">
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
                <Calendar className="h-12 w-12 text-muted-foreground" />
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
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noVacations') || 'No vacations found'}</p>
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

        <VacationForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedVacation(null)
            setSelectedEmployeeId(undefined)
          }}
          vacation={selectedVacation || undefined}
          employeeId={selectedEmployeeId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'vacations'] })
          }}
        />

        <ApprovalDialog
          open={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false)
            setVacationToApprove(null)
          }}
          type={approvalType}
          title={
            approvalType === 'approve'
              ? t('approveVacation') || 'Approve Vacation'
              : t('rejectVacation') || 'Reject Vacation'
          }
          description={
            approvalType === 'approve'
              ? t('approveVacationDescription') ||
                'Are you sure you want to approve this vacation request?'
              : t('rejectVacationDescription') ||
                'Please provide a reason for rejecting this vacation request.'
          }
          onConfirm={confirmApproval}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
          requireReason={approvalType === 'reject'}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setVacationToDelete(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            vacationToDelete
              ? t('deleteVacationConfirm') ||
                'Are you sure you want to delete this vacation? This action cannot be undone.'
              : t('deleteVacationConfirmGeneric') ||
                'Are you sure you want to delete this vacation?'
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

