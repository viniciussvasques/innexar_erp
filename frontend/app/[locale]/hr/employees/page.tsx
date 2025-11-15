'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { EmployeeForm } from '@/components/hr/EmployeeForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Edit, Trash2, MoreVertical, Briefcase, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { Employee } from '@/types/api'
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

export default function EmployeesPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'employees', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getEmployees({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
    retry: false, // Não tentar novamente em caso de 404
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete employee',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteMutation.mutate(selectedEmployee.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'resigned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'employee_number',
      header: t('employeeNumber'),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.employee_number}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => {
        const employee = row.original
        const userName = employee.user
          ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || employee.user.email
          : 'N/A'
        return (
          <div>
            <div className="font-medium">{userName}</div>
            {employee.job_title && (
              <div className="text-sm text-muted-foreground">{employee.job_title}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'department',
      header: t('department'),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.department_name || row.original.department?.name || '-'}</span>
      ),
    },
    {
      accessorKey: 'hire_date',
      header: t('hireDate'),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.hire_date ? new Date(row.original.hire_date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {t(`statuses.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const employee = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/hr/employees/${employee.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('viewProfile') || 'View Profile'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEmployee(employee)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(employee)} className="text-red-600">
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
            <h1 className="text-3xl font-bold tracking-tight">{t('employees')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manageEmployees')}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedEmployee(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('employees')}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchEmployees')}
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
                <Briefcase className="h-12 w-12 text-muted-foreground" />
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
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('noEmployees')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedEmployee(null)
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

        <EmployeeForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedEmployee(null)
          }}
          employee={selectedEmployee || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedEmployee(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedEmployee?.user
              ? t('deleteConfirm', {
                  name: `${selectedEmployee.user.first_name || ''} ${selectedEmployee.user.last_name || ''}`.trim() || selectedEmployee.user.email,
                })
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

