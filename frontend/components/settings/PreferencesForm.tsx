'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { tenantsApi, type TenantSettings } from '@/lib/api/tenants'
import { Globe, Save } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function PreferencesForm() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'pt'
  
  // Map backend language format to frontend locale format
  const mapLanguageToLocale = (lang: string | undefined): string => {
    if (!lang) return currentLocale
    // Backend uses 'pt' and frontend also uses 'pt' - no conversion needed
    // But handle legacy 'pt-br' if it exists
    if (lang === 'pt-br' || lang === 'pt') return 'pt'
    return lang
  }
  
  const mapLocaleToLanguage = (locale: string): string => {
    // Backend accepts 'pt', 'en', 'es' - no conversion needed
    // Frontend uses same format
    return locale
  }

  const { data: settings, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantsApi.getTenantSettings(),
  })

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isDirty },
  } = useForm<{ language: string }>({
    defaultValues: {
      language: mapLanguageToLocale(settings?.language) || currentLocale,
    },
  })

  // Update form when settings change
  useEffect(() => {
    if (settings?.language) {
      const locale = mapLanguageToLocale(settings.language)
      setValue('language', locale, { shouldDirty: false })
    }
  }, [settings?.language, setValue])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TenantSettings>) => tenantsApi.updateTenantSettings(data),
    onSuccess: (_, variables) => {
      toast({
        title: tCommon('success'),
        description: t('preferencesUpdated'),
      })
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] })
      
      // If language changed, redirect to new locale
      if (variables.language) {
        const newLocale = mapLanguageToLocale(variables.language)
        if (newLocale !== currentLocale) {
          const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/dashboard'
          const newPath = `/${newLocale}${pathWithoutLocale}`
          // Use setTimeout to allow toast to show before redirect
          setTimeout(() => {
            window.location.href = newPath
          }, 1000)
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || t('updateFailed'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: { language: string }) => {
    // Convert frontend locale to backend language format
    const backendLanguage = mapLocaleToLanguage(data.language)
    updateMutation.mutate({ language: backendLanguage })
  }

  const selectedLanguage = watch('language')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('languageSettings')}
          </CardTitle>
          <CardDescription>{t('languageSettingsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('systemLanguage')}</Label>
            <Select
              value={selectedLanguage || currentLocale}
              onValueChange={value => setValue('language', value, { shouldDirty: true })}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">
                  <div className="flex items-center gap-2">
                    <span>🇧🇷</span>
                    <span>Português (Brasil)</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem value="es">
                  <div className="flex items-center gap-2">
                    <span>🇪🇸</span>
                    <span>Español</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t('languageSettingsHint')}</p>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

