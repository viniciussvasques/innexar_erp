'use client'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm'
import { PreferencesForm } from '@/components/settings/PreferencesForm'
import { QuickBooksSetup } from '@/components/integrations/QuickBooksSetup'
import { Building2, User, Bell, Shield, Plug } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { integrationsApi } from '@/lib/api/integrations'

function IntegrationsTab() {
  const { data: quickbooksIntegrations } = useQuery({
    queryKey: ['quickbooks'],
    queryFn: () => integrationsApi.getQuickBooksIntegrations(),
  })

  const quickbooksIntegration = quickbooksIntegrations?.[0]

  return (
    <div className="space-y-4">
      <QuickBooksSetup integration={quickbooksIntegration} />
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const user = useAuthStore(state => state.user)
  
  // Verificar se é admin (pode ser is_staff, is_superuser, ou ter role de admin)
  const isAdmin = user?.is_staff || user?.is_superuser || false

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('company')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('profile')}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('preferences')}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              {t('integrations')}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('security')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('companySettings')}</CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? t('companySettingsDescriptionAdmin')
                    : t('companySettingsDescriptionUser')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanySettingsForm isAdmin={isAdmin} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('userProfile')}</CardTitle>
                <CardDescription>{t('userProfileDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <PreferencesForm />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsTab />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('security')}</CardTitle>
                  <CardDescription>{t('securityDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
