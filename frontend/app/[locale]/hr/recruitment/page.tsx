'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { UserCheck, Search, Plus, Briefcase, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { JobOpening, Candidate } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { JobOpeningForm } from '@/components/hr/JobOpeningForm'
import { CandidateForm } from '@/components/hr/CandidateForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function RecruitmentPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')
  const [isJobFormOpen, setIsJobFormOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [isCandidateFormOpen, setIsCandidateFormOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'job' | 'candidate'; id: number } | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['hr', 'job-openings', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getJobOpenings({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
    retry: false,
    enabled: activeTab === 'jobs',
  })

  const { data: candidatesData, isLoading: candidatesLoading, error: candidatesError } = useQuery({
    queryKey: ['hr', 'candidates', page, pageSize, debouncedSearch],
    queryFn: () =>
      hrApi.getCandidates({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
    retry: false,
    enabled: activeTab === 'candidates',
  })

  const deleteJobMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteJobOpening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'job-openings'] })
      toast({
        title: tCommon('success'),
        description: t('deleteJobOpeningSuccess') || 'Job opening deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => hrApi.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'candidates'] })
      toast({
        title: tCommon('success'),
        description: t('deleteCandidateSuccess') || 'Candidate deleted successfully',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (type: 'job' | 'candidate', id: number) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'job') {
        deleteJobMutation.mutate(itemToDelete.id)
      } else {
        deleteCandidateMutation.mutate(itemToDelete.id)
      }
    }
  }

  const handleEditJob = (job: JobOpening) => {
    setSelectedJob(job)
    setIsJobFormOpen(true)
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsCandidateFormOpen(true)
  }

  const jobColumns: ColumnDef<JobOpening>[] = [
    {
      accessorKey: 'title',
      header: t('title') || 'Title',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: 'department',
      header: t('department'),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.department?.name || '-'}</span>
      ),
    },
    {
      accessorKey: 'posted_date',
      header: t('postedDate') || 'Posted Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.posted_date
            ? format(new Date(row.original.posted_date), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors: Record<string, string> = {
          open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        const statusLabels: Record<string, string> = {
          open: t('open') || 'Open',
          closed: t('closed') || 'Closed',
          cancelled: t('cancelled') || 'Cancelled',
        }
        return (
          <Badge className={statusColors[status] || ''}>
            {statusLabels[status] || status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const job = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditJob(job)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete('job', job.id)}
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

  const candidateColumns: ColumnDef<Candidate>[] = [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: t('email') || 'Email',
      cell: ({ row }) => <span className="text-sm">{row.original.email}</span>,
    },
    {
      accessorKey: 'job_opening',
      header: t('jobOpening') || 'Job Opening',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.job_opening?.title || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.status
        const statusLabels: Record<string, string> = {
          applied: t('applied') || 'Applied',
          screening: t('screening') || 'Screening',
          interview: t('interview') || 'Interview',
          test: t('test') || 'Test',
          approved: t('approved') || 'Approved',
          rejected: t('rejected') || 'Rejected',
          hired: t('hired') || 'Hired',
        }
        return (
          <Badge
            className={
              status === 'approved' || status === 'hired'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }
          >
            {statusLabels[status] || status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const candidate = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCandidate(candidate)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete('candidate', candidate.id)}
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
            <h1 className="text-3xl font-bold tracking-tight">{t('recruitment')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('manageRecruitment') || 'Manage job openings and candidates'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'jobs' | 'candidates')}>
          <TabsList>
            <TabsTrigger value="jobs">{t('jobOpenings') || 'Job Openings'}</TabsTrigger>
            <TabsTrigger value="candidates">{t('candidates') || 'Candidates'}</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('jobOpenings') || 'Job Openings'}</CardTitle>
                    <CardDescription>{t('manageJobOpenings') || 'Manage job openings'}</CardDescription>
                  </div>
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
                    <Button
                      onClick={() => {
                        setSelectedJob(null)
                        setIsJobFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newJobOpening') || 'New Job Opening'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                    <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
                  </div>
                ) : jobsError ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium text-red-500">
                      {(jobsError as any)?.response?.status === 404 ||
                      (jobsError instanceof Error &&
                        (jobsError.message.includes('404') || jobsError.message.includes('Not Found')))
                        ? t('apiNotAvailable')
                        : tCommon('error')}
                    </p>
                    {((jobsError as any)?.response?.status === 404 ||
                      (jobsError instanceof Error &&
                        (jobsError.message.includes('404') || jobsError.message.includes('Not Found')))) && (
                      <p className="text-xs text-muted-foreground text-center max-w-md">
                        {t('apiNotAvailableDescription')}
                      </p>
                    )}
                  </div>
                ) : jobsData?.results.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {t('noJobOpenings') || 'No job openings found'}
                    </p>
                  </div>
                ) : (
                  <DataTable
                    columns={jobColumns}
                    data={jobsData?.results || []}
                    pagination={{
                      page,
                      pageSize,
                      total: jobsData?.count || 0,
                      onPageChange: setPage,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('candidates') || 'Candidates'}</CardTitle>
                    <CardDescription>{t('manageCandidates') || 'Manage candidates'}</CardDescription>
                  </div>
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
                    <Button
                      onClick={() => {
                        setSelectedCandidate(null)
                        setIsCandidateFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('newCandidate') || 'New Candidate'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {candidatesLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                    <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
                  </div>
                ) : candidatesError ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <UserCheck className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium text-red-500">
                      {(candidatesError as any)?.response?.status === 404 ||
                      (candidatesError instanceof Error &&
                        (candidatesError.message.includes('404') ||
                          candidatesError.message.includes('Not Found')))
                        ? t('apiNotAvailable')
                        : tCommon('error')}
                    </p>
                    {((candidatesError as any)?.response?.status === 404 ||
                      (candidatesError instanceof Error &&
                        (candidatesError.message.includes('404') ||
                          candidatesError.message.includes('Not Found')))) && (
                      <p className="text-xs text-muted-foreground text-center max-w-md">
                        {t('apiNotAvailableDescription')}
                      </p>
                    )}
                  </div>
                ) : candidatesData?.results.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {t('noCandidates') || 'No candidates found'}
                    </p>
                  </div>
                ) : (
                  <DataTable
                    columns={candidateColumns}
                    data={candidatesData?.results || []}
                    pagination={{
                      page,
                      pageSize,
                      total: candidatesData?.count || 0,
                      onPageChange: setPage,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <JobOpeningForm
          open={isJobFormOpen}
          onClose={() => {
            setIsJobFormOpen(false)
            setSelectedJob(null)
          }}
          jobOpening={selectedJob || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'job-openings'] })
          }}
        />

        <CandidateForm
          open={isCandidateFormOpen}
          onClose={() => {
            setIsCandidateFormOpen(false)
            setSelectedCandidate(null)
          }}
          candidate={selectedCandidate || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hr', 'candidates'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('confirmDelete') || 'Confirm Delete'}
          description={
            itemToDelete
              ? itemToDelete.type === 'job'
                ? t('deleteJobOpeningConfirm') ||
                  'Are you sure you want to delete this job opening? This action cannot be undone.'
                : t('deleteCandidateConfirm') ||
                  'Are you sure you want to delete this candidate? This action cannot be undone.'
              : t('deleteConfirmGeneric') || 'Are you sure you want to delete this item?'
          }
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          isLoading={deleteJobMutation.isPending || deleteCandidateMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}

