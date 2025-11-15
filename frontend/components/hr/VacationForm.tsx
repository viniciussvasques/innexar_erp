'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Vacation, Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format, addDays, differenceInDays } from 'date-fns'
import React, { useEffect, useState } from 'react'

const vacationSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  acquisition_period_start: z.string().min(1, 'Acquisition period start is required'),
  acquisition_period_end: z.string().min(1, 'Acquisition period end is required'),
  sell_days: z.number().optional(),
  cash_allowance: z.boolean().optional(),
})

type VacationFormData = z.infer<typeof vacationSchema>

interface VacationFormProps {
  open: boolean
  onClose: () => void
  vacation?: Vacation
  employeeId?: number
  onSuccess?: () => void
}

export function VacationForm({ open, onClose, vacation, employeeId, onSuccess }: VacationFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const [vacationBalance, setVacationBalance] = useState<any>(null)
  const [calculatedDays, setCalculatedDays] = useState<number>(0)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<VacationFormData>({
    resolver: zodResolver(vacationSchema),
    defaultValues: {
      employee_id: employeeId || vacation?.employee_id || undefined,
      start_date: vacation?.start_date
        ? format(new Date(vacation.start_date), 'yyyy-MM-dd')
        : format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: vacation?.end_date
        ? format(new Date(vacation.end_date), 'yyyy-MM-dd')
        : format(addDays(new Date(), 44), 'yyyy-MM-dd'),
      acquisition_period_start: vacation?.acquisition_period_start
        ? format(new Date(vacation.acquisition_period_start), 'yyyy-MM-dd')
        : format(addDays(new Date(), -365), 'yyyy-MM-dd'),
      acquisition_period_end: vacation?.acquisition_period_end
        ? format(new Date(vacation.acquisition_period_end), 'yyyy-MM-dd')
        : format(addDays(new Date(), -1), 'yyyy-MM-dd'),
      sell_days: vacation?.sell_days || 0,
      cash_allowance: vacation?.cash_allowance || false,
    },
  })

  const selectedEmployeeId = watch('employee_id')
  const startDate = watch('start_date')
  const endDate = watch('end_date')

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['hr', 'employees', 'all'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000 }),
    enabled: !employeeId,
  })

  // Fetch vacation balance
  const { data: balanceData } = useQuery({
    queryKey: ['hr', 'vacation-balance', selectedEmployeeId],
    queryFn: () => hrApi.getVacationBalance(selectedEmployeeId!),
    enabled: !!selectedEmployeeId && !vacation,
  })

  useEffect(() => {
    if (balanceData) {
      setVacationBalance(balanceData)
    }
  }, [balanceData])

  // Calculate days
  useEffect(() => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const days = differenceInDays(end, start) + 1
        setCalculatedDays(days > 0 ? days : 0)
      } catch {
        setCalculatedDays(0)
      }
    }
  }, [startDate, endDate])

  React.useEffect(() => {
    if (vacation) {
      reset({
        employee_id: vacation.employee_id || vacation.employee?.id,
        start_date: vacation.start_date
          ? format(new Date(vacation.start_date), 'yyyy-MM-dd')
          : format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        end_date: vacation.end_date
          ? format(new Date(vacation.end_date), 'yyyy-MM-dd')
          : format(addDays(new Date(), 44), 'yyyy-MM-dd'),
        acquisition_period_start: vacation.acquisition_period_start
          ? format(new Date(vacation.acquisition_period_start), 'yyyy-MM-dd')
          : format(addDays(new Date(), -365), 'yyyy-MM-dd'),
        acquisition_period_end: vacation.acquisition_period_end
          ? format(new Date(vacation.acquisition_period_end), 'yyyy-MM-dd')
          : format(addDays(new Date(), -1), 'yyyy-MM-dd'),
        sell_days: vacation.sell_days || 0,
        cash_allowance: vacation.cash_allowance || false,
      })
    } else {
      reset({
        employee_id: employeeId || undefined,
        start_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 44), 'yyyy-MM-dd'),
        acquisition_period_start: format(addDays(new Date(), -365), 'yyyy-MM-dd'),
        acquisition_period_end: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
        sell_days: 0,
        cash_allowance: false,
      })
    }
  }, [vacation, employeeId, reset])

  const onSubmit = async (data: VacationFormData) => {
    try {
      const payload: any = {
        employee: data.employee_id,
        status: 'requested',
        start_date: data.start_date,
        end_date: data.end_date,
        acquisition_period_start: data.acquisition_period_start,
        acquisition_period_end: data.acquisition_period_end,
      }

      if (data.sell_days) payload.sell_days = data.sell_days
      if (data.cash_allowance) payload.cash_allowance = data.cash_allowance

      if (vacation) {
        await hrApi.updateVacation(vacation.id, payload)
        toast({
          title: tCommon('success'),
          description: t('vacationUpdated') || 'Vacation updated successfully',
        })
      } else {
        await hrApi.createVacation(payload)
        toast({
          title: tCommon('success'),
          description: t('vacationCreated') || 'Vacation request created successfully',
        })
      }

      reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || tCommon('error'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {vacation ? t('updateVacation') || 'Update Vacation' : t('requestVacation') || 'Request Vacation'}
          </DialogTitle>
          <DialogDescription>
            {vacation
              ? t('updateVacationDescription') || 'Update vacation request information'
              : t('requestVacationDescription') || 'Create a new vacation request'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-4">
            {/* Vacation Balance Card */}
            {vacationBalance && !vacation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {t('vacationBalance') || 'Vacation Balance'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('availableDays') || 'Available Days'}: </span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      {vacationBalance.balance_days || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('nextExpiry') || 'Next Expiry'}: </span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      {vacationBalance.next_expiry_date
                        ? format(new Date(vacationBalance.next_expiry_date), 'dd/MM/yyyy')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
            {/* Employee */}
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
                      onValueChange={value => field.onChange(value === 'none' ? null : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectEmployee') || 'Select employee'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('selectEmployee') || 'Select employee'}</SelectItem>
                        {employees?.results.map(emp => {
                          const userName = emp.user
                            ? `${emp.user.first_name || ''} ${emp.user.last_name || ''}`.trim() || emp.user.email
                            : emp.employee_number
                          return (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {userName} ({emp.employee_number})
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

            {/* Start Date */}
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

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">
                {t('endDate')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
              )}
              {calculatedDays > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('calculatedDays') || 'Calculated'}: {calculatedDays} {t('days') || 'days'}
                </p>
              )}
            </div>

            {/* Acquisition Period Start */}
            <div className="space-y-2">
              <Label htmlFor="acquisition_period_start">
                {t('acquisitionPeriodStart') || 'Acquisition Period Start'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="acquisition_period_start"
                type="date"
                {...register('acquisition_period_start')}
                className={errors.acquisition_period_start ? 'border-red-500' : ''}
              />
              {errors.acquisition_period_start && (
                <p className="text-sm text-red-500">{errors.acquisition_period_start.message}</p>
              )}
            </div>

            {/* Acquisition Period End */}
            <div className="space-y-2">
              <Label htmlFor="acquisition_period_end">
                {t('acquisitionPeriodEnd') || 'Acquisition Period End'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="acquisition_period_end"
                type="date"
                {...register('acquisition_period_end')}
                className={errors.acquisition_period_end ? 'border-red-500' : ''}
              />
              {errors.acquisition_period_end && (
                <p className="text-sm text-red-500">{errors.acquisition_period_end.message}</p>
              )}
            </div>

            {/* Sell Days */}
            <div className="space-y-2">
              <Label htmlFor="sell_days">{t('sellDays') || 'Sell Days'} ({t('optional')})</Label>
              <Input
                id="sell_days"
                type="number"
                min="0"
                {...register('sell_days', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            {/* Cash Allowance */}
            <div className="space-y-2 flex items-center gap-2 pt-6">
              <Controller
                name="cash_allowance"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="cash_allowance"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="cash_allowance" className="cursor-pointer">
                {t('cashAllowance') || 'Cash Allowance'}
              </Label>
            </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vacation ? tCommon('update') : t('request') || 'Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

