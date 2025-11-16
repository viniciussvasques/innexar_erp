'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { EmployeeBenefit, Employee, Benefit } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const employeeBenefitSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  benefit_id: z.number().min(1, 'Benefit is required'),
  value: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type EmployeeBenefitFormData = z.infer<typeof employeeBenefitSchema>

interface EmployeeBenefitFormProps {
  open: boolean
  onClose: () => void
  employeeBenefit?: EmployeeBenefit | null
  employeeId?: number
}

export function EmployeeBenefitForm({
  open,
  onClose,
  employeeBenefit,
  employeeId,
}: EmployeeBenefitFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Helper para formatação de moeda baseada no locale
  const formatCurrency = (value: number) => {
    const localeMap: Record<string, { locale: string; currency: string }> = {
      pt: { locale: 'pt-BR', currency: 'BRL' },
      en: { locale: 'en-US', currency: 'USD' },
      es: { locale: 'es-ES', currency: 'EUR' },
    }
    const config = localeMap[locale] || localeMap.pt
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
    }).format(value)
  }

  // Buscar funcionários
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'list'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000, status: 'active' }),
    enabled: !employeeId,
  })

  // Buscar benefícios
  const { data: benefitsData } = useQuery({
    queryKey: ['hr', 'benefits', 'list'],
    queryFn: () => hrApi.getBenefits({ page_size: 1000, is_active: true }),
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EmployeeBenefitFormData>({
    resolver: zodResolver(employeeBenefitSchema),
    defaultValues: employeeBenefit
      ? {
          employee_id: employeeBenefit.employee_id || employeeBenefit.employee?.id,
          benefit_id: employeeBenefit.benefit_id || employeeBenefit.benefit?.id,
          value: employeeBenefit.value || '',
          start_date: employeeBenefit.start_date
            ? new Date(employeeBenefit.start_date).toISOString().split('T')[0]
            : '',
          end_date: employeeBenefit.end_date
            ? new Date(employeeBenefit.end_date).toISOString().split('T')[0]
            : null,
          is_active: employeeBenefit.is_active,
        }
      : {
          employee_id: employeeId || undefined,
          benefit_id: undefined,
          value: '',
          start_date: '',
          end_date: null,
          is_active: true,
        },
  })

  const selectedBenefitId = watch('benefit_id')

  // Buscar valor padrão do benefício selecionado
  const selectedBenefit = benefitsData?.results.find(
    b => b.id === selectedBenefitId
  )

  const createMutation = useMutation({
    mutationFn: (data: EmployeeBenefitFormData) => {
      const payload: any = {
        employee: data.employee_id, // Backend espera 'employee', não 'employee_id'
        benefit: data.benefit_id, // Backend espera 'benefit', não 'benefit_id'
        start_date: data.start_date,
        is_active: data.is_active,
      }
      
      // Campos opcionais
      if (data.value && data.value.trim() !== '') {
        payload.value = data.value
      }
      if (data.end_date) {
        payload.end_date = data.end_date
      }
      
      return hrApi.createEmployeeBenefit(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-benefits'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] })
      toast({
        title: tCommon('success'),
        description:
          t('createEmployeeBenefitSuccess') ||
          'Employee benefit assigned successfully',
      })
      reset()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail ||
          error?.message ||
          tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeBenefitFormData) => {
      if (!employeeBenefit) return Promise.reject(new Error('No benefit provided'))
      const payload: any = {
        employee: data.employee_id, // Backend espera 'employee', não 'employee_id'
        benefit: data.benefit_id, // Backend espera 'benefit', não 'benefit_id'
        start_date: data.start_date,
        is_active: data.is_active,
      }
      
      // Campos opcionais
      if (data.value && data.value.trim() !== '') {
        payload.value = data.value
      }
      if (data.end_date) {
        payload.end_date = data.end_date
      }
      
      return hrApi.updateEmployeeBenefit(employeeBenefit.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-benefits'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] })
      toast({
        title: tCommon('success'),
        description:
          t('updateEmployeeBenefitSuccess') ||
          'Employee benefit updated successfully',
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail ||
          error?.message ||
          tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EmployeeBenefitFormData) => {
    if (employeeBenefit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const employees = employeesData?.results || []
  const benefits = benefitsData?.results || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {employeeBenefit
              ? t('editEmployeeBenefit') || 'Edit Employee Benefit'
              : t('newEmployeeBenefit') || 'Assign Benefit to Employee'}
          </DialogTitle>
          <DialogDescription>
            {employeeBenefit
              ? t('updateEmployeeBenefitDescription') ||
                'Update employee benefit information'
              : t('createEmployeeBenefitDescription') ||
                'Assign a benefit to an employee'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!employeeId && (
            <div className="space-y-2">
              <Label htmlFor="employee_id">
                {t('employee')} <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || 'none'}
                    onValueChange={value => {
                      field.onChange(value === 'none' ? undefined : parseInt(value))
                    }}
                  >
                    <SelectTrigger
                      className={errors.employee_id ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder={t('selectEmployee') || 'Select employee'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('none') || 'None'}</SelectItem>
                      {employees.map(emp => {
                        const userName = emp.user
                          ? `${emp.user.first_name || ''} ${emp.user.last_name || ''}`.trim() ||
                            emp.user.email
                          : emp.employee_number || 'N/A'
                        return (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {userName} {emp.job_title ? `- ${emp.job_title}` : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employee_id && (
                <p className="text-sm text-red-500">{errors.employee_id.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="benefit_id">
              {t('benefit')} <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="benefit_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || 'none'}
                  onValueChange={value => {
                    field.onChange(value === 'none' ? undefined : parseInt(value))
                  }}
                >
                  <SelectTrigger
                    className={errors.benefit_id ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('selectBenefit') || 'Select benefit'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('none') || 'None'}</SelectItem>
                    {benefits.map(benefit => (
                      <SelectItem key={benefit.id} value={benefit.id.toString()}>
                        {benefit.name}
                        {benefit.value ? ` (${formatCurrency(Number(benefit.value))})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.benefit_id && (
              <p className="text-sm text-red-500">{errors.benefit_id.message}</p>
            )}
            {selectedBenefit?.value && (
              <p className="text-xs text-muted-foreground">
                {t('defaultValue') || 'Default value'}: {formatCurrency(Number(selectedBenefit.value))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{t('value')}</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              {...register('value')}
              placeholder={selectedBenefit?.value ? formatCurrency(Number(selectedBenefit.value)) : '0.00'}
            />
            <p className="text-xs text-muted-foreground">
              {t('customValueDescription') ||
                'Leave empty to use default benefit value'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                {t('startDate')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">{t('endDate')}</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              {t('active')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employeeBenefit ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

