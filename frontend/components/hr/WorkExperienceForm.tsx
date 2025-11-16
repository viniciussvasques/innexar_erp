'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { WorkExperience } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const workExperienceSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
  reference_name: z.string().optional(),
  reference_phone: z.string().optional(),
  reference_email: z.string().email().optional().or(z.literal('')),
})

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>

interface WorkExperienceFormProps {
  open: boolean
  onClose: () => void
  workExperience?: WorkExperience | null
  employeeId?: number
  onSuccess?: () => void
}

export function WorkExperienceForm({
  open,
  onClose,
  workExperience,
  employeeId,
  onSuccess,
}: WorkExperienceFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: workExperience
      ? {
          employee_id: workExperience.employee_id || workExperience.employee?.id,
          company_name: workExperience.company_name || '',
          job_title: workExperience.job_title || '',
          start_date: workExperience.start_date
            ? new Date(workExperience.start_date).toISOString().split('T')[0]
            : '',
          end_date: workExperience.end_date
            ? new Date(workExperience.end_date).toISOString().split('T')[0]
            : null,
          is_current: workExperience.is_current || false,
          description: workExperience.description || '',
          responsibilities: workExperience.responsibilities || '',
          achievements: workExperience.achievements || '',
          reference_name: workExperience.reference_name || '',
          reference_phone: workExperience.reference_phone || '',
          reference_email: workExperience.reference_email || '',
        }
      : {
          employee_id: employeeId || undefined,
          company_name: '',
          job_title: '',
          start_date: '',
          end_date: null,
          is_current: false,
          description: '',
          responsibilities: '',
          achievements: '',
          reference_name: '',
          reference_phone: '',
          reference_email: '',
        },
  })

  const isCurrent = watch('is_current')

  const createMutation = useMutation({
    mutationFn: (data: WorkExperienceFormData) => hrApi.createWorkExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'work-experiences'] })
      toast({
        title: tCommon('success'),
        description: t('createWorkExperienceSuccess') || 'Work experience created successfully',
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
    mutationFn: ({ id, data }: { id: number; data: WorkExperienceFormData }) =>
      hrApi.updateWorkExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'work-experiences'] })
      toast({
        title: tCommon('success'),
        description: t('updateWorkExperienceSuccess') || 'Work experience updated successfully',
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

  const onSubmit = (data: WorkExperienceFormData) => {
    if (workExperience) {
      updateMutation.mutate({ id: workExperience.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isEditing = !!workExperience

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editWorkExperience') : t('newWorkExperience')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateWorkExperience') : t('createWorkExperience')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">
                    {t('companyName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    {...register('company_name')}
                    placeholder={t('companyNamePlaceholder')}
                    className={errors.company_name ? 'border-red-500' : ''}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-500">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">
                    {t('jobTitle')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="job_title"
                    {...register('job_title')}
                    placeholder={t('jobTitlePlaceholder')}
                    className={errors.job_title ? 'border-red-500' : ''}
                  />
                  {errors.job_title && (
                    <p className="text-sm text-red-500">{errors.job_title.message}</p>
                  )}
                </div>
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
                    disabled={isCurrent}
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Controller
                  name="is_current"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_current"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="is_current" className="cursor-pointer">
                        {t('isCurrent')}
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">{t('responsibilities')}</Label>
                <Textarea
                  id="responsibilities"
                  {...register('responsibilities')}
                  placeholder={t('responsibilitiesPlaceholder')}
                  rows={3}
                  className={errors.responsibilities ? 'border-red-500' : ''}
                />
                {errors.responsibilities && (
                  <p className="text-sm text-red-500">{errors.responsibilities.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">{t('achievements')}</Label>
                <Textarea
                  id="achievements"
                  {...register('achievements')}
                  placeholder={t('achievementsPlaceholder')}
                  rows={3}
                  className={errors.achievements ? 'border-red-500' : ''}
                />
                {errors.achievements && (
                  <p className="text-sm text-red-500">{errors.achievements.message}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t('reference')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference_name">{t('referenceName')}</Label>
                    <Input
                      id="reference_name"
                      {...register('reference_name')}
                      placeholder={t('referenceNamePlaceholder')}
                      className={errors.reference_name ? 'border-red-500' : ''}
                    />
                    {errors.reference_name && (
                      <p className="text-sm text-red-500">{errors.reference_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_phone">{t('referencePhone')}</Label>
                    <Input
                      id="reference_phone"
                      {...register('reference_phone')}
                      placeholder={t('referencePhonePlaceholder')}
                      className={errors.reference_phone ? 'border-red-500' : ''}
                    />
                    {errors.reference_phone && (
                      <p className="text-sm text-red-500">{errors.reference_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_email">{t('referenceEmail')}</Label>
                    <Input
                      id="reference_email"
                      type="email"
                      {...register('reference_email')}
                      placeholder={t('referenceEmailPlaceholder')}
                      className={errors.reference_email ? 'border-red-500' : ''}
                    />
                    {errors.reference_email && (
                      <p className="text-sm text-red-500">{errors.reference_email.message}</p>
                    )}
                  </div>
                </div>
              </div>
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

