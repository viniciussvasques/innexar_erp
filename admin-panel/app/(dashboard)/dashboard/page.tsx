'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data for charts (will be replaced with backend API)
const monthlyRevenueData = [
  { month: 'Jan', revenue: 45000, tenants: 12 },
  { month: 'Fev', revenue: 52000, tenants: 15 },
  { month: 'Mar', revenue: 48000, tenants: 14 },
  { month: 'Abr', revenue: 61000, tenants: 18 },
  { month: 'Mai', revenue: 75000, tenants: 22 },
  { month: 'Jun', revenue: 88000, tenants: 28 },
];

const planDistribution = [
  { name: 'Trial', value: 45, color: '#93c5fd' },
  { name: 'Basic', value: 30, color: '#60a5fa' },
  { name: 'Professional', value: 20, color: '#2563eb' },
  { name: 'Enterprise', value: 5, color: '#1e40af' },
];

const recentActivity = [
  { id: 1, tenant: 'TechCorp Solutions', action: 'Upgrade to Enterprise', time: '2 min ago', type: 'upgrade' },
  { id: 2, tenant: 'StartupXYZ', action: 'New signup', time: '15 min ago', type: 'signup' },
  { id: 3, tenant: 'GlobalTrade Inc', action: 'Payment received', time: '1 hour ago', type: 'payment' },
  { id: 4, tenant: 'DesignStudio', action: 'Trial started', time: '3 hours ago', type: 'trial' },
];

const getActivityBgColor = (type: string) => {
  if (type === 'upgrade') return 'bg-brand-100';
  if (type === 'signup') return 'bg-success-100';
  if (type === 'payment') return 'bg-warning-100';
  return 'bg-gray-100';
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent border-brand-500" />
          <p className="mt-4 text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral completa do sistema Innexar ERP
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Tenants */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Total Tenants
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_tenants || 0}
            </div>
            <div className="flex items-center mt-3 text-sm">
              <span className="text-green-700 flex items-center font-semibold">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12.5%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              {stats?.active_tenants || 0} ativos • {(stats?.total_tenants || 0) - (stats?.active_tenants || 0)} inativos
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Total Users
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_users || 0}
            </div>
            <div className="flex items-center mt-3 text-sm">
              <span className="text-green-700 flex items-center font-semibold">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                8.2%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              Active user growth trend
            </p>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Monthly Revenue
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              R$ {(stats?.mrr || 0).toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center mt-3 text-sm">
              <span className="text-green-700 flex items-center font-semibold">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                15.8%
              </span>
              <span className="text-gray-500 ml-2">MRR growth</span>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              Monthly Recurring Revenue
            </p>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Growth Rate
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {(stats?.growth_rate || 0).toFixed(1)}%
            </div>
            <div className="flex items-center mt-3 text-sm">
              <span className="text-green-700 flex items-center font-semibold">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                2.4%
              </span>
              <span className="text-gray-500 ml-2">acceleration</span>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              {stats?.new_tenants_this_month || 0} new tenants this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Revenue Chart */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Revenue Overview</CardTitle>
            <p className="text-sm text-gray-600">Monthly revenue and tenant growth</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  name="Revenue (R$)"
                  dot={{ fill: '#2563eb', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tenants" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Tenants"
                  dot={{ fill: '#22c55e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Plan Distribution</CardTitle>
            <p className="text-sm text-gray-600">Tenant distribution by plan</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Latest system events</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${getActivityBgColor(activity.type)}`}>
                    {activity.tenant[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activity.tenant}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

