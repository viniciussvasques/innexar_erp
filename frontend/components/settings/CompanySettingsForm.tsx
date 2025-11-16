'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tenantsApi, type TenantSettings } from '@/lib/api/tenants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Lock, Globe, Briefcase, Mail } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

interface CompanySettingsFormProps {
  isAdmin?: boolean
}

export function CompanySettingsForm({ isAdmin = false }: CompanySettingsFormProps) {
  const t = useTranslations('settings')
  const tOnboarding = useTranslations('onboarding')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantsApi.getTenantSettings(),
  })

  const { data: countries = [] } = useQuery({
    queryKey: ['onboarding', 'countries'],
    queryFn: () => tenantsApi.getCountries(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TenantSettings>) => tenantsApi.updateTenantSettings(data),
    onSuccess: () => {
      toast({
        title: tCommon('success'),
        description: t('settingsUpdated'),
      })
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] })
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || t('updateFailed'),
        variant: 'destructive',
      })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TenantSettings>({
    defaultValues: settings,
  })

  useEffect(() => {
    if (settings) {
      Object.entries(settings).forEach(([key, value]) => {
        setValue(key as keyof TenantSettings, value)
      })
    }
  }, [settings, setValue])

  const watchedCountry = watch('country')
  const watchedLanguage = watch('language')

  useEffect(() => {
    if (watchedCountry && countries.length > 0) {
      const country = countries.find(c => c.code === watchedCountry)
      if (country) {
        setValue('currency', country.currency)
        setValue('timezone', country.timezone)
        if (!watchedLanguage) {
          setValue('language', country.language)
        }
      }
    }
  }, [watchedCountry, countries, setValue, watchedLanguage])

  const onSubmit = (data: Partial<TenantSettings>) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return <div className="text-center py-8">{tCommon('loading')}</div>
  }

  // Campos que apenas admin pode editar
  const adminOnlyFields = [
    'company_name',
    'legal_name',
    'legal_entity_type',
    'tax_id',
    'registration_number',
    'country',
    'currency',
    'timezone',
    'fiscal_year_start',
    'tax_regime',
  ]

  // Campos que qualquer usuário pode editar
  const userEditableFields = [
    'language',
    'date_format',
    'time_format',
  ]

  const isFieldEditable = (field: string) => {
    if (isAdmin) return true
    return userEditableFields.includes(field)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('companyInformation')}
          </CardTitle>
          <CardDescription>{t('companyInformationDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">
              {tOnboarding('companyName')}
              {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
            </Label>
            <Input
              id="company_name"
              {...register('company_name')}
              disabled={!isFieldEditable('company_name')}
              className={!isFieldEditable('company_name') ? 'bg-muted' : ''}
            />
            {!isFieldEditable('company_name') && (
              <p className="text-xs text-muted-foreground">{t('adminOnly')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">
              {tOnboarding('legalName')}
              {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
            </Label>
            <Input
              id="legal_name"
              {...register('legal_name')}
              disabled={!isFieldEditable('legal_name')}
              className={!isFieldEditable('legal_name') ? 'bg-muted' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id">
                {tOnboarding('taxId')}
                {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
              </Label>
              <Input
                id="tax_id"
                {...register('tax_id')}
                disabled={!isFieldEditable('tax_id')}
                className={!isFieldEditable('tax_id') ? 'bg-muted' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">
                {tOnboarding('registrationNumber')}
                {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
              </Label>
              <Input
                id="registration_number"
                {...register('registration_number')}
                disabled={!isFieldEditable('registration_number')}
                className={!isFieldEditable('registration_number') ? 'bg-muted' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('regionalSettings')}
          </CardTitle>
          <CardDescription>{t('regionalSettingsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">
              {tOnboarding('country')}
              {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
            </Label>
            <Select
              value={watch('country') || ''}
              onValueChange={value => setValue('country', value)}
              disabled={!isFieldEditable('country')}
            >
              <SelectTrigger className={!isFieldEditable('country') ? 'bg-muted' : ''}>
                <SelectValue placeholder={tOnboarding('selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency_symbol} {country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">
                {tOnboarding('currency')}
                {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
              </Label>
              <Input
                id="currency"
                {...register('currency')}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">
                {tOnboarding('timezone')}
                {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
              </Label>
              <Input
                id="timezone"
                {...register('timezone')}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">{tOnboarding('language')}</Label>
              <Select
                value={watch('language') || 'pt'}
                onValueChange={value => setValue('language', value)}
                disabled={!isFieldEditable('language')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">{tOnboarding('dateFormat')}</Label>
              <Select
                value={watch('date_format') || 'DD/MM/YYYY'}
                onValueChange={value => setValue('date_format', value)}
                disabled={!isFieldEditable('date_format')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_format">{tOnboarding('timeFormat')}</Label>
              <Select
                value={watch('time_format') || '24h'}
                onValueChange={value => setValue('time_format', value)}
                disabled={!isFieldEditable('time_format')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="12h">12 hours (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('businessInformation')}
          </CardTitle>
          <CardDescription>{t('businessInformationDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_type">
              {tOnboarding('businessType')}
              {!isAdmin && <Lock className="inline h-3 w-3 ml-1 text-muted-foreground" />}
            </Label>
            <Select
              value={watch('business_type') || ''}
              onValueChange={value => setValue('business_type', value)}
              disabled={!isFieldEditable('business_type')}
            >
              <SelectTrigger className={!isFieldEditable('business_type') ? 'bg-muted' : ''}>
                <SelectValue placeholder={tOnboarding('selectBusinessType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">{tOnboarding('retail')}</SelectItem>
                <SelectItem value="wholesale">{tOnboarding('wholesale')}</SelectItem>
                <SelectItem value="manufacturing">{tOnboarding('manufacturing')}</SelectItem>
                <SelectItem value="services">{tOnboarding('services')}</SelectItem>
                <SelectItem value="ecommerce">{tOnboarding('ecommerce')}</SelectItem>
                <SelectItem value="restaurant">{tOnboarding('restaurant')}</SelectItem>
                <SelectItem value="healthcare">{tOnboarding('healthcare')}</SelectItem>
                <SelectItem value="education">{tOnboarding('education')}</SelectItem>
                <SelectItem value="construction">{tOnboarding('construction')}</SelectItem>
                <SelectItem value="logistics">{tOnboarding('logistics')}</SelectItem>
                <SelectItem value="technology">{tOnboarding('technology')}</SelectItem>
                <SelectItem value="consulting">{tOnboarding('consulting')}</SelectItem>
                <SelectItem value="other">{tOnboarding('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">{tOnboarding('industry')}</Label>
            <Input
              id="industry"
              {...register('industry')}
              placeholder={tOnboarding('industryPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('contactInformation')}
          </CardTitle>
          <CardDescription>{t('contactInformationDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">{tOnboarding('address')}</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder={tOnboarding('addressPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{tOnboarding('city')}</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder={tOnboarding('cityPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">{tOnboarding('state')}</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder={tOnboarding('statePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">{tOnboarding('postalCode')}</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder={tOnboarding('postalCodePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{tOnboarding('phone')}</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder={tOnboarding('phonePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tOnboarding('email')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={tOnboarding('emailPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{tOnboarding('website')}</Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                placeholder={tOnboarding('websitePlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (settings) {
              Object.entries(settings).forEach(([key, value]) => {
                setValue(key as keyof TenantSettings, value)
              })
            }
          }}
          disabled={!isDirty}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </form>
  )
}

