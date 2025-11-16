'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api/hr'
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  Award,
  GraduationCap,
  UserCheck,
  UserPlus,
  BarChart3,
  PieChart,
  Briefcase,
  Bell,
  AlertCircle,
} from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function HRDashboardPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')

  // Buscar dados para estatísticas
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'stats'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000 }),
    retry: false,
  })

  const { data: departmentsData } = useQuery({
    queryKey: ['hr', 'departments', 'stats'],
    queryFn: () => hrApi.getDepartments({ active_only: true }),
    retry: false,
  })

  const { data: unreadNotificationsCount } = useQuery({
    queryKey: ['hr', 'notifications', 'unread-count'],
    queryFn: () => hrApi.getUnreadNotificationsCount(),
    retry: false,
  })

  const { data: recentNotifications } = useQuery({
    queryKey: ['hr', 'notifications', 'recent'],
    queryFn: () => hrApi.getNotifications({ page_size: 5 }),
    retry: false,
  })

  // Calcular estatísticas - otimizado com useMemo
  const stats = useMemo(() => {
    const employees = employeesData?.results || []
    return {
      totalEmployees: employeesData?.count || 0,
      activeEmployees: employees.filter(emp => emp.status === 'active').length,
      onLeaveEmployees: employees.filter(emp => emp.status === 'on_leave').length,
      terminatedEmployees: employees.filter(emp => emp.status === 'terminated').length,
      resignedEmployees: employees.filter(emp => emp.status === 'resigned').length,
      totalDepartments: departmentsData?.count || 0,
    }
  }, [employeesData, departmentsData])
  
  const { totalEmployees, activeEmployees, onLeaveEmployees, terminatedEmployees, resignedEmployees, totalDepartments } = stats

  // Dados para gráfico de status
  const statusData = [
    { name: t('statuses.active'), value: activeEmployees },
    { name: t('statuses.on_leave'), value: onLeaveEmployees },
    { name: t('statuses.terminated'), value: terminatedEmployees },
    { name: t('statuses.resigned'), value: resignedEmployees },
  ]

  // Dados para gráfico de departamentos
  const departmentStats = departmentsData?.results?.map(dept => ({
    name: dept.name,
    employees: employeesData?.results?.filter(emp => emp.department_id === dept.id).length || 0,
  })) || []

  const quickActions = [
    { href: '/hr/employees', icon: UserPlus, label: t('newEmployee'), color: 'bg-blue-500' },
    { href: '/hr/departments', icon: Building2, label: t('newDepartment'), color: 'bg-green-500' },
    { href: '/hr/payroll', icon: DollarSign, label: t('processPayroll'), color: 'bg-yellow-500' },
    { href: '/hr/time-records', icon: Clock, label: t('registerTime'), color: 'bg-purple-500' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('dashboardDescription')}</p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalEmployees')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{t('activeEmployees')}: {activeEmployees}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalDepartments')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDepartments}</div>
              <p className="text-xs text-muted-foreground">{t('activeDepartments')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('onLeave')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onLeaveEmployees}</div>
              <p className="text-xs text-muted-foreground">{t('employeesOnLeave')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('terminated')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{terminatedEmployees}</div>
              <p className="text-xs text-muted-foreground">{t('thisYear')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Notificações Recentes */}
        {unreadNotificationsCount && unreadNotificationsCount.count > 0 && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <CardTitle className="text-yellow-900 dark:text-yellow-100">
                    {t('pendingNotifications') || 'Pending Notifications'}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {unreadNotificationsCount.count} {t('unread') || 'unread'}
                </Badge>
              </div>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                {t('pendingNotificationsDescription') || 'You have notifications that require your attention'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentNotifications && recentNotifications.results && recentNotifications.results.length > 0 ? (
                <div className="space-y-2">
                  {recentNotifications.results
                    .filter(n => !n.is_read)
                    .slice(0, 3)
                    .map(notification => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {format(new Date(notification.created_at), 'PPp')}
                          </p>
                        </div>
                      </div>
                    ))}
                  {unreadNotificationsCount.count > 3 && (
                    <Link href="/hr">
                      <Button variant="outline" className="w-full mt-2">
                        {t('viewAllNotifications') || 'View all notifications'} ({unreadNotificationsCount.count})
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('noPendingNotifications') || 'No pending notifications'}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Atalhos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>{t('quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-colors">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('employeesByStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {t('noData') || 'Sem dados para exibir'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Departamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('employeesByDepartment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {t('noData') || 'Sem dados para exibir'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Links Rápidos para Módulos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/hr/employees">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('employees')}
                </CardTitle>
                <CardDescription>{t('manageEmployees')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/job-positions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {t('jobPositions')}
                </CardTitle>
                <CardDescription>{t('manageJobPositions')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/departments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('departments')}
                </CardTitle>
                <CardDescription>{t('manageDepartments')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/payroll">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('payroll')}
                </CardTitle>
                <CardDescription>{t('managePayroll')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/time-records">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('timeRecords')}
                </CardTitle>
                <CardDescription>{t('manageTimeRecords')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/vacations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('vacations')}
                </CardTitle>
                <CardDescription>{t('manageVacations')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/benefits">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {t('benefits')}
                </CardTitle>
                <CardDescription>{t('manageBenefits')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
