'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from '@/lib/i18n/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/lib/hooks/use-toast'
import { tenantsApi, type OnboardingData, type Country } from '@/lib/api/tenants'
import { Building2, MapPin, Briefcase, Mail, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
  open: boolean
  onComplete: () => void
}

const STEPS = [
  { id: 1, title: 'Basic Information', icon: Building2 },
  { id: 2, title: 'Location & Regional', icon: MapPin },
  { id: 3, title: 'Business Information', icon: Briefcase },
  { id: 4, title: 'Contact (Optional)', icon: Mail },
]

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const t = useTranslations('onboarding')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    main_activity: 'products',
    fiscal_year_start: '01-01',
  })
  const [requiredFields, setRequiredFields] = useState<Record<string, boolean>>({})

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['onboarding', 'countries'],
    queryFn: () => tenantsApi.getCountries(),
    enabled: open,
  })

  // Fetch requirements when country or legal entity type changes
  const { data: requirements } = useQuery({
    queryKey: ['onboarding', 'requirements', formData.country, formData.legal_entity_type],
    queryFn: () => tenantsApi.getRequirements(
      formData.country || 'BR',
      formData.legal_entity_type
    ),
    enabled: open && !!formData.country,
  })

  useEffect(() => {
    if (requirements) {
      setRequiredFields(requirements.required_fields)
    }
  }, [requirements])

  // Complete onboarding mutation
  const completeMutation = useMutation({
    mutationFn: (data: OnboardingData) => tenantsApi.completeOnboarding(data),
    onSuccess: (_, variables) => {
      toast({
        title: tCommon('success'),
        description: t('onboardingCompleted'),
      })
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] })
      
      // Get the selected language from form data
      const selectedLanguage = variables.language || 'pt'
      
      // Update localStorage with the selected language
      localStorage.setItem('locale', selectedLanguage)
      
      // If the current locale is different from the selected one, redirect
      if (selectedLanguage !== currentLocale) {
        // usePathname already returns pathname without locale
        // But we need to ensure it starts with /
        const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`
        const newPath = `/${selectedLanguage}${cleanPath}`
        window.location.href = newPath
      } else {
        onComplete()
      }
    },
    onError: (error: any) => {
      console.error('Onboarding error:', error)
      
      // Extract error messages from backend response
      let errorMessage = t('onboardingFailed')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Handle Django REST Framework validation errors
        if (typeof errorData === 'object') {
          const errorMessages: string[] = []
          
          // Handle field-specific errors
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                // Try to get translated field label
                let fieldLabel = field
                if (field === 'company_name') fieldLabel = t('companyName')
                else if (field === 'legal_name') fieldLabel = t('legalName')
                else if (field === 'tax_id') fieldLabel = t('taxId')
                else if (field === 'registration_number') fieldLabel = t('registrationNumber')
                else if (field === 'country') fieldLabel = t('country')
                else if (field === 'currency') fieldLabel = t('currency')
                else if (field === 'timezone') fieldLabel = t('timezone')
                else if (field === 'language') fieldLabel = t('language')
                else if (field === 'date_format') fieldLabel = t('dateFormat')
                else if (field === 'time_format') fieldLabel = t('timeFormat')
                else if (field === 'business_type') fieldLabel = t('businessType')
                else if (field === 'main_activity') fieldLabel = t('mainActivity')
                else if (field === 'legal_entity_type') fieldLabel = t('legalEntityType')
                else {
                  fieldLabel = field.replace('_', ' ')
                }
                errorMessages.push(`${fieldLabel}: ${msg}`)
              })
            } else if (typeof messages === 'string') {
              let fieldLabel = field
              if (field === 'company_name') fieldLabel = t('companyName')
              else if (field === 'legal_name') fieldLabel = t('legalName')
              else if (field === 'tax_id') fieldLabel = t('taxId')
              else if (field === 'registration_number') fieldLabel = t('registrationNumber')
              else {
                fieldLabel = field.replace('_', ' ')
              }
              errorMessages.push(`${fieldLabel}: ${messages}`)
            } else if (Array.isArray(messages) && messages.length > 0) {
              errorMessages.push(...messages.map((m: string) => String(m)))
            }
          })
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ')
          } else if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
        errorMessage = t('networkError')
      }
      
      toast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  // Auto-fill country data when country changes
  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const country = countries.find(c => c.code === formData.country)
      if (country) {
        setFormData(prev => ({
          ...prev,
          currency: country.currency,
          timezone: country.timezone,
          language: country.language,
        }))
      }
    }
  }, [formData.country, countries])

  // Update requirements when country or legal entity type changes
  useEffect(() => {
    if (formData.country) {
      // Trigger refetch of requirements
      queryClient.invalidateQueries({
        queryKey: ['onboarding', 'requirements', formData.country, formData.legal_entity_type]
      })
    }
  }, [formData.country, formData.legal_entity_type, queryClient])

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Validate required fields dynamically
    const errors: string[] = []
    
    Object.entries(requiredFields).forEach(([field, isRequired]) => {
      if (isRequired) {
        const value = formData[field as keyof OnboardingData]
        if (!value || (typeof value === 'string' && !value.trim())) {
          // Try to get translated field label
          const fieldKey = field as keyof typeof t
          let fieldLabel = field
          
          // Try common field translations
          if (field === 'company_name') fieldLabel = t('companyName')
          else if (field === 'legal_name') fieldLabel = t('legalName')
          else if (field === 'tax_id') fieldLabel = t('taxId')
          else if (field === 'registration_number') fieldLabel = t('registrationNumber')
          else if (field === 'country') fieldLabel = t('country')
          else if (field === 'currency') fieldLabel = t('currency')
          else if (field === 'timezone') fieldLabel = t('timezone')
          else if (field === 'language') fieldLabel = t('language')
          else if (field === 'date_format') fieldLabel = t('dateFormat')
          else if (field === 'time_format') fieldLabel = t('timeFormat')
          else if (field === 'business_type') fieldLabel = t('businessType')
          else if (field === 'main_activity') fieldLabel = t('mainActivity')
          else if (field === 'legal_entity_type') fieldLabel = t('legalEntityType')
          else {
            // Fallback to requirements field labels or formatted field name
            fieldLabel = requirements?.field_labels[field] || field.replace('_', ' ')
          }
          
          errors.push(t('fieldRequired', { field: fieldLabel }))
        }
      }
    })
    
    if (errors.length > 0) {
      toast({
        title: tCommon('error'),
        description: errors.join(', '),
        variant: 'destructive',
      })
      return
    }

    completeMutation.mutate(formData as OnboardingData)
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent size="large" className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('welcomeTitle')}</DialogTitle>
          <DialogDescription>{t('welcomeDescription')}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('step')} {currentStep} {t('of')} {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mb-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isCompleted && 'border-primary bg-primary text-primary-foreground',
                        !isActive && !isCompleted && 'border-muted bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={cn(
                      'text-xs mt-2 text-center',
                      isActive && 'font-semibold text-primary',
                      !isActive && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'h-0.5 flex-1 mx-2 mt-[-20px]',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-4 min-h-[300px]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  {t('companyName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={e => updateField('company_name', e.target.value)}
                  placeholder={t('companyNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_entity_type">
                  {t('legalEntityType')}
                  {requiredFields.legal_entity_type && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={formData.legal_entity_type || ''}
                  onValueChange={value => updateField('legal_entity_type', value)}
                >
                  <SelectTrigger id="legal_entity_type">
                    <SelectValue placeholder={t('selectLegalEntityType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t('individual')}</SelectItem>
                    <SelectItem value="llc">{t('llc')}</SelectItem>
                    <SelectItem value="corporation">{t('corporation')}</SelectItem>
                    <SelectItem value="partnership">{t('partnership')}</SelectItem>
                    <SelectItem value="sole_proprietorship">{t('soleProprietorship')}</SelectItem>
                    <SelectItem value="nonprofit">{t('nonprofit')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name">
                  {t('legalName')}
                  {requiredFields.legal_name && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name || ''}
                  onChange={e => updateField('legal_name', e.target.value)}
                  placeholder={t('legalNamePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">
                    {t('taxId')}
                    {requiredFields.tax_id && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id || ''}
                    onChange={e => updateField('tax_id', e.target.value)}
                    placeholder={t('taxIdPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    {t('registrationNumber')}
                    {requiredFields.registration_number && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number || ''}
                    onChange={e => updateField('registration_number', e.target.value)}
                    placeholder={t('registrationNumberPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Regional */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">
                  {t('country')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country || ''}
                  onValueChange={value => updateField('country', value)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t('selectCountry')} />
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
                  <Label htmlFor="currency">{t('currency')}</Label>
                  <Input
                    id="currency"
                    value={formData.currency || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('timezone')}</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select
                    value={formData.language || 'pt'}
                    onValueChange={value => updateField('language', value)}
                  >
                    <SelectTrigger id="language">
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
                  <Label htmlFor="date_format">{t('dateFormat')}</Label>
                  <Select
                    value={formData.date_format || 'DD/MM/YYYY'}
                    onValueChange={value => updateField('date_format', value)}
                  >
                    <SelectTrigger id="date_format">
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
                  <Label htmlFor="time_format">{t('timeFormat')}</Label>
                  <Select
                    value={formData.time_format || '24h'}
                    onValueChange={value => updateField('time_format', value)}
                  >
                    <SelectTrigger id="time_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="12h">12 hours (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">
                  {t('businessType')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.business_type || ''}
                  onValueChange={value => updateField('business_type', value)}
                >
                  <SelectTrigger id="business_type">
                    <SelectValue placeholder={t('selectBusinessType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">{t('retail')}</SelectItem>
                    <SelectItem value="wholesale">{t('wholesale')}</SelectItem>
                    <SelectItem value="manufacturing">{t('manufacturing')}</SelectItem>
                    <SelectItem value="services">{t('services')}</SelectItem>
                    <SelectItem value="ecommerce">{t('ecommerce')}</SelectItem>
                    <SelectItem value="restaurant">{t('restaurant')}</SelectItem>
                    <SelectItem value="healthcare">{t('healthcare')}</SelectItem>
                    <SelectItem value="education">{t('education')}</SelectItem>
                    <SelectItem value="construction">{t('construction')}</SelectItem>
                    <SelectItem value="logistics">{t('logistics')}</SelectItem>
                    <SelectItem value="technology">{t('technology')}</SelectItem>
                    <SelectItem value="consulting">{t('consulting')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">{t('industry')}</Label>
                <Input
                  id="industry"
                  value={formData.industry || ''}
                  onChange={e => updateField('industry', e.target.value)}
                  placeholder={t('industryPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_activity">
                  {t('mainActivity')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.main_activity || 'products'}
                  onValueChange={value => updateField('main_activity', value)}
                >
                  <SelectTrigger id="main_activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">{t('products')}</SelectItem>
                    <SelectItem value="services">{t('services')}</SelectItem>
                    <SelectItem value="both">{t('both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Contact (Optional) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={e => updateField('address', e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('city')}</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={e => updateField('city', e.target.value)}
                    placeholder={t('cityPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{t('state')}</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={e => updateField('state', e.target.value)}
                    placeholder={t('statePlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">{t('postalCode')}</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ''}
                    onChange={e => updateField('postal_code', e.target.value)}
                    placeholder={t('postalCodePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={e => updateField('email', e.target.value)}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t('website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={e => updateField('website', e.target.value)}
                    placeholder={t('websitePlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {tCommon('back')}
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              {tCommon('next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? tCommon('saving') : t('completeOnboarding')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

