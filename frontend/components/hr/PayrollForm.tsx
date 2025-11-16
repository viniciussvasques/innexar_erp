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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Payroll, Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, DollarSign, Download, RefreshCw } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const payrollSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  base_salary: z.string().min(1, 'Base salary is required'),
  commissions: z.string().optional(),
  overtime: z.string().optional(),
  bonuses: z.string().optional(),
  benefits_value: z.string().optional(),
  inss: z.string().optional(),
  irrf: z.string().optional(),
  fgts: z.string().optional(),
  transportation: z.string().optional(),
  meal_voucher: z.string().optional(),
  loans: z.string().optional(),
  advances: z.string().optional(),
  other_deductions: z.string().optional(),
})

type PayrollFormData = z.infer<typeof payrollSchema>

interface PayrollFormProps {
  open: boolean
  onClose: () => void
  payroll?: Payroll
  employeeId?: number
  month?: number
  year?: number
  onSuccess?: () => void
}

export function PayrollForm({
  open,
  onClose,
  payroll,
  employeeId,
  month: initialMonth,
  year: initialYear,
  onSuccess,
}: PayrollFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()

  const currentDate = new Date()
  const defaultMonth = initialMonth || currentDate.getMonth() + 1
  const defaultYear = initialYear || currentDate.getFullYear()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employee_id: employeeId || payroll?.employee_id || undefined,
      month: payroll?.month || defaultMonth,
      year: payroll?.year || defaultYear,
      base_salary: payroll?.base_salary || '',
      commissions: payroll?.commissions || '0',
      overtime: payroll?.overtime || '0',
      bonuses: payroll?.bonuses || '0',
      benefits_value: payroll?.benefits_value || '0',
      inss: payroll?.inss || '0',
      irrf: payroll?.irrf || '0',
      fgts: payroll?.fgts || '0',
      transportation: payroll?.transportation || '0',
      meal_voucher: payroll?.meal_voucher || '0',
      loans: payroll?.loans || '0',
      advances: payroll?.advances || '0',
      other_deductions: payroll?.other_deductions || '0',
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['hr', 'employees', 'all'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000 }),
    enabled: !employeeId,
  })

  const recalculateMutation = useMutation({
    mutationFn: (id: number) => hrApi.recalculatePayroll(id),
    onSuccess: () => {
      toast({
        title: tCommon('success'),
        description: t('payrollRecalculated') || 'Payroll recalculated successfully',
      })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  React.useEffect(() => {
    if (open) {
    if (payroll) {
      reset({
        employee_id: payroll.employee_id || payroll.employee?.id,
        month: payroll.month,
        year: payroll.year,
        base_salary: payroll.base_salary,
        commissions: payroll.commissions || '0',
        overtime: payroll.overtime || '0',
        bonuses: payroll.bonuses || '0',
        benefits_value: payroll.benefits_value || '0',
        inss: payroll.inss || '0',
        irrf: payroll.irrf || '0',
        fgts: payroll.fgts || '0',
        transportation: payroll.transportation || '0',
        meal_voucher: payroll.meal_voucher || '0',
        loans: payroll.loans || '0',
        advances: payroll.advances || '0',
        other_deductions: payroll.other_deductions || '0',
      })
    } else {
      reset({
        employee_id: employeeId || undefined,
        month: defaultMonth,
        year: defaultYear,
        base_salary: '',
        commissions: '0',
        overtime: '0',
        bonuses: '0',
        benefits_value: '0',
        inss: '0',
        irrf: '0',
        fgts: '0',
        transportation: '0',
        meal_voucher: '0',
        loans: '0',
        advances: '0',
        other_deductions: '0',
      })
    }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payroll, employeeId, defaultMonth, defaultYear])

  const watchedValues = watch()
  const totalEarnings =
    (Number(watchedValues.base_salary) || 0) +
    (Number(watchedValues.commissions) || 0) +
    (Number(watchedValues.overtime) || 0) +
    (Number(watchedValues.bonuses) || 0) +
    (Number(watchedValues.benefits_value) || 0)
  const totalDeductions =
    (Number(watchedValues.inss) || 0) +
    (Number(watchedValues.irrf) || 0) +
    (Number(watchedValues.fgts) || 0) +
    (Number(watchedValues.transportation) || 0) +
    (Number(watchedValues.meal_voucher) || 0) +
    (Number(watchedValues.loans) || 0) +
    (Number(watchedValues.advances) || 0) +
    (Number(watchedValues.other_deductions) || 0)
  const netSalary = totalEarnings - totalDeductions

  const onSubmit = async (data: PayrollFormData) => {
    try {
      // Se tiver employee_id específico, processar apenas esse funcionário
      // Caso contrário, buscar todos os funcionários ativos
      let employeeIds: number[] = []
      
      if (data.employee_id) {
        employeeIds = [data.employee_id]
      } else {
        // Buscar todos os funcionários ativos
        const employees = await hrApi.getEmployees({ page_size: 1000, status: 'active' })
        employeeIds = employees.results.map(emp => emp.id)
      }

      if (employeeIds.length === 0) {
        throw new Error('No employees found to process payroll')
      }

      // Payroll is read-only, so we process it instead
      const result = await hrApi.processPayroll({
        employee_ids: employeeIds,
        month: data.month,
        year: data.year,
      })
      
      const processedCount = result.processed?.length || 0
      const errorCount = result.errors?.length || 0
      
      let description = t('payrollProcessed') || `Payroll processed for ${processedCount} employee(s)`
      if (errorCount > 0) {
        description += `. ${errorCount} error(s) occurred.`
      }
      
      toast({
        title: tCommon('success'),
        description,
      })
      reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      // Tratar erros de validação do Django REST Framework
      let errorMessage = tCommon('errorOccurred')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Se for um objeto de validação (DRF)
        if (typeof errorData === 'object' && !errorData.detail && !errorData.error) {
          // Coletar todas as mensagens de erro
          const errorMessages: string[] = []
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`)
            } else if (typeof messages === 'object') {
              errorMessages.push(`${field}: ${JSON.stringify(messages)}`)
            }
          }
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join('; ') 
            : JSON.stringify(errorData)
        } else {
          errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleRecalculate = () => {
    if (payroll) {
      recalculateMutation.mutate(payroll.id)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {payroll
              ? `${t('payroll')} - ${payroll.payroll_number}`
              : t('newPayroll') || 'New Payroll'}
          </DialogTitle>
          <DialogDescription>
            {payroll
              ? t('viewPayrollDescription') || 'View and manage payroll information'
              : t('createPayrollDescription') || 'Create a new payroll'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-4">
            {/* Summary Cards */}
            {payroll && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('totalEarnings')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(Number(payroll.total_earnings))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('totalDeductions')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(Number(payroll.total_deductions))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('netSalary')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(Number(payroll.net_salary))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t('basicInfo') || 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="earnings">{t('earnings') || 'Earnings'}</TabsTrigger>
              <TabsTrigger value="deductions">{t('deductions') || 'Deductions'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                          disabled={!!payroll}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectEmployee') || 'Select employee'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('selectEmployee') || 'Select employee'}</SelectItem>
                            {employees?.results.map(emp => {
                              const userName = emp.user
                                ? `${emp.user.first_name || ''} ${emp.user.last_name || ''}`.trim() ||
                                  emp.user.email
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

                <div className="space-y-2">
                  <Label htmlFor="month">
                    {t('month')} <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={value => field.onChange(Number(value))}
                        disabled={!!payroll}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <SelectItem key={m} value={m.toString()}>
                              {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.month && <p className="text-sm text-red-500">{errors.month.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">
                    {t('year')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    {...register('year', { valueAsNumber: true })}
                    disabled={!!payroll}
                    className={errors.year ? 'border-red-500' : ''}
                  />
                  {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base_salary">
                    {t('baseSalary')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="base_salary"
                    type="number"
                    step="0.01"
                    {...register('base_salary')}
                    className={errors.base_salary ? 'border-red-500' : ''}
                    disabled={!!payroll}
                  />
                  {errors.base_salary && (
                    <p className="text-sm text-red-500">{errors.base_salary.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissions">{t('commissions')}</Label>
                  <Input
                    id="commissions"
                    type="number"
                    step="0.01"
                    {...register('commissions')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime">{t('overtime')}</Label>
                  <Input
                    id="overtime"
                    type="number"
                    step="0.01"
                    {...register('overtime')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonuses">{t('bonuses')}</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    step="0.01"
                    {...register('bonuses')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits_value">{t('benefitsValue')}</Label>
                  <Input
                    id="benefits_value"
                    type="number"
                    step="0.01"
                    {...register('benefits_value')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2 pt-6">
                  <Label className="text-lg font-semibold">{t('totalEarnings')}</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalEarnings)}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deductions" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inss">INSS</Label>
                  <Input
                    id="inss"
                    type="number"
                    step="0.01"
                    {...register('inss')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irrf">IRRF</Label>
                  <Input
                    id="irrf"
                    type="number"
                    step="0.01"
                    {...register('irrf')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fgts">FGTS</Label>
                  <Input
                    id="fgts"
                    type="number"
                    step="0.01"
                    {...register('fgts')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportation">{t('transportation')}</Label>
                  <Input
                    id="transportation"
                    type="number"
                    step="0.01"
                    {...register('transportation')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal_voucher">{t('mealVoucher')}</Label>
                  <Input
                    id="meal_voucher"
                    type="number"
                    step="0.01"
                    {...register('meal_voucher')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loans">{t('loans') || 'Loans'}</Label>
                  <Input
                    id="loans"
                    type="number"
                    step="0.01"
                    {...register('loans')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advances">{t('advances') || 'Advances'}</Label>
                  <Input
                    id="advances"
                    type="number"
                    step="0.01"
                    {...register('advances')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_deductions">{t('otherDeductions') || 'Other Deductions'}</Label>
                  <Input
                    id="other_deductions"
                    type="number"
                    step="0.01"
                    {...register('other_deductions')}
                    disabled={!!payroll}
                  />
                </div>

                <div className="space-y-2 pt-6">
                  <Label className="text-lg font-semibold">{t('totalDeductions')}</Label>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalDeductions)}
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <Label className="text-lg font-semibold">{t('netSalary')}</Label>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(netSalary)}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-between">
            <div>
              {payroll && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={recalculateMutation.isPending}
                >
                  {recalculateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('recalculate') || 'Recalculate'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {payroll ? tCommon('close') : tCommon('cancel')}
              </Button>
              {!payroll && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('process') || 'Process'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

