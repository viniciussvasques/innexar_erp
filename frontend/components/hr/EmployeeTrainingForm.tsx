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
import { EmployeeTraining, Employee, Training } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const employeeTrainingSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  training_id: z.number().min(1, 'Training is required'),
  enrolled_at: z.string().min(1, 'Enrollment date is required'),
  completed_at: z.string().optional().nullable(),
  status: z.enum(['enrolled', 'completed', 'failed', 'cancelled'], {
    required_error: 'Status is required',
  }),
  score: z.string().optional().nullable(),
  certificate_number: z.string().optional(),
  // certificate_file: z.string().optional(), // Removido - não há input no formulário
  certificate_expiry: z.string().optional().nullable(),
})

type EmployeeTrainingFormData = z.infer<typeof employeeTrainingSchema>

interface EmployeeTrainingFormProps {
  open: boolean
  onClose: () => void
  employeeTraining?: EmployeeTraining | null
  employeeId?: number
  onSuccess?: () => void
}

export function EmployeeTrainingForm({
  open,
  onClose,
  employeeTraining,
  employeeId,
  onSuccess,
}: EmployeeTrainingFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Buscar funcionários
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'list'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000, status: 'active' }),
    enabled: !employeeId,
  })

  // Buscar treinamentos
  const { data: trainingsData } = useQuery({
    queryKey: ['hr', 'trainings', 'list'],
    queryFn: () => hrApi.getTrainings({ page_size: 1000, is_active: true }),
  })

  const employees = employeesData?.results || []
  const trainings = trainingsData?.results || []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EmployeeTrainingFormData>({
    resolver: zodResolver(employeeTrainingSchema),
    defaultValues: employeeTraining
      ? {
          employee_id: employeeTraining.employee_id || employeeTraining.employee?.id,
          training_id: employeeTraining.training_id || employeeTraining.training?.id,
          enrolled_at: employeeTraining.enrolled_at
            ? new Date(employeeTraining.enrolled_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          completed_at: employeeTraining.completed_at
            ? new Date(employeeTraining.completed_at).toISOString().split('T')[0]
            : null,
          status: employeeTraining.status || 'enrolled',
          score: employeeTraining.score || '',
          certificate_number: employeeTraining.certificate_number || '',
          // certificate_file: employeeTraining.certificate_file || '', // Removido - não há input
          certificate_expiry: employeeTraining.certificate_expiry
            ? new Date(employeeTraining.certificate_expiry).toISOString().split('T')[0]
            : null,
        }
      : {
          employee_id: employeeId || undefined,
          training_id: undefined,
          enrolled_at: new Date().toISOString().split('T')[0],
          completed_at: null,
          status: 'enrolled',
          score: '',
          certificate_number: '',
          // certificate_file: '', // Removido - não há input
          certificate_expiry: null,
        },
  })

  const status = watch('status')
  const isCompleted = status === 'completed'

  const createMutation = useMutation({
    mutationFn: (data: EmployeeTrainingFormData) => hrApi.createEmployeeTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-trainings'] })
      toast({
        title: tCommon('success'),
        description:
          t('createEmployeeTrainingSuccess') || 'Employee training created successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeTrainingFormData }) =>
      hrApi.updateEmployeeTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee-trainings'] })
      toast({
        title: tCommon('success'),
        description:
          t('updateEmployeeTrainingSuccess') || 'Employee training updated successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EmployeeTrainingFormData) => {
    if (employeeTraining) {
      updateMutation.mutate({ id: employeeTraining.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isEditing = !!employeeTraining

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editEmployeeTraining') : t('newEmployeeTraining')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateEmployeeTraining') : t('createEmployeeTraining')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
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
                          id="employee_id"
                          className={errors.employee_id ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder={t('selectEmployee')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('none')}</SelectItem>
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
                <Label htmlFor="training_id">
                  {t('training')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="training_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || 'none'}
                      onValueChange={value => {
                        field.onChange(value === 'none' ? undefined : parseInt(value))
                      }}
                    >
                      <SelectTrigger
                        id="training_id"
                        className={errors.training_id ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder={t('selectTraining')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('none')}</SelectItem>
                        {trainings.map(training => (
                          <SelectItem key={training.id} value={training.id.toString()}>
                            {training.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.training_id && (
                  <p className="text-sm text-red-500">{errors.training_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrolled_at">
                    {t('enrollmentDate')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="enrolled_at"
                    type="date"
                    {...register('enrolled_at')}
                    className={errors.enrolled_at ? 'border-red-500' : ''}
                  />
                  {errors.enrolled_at && (
                    <p className="text-sm text-red-500">{errors.enrolled_at.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completed_at">{t('completionDate')}</Label>
                  <Input
                    id="completed_at"
                    type="date"
                    {...register('completed_at')}
                    className={errors.completed_at ? 'border-red-500' : ''}
                  />
                  {errors.completed_at && (
                    <p className="text-sm text-red-500">{errors.completed_at.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  {t('status')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enrolled">{t('enrolled')}</SelectItem>
                        <SelectItem value="completed">{t('completed')}</SelectItem>
                        <SelectItem value="failed">{t('failed')}</SelectItem>
                        <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              {isCompleted && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="score">{t('score')}</Label>
                    <Input
                      id="score"
                      {...register('score')}
                      placeholder={t('scorePlaceholder')}
                      className={errors.score ? 'border-red-500' : ''}
                    />
                    {errors.score && (
                      <p className="text-sm text-red-500">{errors.score.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate_number">{t('certificateNumber')}</Label>
                    <Input
                      id="certificate_number"
                      {...register('certificate_number')}
                      placeholder={t('certificateNumberPlaceholder')}
                      className={errors.certificate_number ? 'border-red-500' : ''}
                    />
                    {errors.certificate_number && (
                      <p className="text-sm text-red-500">{errors.certificate_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate_expiry">{t('certificateExpiry')}</Label>
                    <Input
                      id="certificate_expiry"
                      type="date"
                      {...register('certificate_expiry')}
                      className={errors.certificate_expiry ? 'border-red-500' : ''}
                    />
                    {errors.certificate_expiry && (
                      <p className="text-sm text-red-500">{errors.certificate_expiry.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

