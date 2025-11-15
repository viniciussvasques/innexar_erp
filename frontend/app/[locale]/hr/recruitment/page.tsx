'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { UserCheck, Search, Plus, Briefcase } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import { JobOpening, Candidate } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

export default function RecruitmentPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')

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
      </div>
    </DashboardLayout>
  )
}

