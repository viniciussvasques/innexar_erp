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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'vacations', page, pageSize],
    queryFn: () =>
      hrApi.getVacations({
        page,
        page_size: pageSize,
      }),
    retry: false,
  })

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
        description: error.response?.data?.detail || 'Failed to approve vacation',
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => hrApi.rejectVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'vacations'] })
      toast({
        title: tCommon('success'),
        description: t('vacationRejected') || 'Vacation rejected',
      })
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to reject vacation',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (id: number) => {
    approveMutation.mutate(id)
  }

  const handleReject = (id: number) => {
    const reason = prompt(t('rejectionReason') || 'Rejection reason (optional):')
    rejectMutation.mutate(id, { onSuccess: () => {} })
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
        description: error.response?.data?.detail || 'Failed to delete vacation',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (id: number) => {
    if (confirm(tCommon('confirm.deleteConfirm') || 'Are you sure you want to delete this vacation?')) {
      deleteMutation.mutate(id)
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
                    onClick={() => handleApprove(vacation.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('approve') || 'Approve'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReject(vacation.id)}
                    disabled={rejectMutation.isPending}
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
                onClick={() => handleDelete(vacation.id)}
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
            <CardTitle>{t('vacations')}</CardTitle>
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
      </div>
    </DashboardLayout>
  )
}

