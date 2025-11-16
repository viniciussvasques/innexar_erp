'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationsApi, type QuickBooksIntegration } from '@/lib/api/integrations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { Building2, CheckCircle2, XCircle, RefreshCw, Link2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface QuickBooksSetupProps {
  integration?: QuickBooksIntegration
  onConnected?: () => void
}

export function QuickBooksSetup({ integration, onConnected }: QuickBooksSetupProps) {
  const t = useTranslations('integrations')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)

  // Get OAuth URL
  const { data: oauthData } = useQuery({
    queryKey: ['quickbooks', 'oauth-url'],
    queryFn: () => integrationsApi.getQuickBooksOAuthUrl(),
    enabled: !integration,
  })

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: (id: number) => integrationsApi.testQuickBooksConnection(id),
    onSuccess: (data) => {
      if (data.connected) {
        toast({
          title: tCommon('success'),
          description: t('connectionSuccessful'),
        })
      } else {
        toast({
          title: tCommon('error'),
          description: data.error || t('connectionFailed'),
          variant: 'destructive',
        })
      }
    },
  })

  // Refresh token
  const refreshTokenMutation = useMutation({
    mutationFn: (id: number) => integrationsApi.refreshQuickBooksToken(id),
    onSuccess: () => {
      toast({
        title: tCommon('success'),
        description: t('tokenRefreshed'),
      })
      queryClient.invalidateQueries({ queryKey: ['quickbooks'] })
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.error || t('tokenRefreshFailed'),
        variant: 'destructive',
      })
    },
  })

  // Update integration
  const updateMutation = useMutation({
    mutationFn: (data: Partial<QuickBooksIntegration>) =>
      integrationsApi.updateQuickBooksIntegration(integration!.id, data),
    onSuccess: () => {
      toast({
        title: tCommon('success'),
        description: t('settingsUpdated'),
      })
      queryClient.invalidateQueries({ queryKey: ['quickbooks'] })
    },
  })

  const handleConnect = () => {
    if (oauthData?.auth_url) {
      setIsConnecting(true)
      window.location.href = oauthData.auth_url
    }
  }

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const realmId = urlParams.get('realmId')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      toast({
        title: tCommon('error'),
        description: error,
        variant: 'destructive',
      })
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (code && realmId && !integration) {
      setIsConnecting(true)
      integrationsApi.quickBooksOAuthCallback(code, realmId, state || undefined)
        .then(() => {
          toast({
            title: tCommon('success'),
            description: t('quickbooksConnected'),
          })
          queryClient.invalidateQueries({ queryKey: ['quickbooks'] })
          if (onConnected) {
            onConnected()
          }
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch((error: any) => {
          toast({
            title: tCommon('error'),
            description: error.response?.data?.error || t('connectionFailed'),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsConnecting(false)
        })
    }
  }, [integration, toast, tCommon, t, queryClient, onConnected])

  const handleUpdate = (field: keyof QuickBooksIntegration, value: any) => {
    if (integration) {
      updateMutation.mutate({ [field]: value })
    }
  }

  if (!integration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('quickbooks')}
          </CardTitle>
          <CardDescription>{t('quickbooksDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('quickbooksConnectInstructions')}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>{t('whatIsQuickBooks')}</Label>
            <p className="text-sm text-muted-foreground">{t('quickbooksBenefits')}</p>
          </div>

          <Button
            onClick={handleConnect}
            disabled={!oauthData || isConnecting}
            className="w-full"
            size="lg"
          >
            <Link2 className="mr-2 h-4 w-4" />
            {isConnecting ? t('connecting') : t('connectQuickBooks')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('quickbooks')} - {integration.company_name || integration.realm_id}
        </CardTitle>
        <CardDescription>{t('quickbooksSettings')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {integration.is_token_expired ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <div>
              <p className="font-medium">
                {integration.is_token_expired ? t('connectionExpired') : t('connected')}
              </p>
              <p className="text-sm text-muted-foreground">
                {integration.company_name || integration.realm_id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnectionMutation.mutate(integration.id)}
              disabled={testConnectionMutation.isPending}
            >
              {testConnectionMutation.isPending ? tCommon('loading') : t('testConnection')}
            </Button>
            {integration.is_token_expired && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshTokenMutation.mutate(integration.id)}
                disabled={refreshTokenMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('refreshToken')}
              </Button>
            )}
          </div>
        </div>

        {/* Sync Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">{t('syncSettings')}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('syncCustomers')}</Label>
                <p className="text-sm text-muted-foreground">{t('syncCustomersDescription')}</p>
              </div>
              <Switch
                checked={integration.sync_customers}
                onCheckedChange={(checked) => handleUpdate('sync_customers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('syncInvoices')}</Label>
                <p className="text-sm text-muted-foreground">{t('syncInvoicesDescription')}</p>
              </div>
              <Switch
                checked={integration.sync_invoices}
                onCheckedChange={(checked) => handleUpdate('sync_invoices', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('syncPayments')}</Label>
                <p className="text-sm text-muted-foreground">{t('syncPaymentsDescription')}</p>
              </div>
              <Switch
                checked={integration.sync_payments}
                onCheckedChange={(checked) => handleUpdate('sync_payments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('syncItems')}</Label>
                <p className="text-sm text-muted-foreground">{t('syncItemsDescription')}</p>
              </div>
              <Switch
                checked={integration.sync_items}
                onCheckedChange={(checked) => handleUpdate('sync_items', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('syncEmployees')}</Label>
                <p className="text-sm text-muted-foreground">{t('syncEmployeesDescription')}</p>
              </div>
              <Switch
                checked={integration.sync_employees}
                onCheckedChange={(checked) => handleUpdate('sync_employees', checked)}
              />
            </div>
          </div>
        </div>

        {/* Sync Direction */}
        <div className="space-y-2">
          <Label>{t('syncDirection')}</Label>
          <Select
            value={integration.sync_direction}
            onValueChange={(value) => handleUpdate('sync_direction', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="innexar_to_qb">{t('innexarToQuickBooks')}</SelectItem>
              <SelectItem value="qb_to_innexar">{t('quickBooksToInnexar')}</SelectItem>
              <SelectItem value="bidirectional">{t('bidirectional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Sync */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('autoSync')}</Label>
              <p className="text-sm text-muted-foreground">{t('autoSyncDescription')}</p>
            </div>
            <Switch
              checked={integration.auto_sync_enabled}
              onCheckedChange={(checked) => handleUpdate('auto_sync_enabled', checked)}
            />
          </div>

          {integration.auto_sync_enabled && (
            <div className="space-y-2">
              <Label>{t('syncInterval')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={integration.sync_interval_minutes}
                  onChange={(e) => handleUpdate('sync_interval_minutes', parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">{t('minutes')}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

