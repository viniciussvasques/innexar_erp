'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Edit, Trash2, MoreVertical, Briefcase } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { JobPosition } from '@/types/api'
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
import { JobPositionForm } from '@/components/hr/JobPositionForm'

export default function JobPositionsPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'job-positions', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getJobPositions({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        active_only: false,
      }),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteJobPosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess') || 'Job position deleted successfully',
      })
      setDeleteDialogOpen(false)
      setSelectedJobPosition(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (jobPosition: JobPosition) => {
    setSelectedJobPosition(jobPosition)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedJobPosition) {
      deleteMutation.mutate(selectedJobPosition.id)
    }
  }

  const columns: ColumnDef<JobPosition>[] = [
    {
      accessorKey: 'code',
      header: t('code') || 'Code',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'department_name',
      header: t('department'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.department_name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'level_display',
      header: t('level') || 'Level',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.level_display || row.original.level}</Badge>
      ),
    },
    {
      accessorKey: 'salary_range',
      header: t('salaryRange') || 'Salary Range',
      cell: ({ row }) => {
        const min = row.original.salary_min
        const max = row.original.salary_max
        if (min && max) {
          return (
            <span className="text-sm">
              ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}
            </span>
          )
        } else if (min) {
          return <span className="text-sm">${parseFloat(min).toLocaleString()}+</span>
        } else if (max) {
          return <span className="text-sm">Up to ${parseFloat(max).toLocaleString()}</span>
        }
        return <span className="text-sm text-muted-foreground">-</span>
      },
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
    {
      id: 'actions',
      cell: ({ row }) => {
        const jobPosition = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedJobPosition(jobPosition)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(jobPosition)} className="text-red-600">
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
            <h1 className="text-3xl font-bold tracking-tight">{t('jobPositions') || 'Job Positions'}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('manageJobPositions') || 'Manage job positions and roles'}
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedJobPosition(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('newJobPosition') || 'New Job Position'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('jobPositions') || 'Job Positions'}</CardTitle>
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
                <p className="mt-4 text-muted-foreground">
                  {t('noJobPositions') || 'No job positions found'}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedJobPosition(null)
                    setFormOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newJobPosition') || 'New Job Position'}
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

        <JobPositionForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedJobPosition(null)
          }}
          jobPosition={selectedJobPosition || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedJobPosition(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedJobPosition
              ? t('deleteConfirm', { name: selectedJobPosition.name }) ||
                `Are you sure you want to delete ${selectedJobPosition.name}?`
              : t('deleteConfirmGeneric') || 'Are you sure you want to delete this job position?'
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

