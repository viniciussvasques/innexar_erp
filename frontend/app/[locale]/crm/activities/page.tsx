'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ActivityForm } from '@/components/crm/ActivityForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '@/lib/api/crm'
import { Activity } from '@/types/api'
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

export default function ActivitiesPage() {
  const t = useTranslations('crm.activities')
  const tCommon = useTranslations('common')
  const tTypes = useTranslations('crm.activities.types')
  const tStatuses = useTranslations('crm.activities.statuses')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page, pageSize, debouncedSearch],
    queryFn: () =>
      crmApi.getActivities({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => crmApi.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedActivity(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete activity',
        variant: 'destructive',
      })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => crmApi.completeActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast({
        title: tCommon('success'),
        description: t('completeSuccess'),
      })
    },
  })

  const handleDelete = (activity: Activity) => {
    setSelectedActivity(activity)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedActivity) {
      deleteMutation.mutate(selectedActivity.id)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone
      case 'email':
        return Mail
      case 'meeting':
        return Calendar
      case 'task':
        return CheckCircle2
      case 'note':
        return FileText
      case 'whatsapp':
        return MessageSquare
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'canceled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'planned':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const columns: ColumnDef<Activity>[] = [
    {
      accessorKey: 'activity_type',
      header: t('type'),
      cell: ({ row }) => {
        const Icon = getActivityIcon(row.original.activity_type)
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{tTypes(row.original.activity_type)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'subject',
      header: t('subject'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.subject}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'related_to',
      header: t('relatedTo'),
      cell: ({ row }) => {
        const activity = row.original
        if (activity.deal_title) {
          return <span className="text-sm">{activity.deal_title}</span>
        }
        if (activity.contact_name) {
          return <span className="text-sm">{activity.contact_name}</span>
        }
        if (activity.lead_name) {
          return <span className="text-sm">{activity.lead_name}</span>
        }
        return <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {tStatuses(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'scheduled_at',
      header: t('scheduledAt'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.scheduled_at ? (
            <>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(row.original.scheduled_at).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const activity = row.original
        const isCompleted = activity.status === 'completed'
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && (
                <DropdownMenuItem
                  onClick={() => completeMutation.mutate(activity.id)}
                  disabled={completeMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('markComplete')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedActivity(activity)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(activity)} className="text-red-600">
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
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manage')}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedActivity(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={tCommon('search')}
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
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
            ) : data?.results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noActivities')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedActivity(null)
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

        <ActivityForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedActivity(null)
          }}
          activity={selectedActivity || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedActivity(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedActivity?.subject
              ? t('deleteConfirm', { subject: selectedActivity.subject })
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

