'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Briefcase,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { analyticsApi } from '@/lib/api/analytics'
import { useFeatures } from '@/lib/hooks/use-features'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { plan, hasFeature } = useFeatures()

  // Buscar dados reais do dashboard
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => analyticsApi.getDashboard({ period: '30d' }),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Dados dinâmicos ou fallback
  const stats = [
    {
      title: t('sales'),
      value: dashboardData?.sales?.total || '$0.00',
      change: dashboardData?.sales?.change_percent
        ? `${dashboardData.sales.change_percent > 0 ? '+' : ''}${dashboardData.sales.change_percent.toFixed(1)}%`
        : '0%',
      changeType: dashboardData?.sales?.change_percent
        ? dashboardData.sales.change_percent > 0
          ? 'positive'
          : 'negative'
        : 'neutral',
      icon: DollarSign,
      description: t('fromLastMonth'),
      isLoading: isLoading,
    },
    {
      title: t('leads'),
      value: dashboardData?.leads?.total?.toString() || '0',
      change: dashboardData?.leads?.new_today ? `+${dashboardData.leads.new_today}` : '+0',
      changeType: 'positive',
      icon: Users,
      description: t('newToday'),
      isLoading: isLoading,
    },
    {
      title: t('receivable'),
      value: dashboardData?.receivable?.total || '$0.00',
      change: dashboardData?.receivable?.overdue ? `Overdue: ${dashboardData.receivable.overdue}` : '0',
      changeType: dashboardData?.receivable?.overdue && parseFloat(dashboardData.receivable.overdue) > 0
        ? 'negative'
        : 'neutral',
      icon: TrendingUp,
      description: hasFeature('finance')
        ? dashboardData?.receivable?.overdue
          ? `Overdue: ${dashboardData.receivable.overdue}`
          : `${t('dueIn')} 7 ${t('days')}`
        : `${t('dueIn')} 7 ${t('days')}`,
      isLoading: isLoading,
    },
    {
      title: t('tasks'),
      value: dashboardData?.tasks?.total?.toString() || '0',
      change: dashboardData?.tasks?.due_today?.toString() || '0',
      changeType: 'neutral',
      icon: FileText,
      description: `${dashboardData?.tasks?.due_today || 0} ${t('dueToday')}`,
      isLoading: isLoading,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'deal',
      title: 'New deal created',
      description: 'Enterprise Plan - Annual',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      id: 2,
      type: 'lead',
      title: 'Lead converted',
      description: 'John Doe → Contact',
      time: '4 hours ago',
      status: 'completed',
    },
    {
      id: 3,
      type: 'task',
      title: 'Task completed',
      description: 'Follow-up call with ACME Corp',
      time: '6 hours ago',
      status: 'completed',
    },
    {
      id: 4,
      type: 'invoice',
      title: 'Invoice issued',
      description: 'INV-2025-001 - $5,999.00',
      time: '1 day ago',
      status: 'pending',
    },
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: 'Follow-up call with Tech Corp',
      dueDate: 'Today, 2:00 PM',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Review proposal for Enterprise client',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Send invoice to ABC Company',
      dueDate: 'Tomorrow, 3:00 PM',
      priority: 'low',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {t('title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('welcome')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    {stat.isLoading ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {stat.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      <span className="text-sm text-slate-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {stat.value}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.changeType === 'positive' && (
                          <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                        )}
                        {stat.changeType === 'negative' && (
                          <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <p
                          className={cn(
                            'text-xs',
                            stat.changeType === 'positive' && 'text-green-600 dark:text-green-400',
                            stat.changeType === 'negative' && 'text-red-600 dark:text-red-400',
                            stat.changeType === 'neutral' && 'text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {stat.change} {stat.description}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest updates and actions in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                        activity.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-yellow-100 dark:bg-yellow-900/30'
                      )}
                    >
                      {activity.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50 flex-1">
                        {task.title}
                      </p>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          task.priority === 'high' &&
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                          task.priority === 'medium' &&
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                          task.priority === 'low' &&
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
