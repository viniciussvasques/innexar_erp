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
import { Education } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const educationSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  level: z.enum(
    [
      'elementary',
      'middle',
      'high_school',
      'technical',
      'bachelor',
      'specialization',
      'masters',
      'phd',
      'post_phd',
    ],
    {
      required_error: 'Education level is required',
    }
  ),
  institution: z.string().min(1, 'Institution is required'),
  course: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  is_completed: z.boolean().default(false),
  graduation_year: z.number().optional().nullable(),
})

type EducationFormData = z.infer<typeof educationSchema>

interface EducationFormProps {
  open: boolean
  onClose: () => void
  education?: Education | null
  employeeId?: number
  onSuccess?: () => void
}

export function EducationForm({
  open,
  onClose,
  education,
  employeeId,
  onSuccess,
}: EducationFormProps) {
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
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: education
      ? {
          employee_id: education.employee_id || education.employee?.id,
          level: education.level || 'high_school',
          institution: education.institution || '',
          course: education.course || '',
          start_date: education.start_date
            ? new Date(education.start_date).toISOString().split('T')[0]
            : '',
          end_date: education.end_date
            ? new Date(education.end_date).toISOString().split('T')[0]
            : null,
          is_completed: education.is_completed || false,
          graduation_year: education.graduation_year || null,
        }
      : {
          employee_id: employeeId || undefined,
          level: 'high_school',
          institution: '',
          course: '',
          start_date: '',
          end_date: null,
          is_completed: false,
          graduation_year: null,
        },
  })

  const isCompleted = watch('is_completed')

  const createMutation = useMutation({
    mutationFn: (data: EducationFormData) => hrApi.createEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'educations'] })
      toast({
        title: tCommon('success'),
        description: t('createEducationSuccess') || 'Education created successfully',
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
    mutationFn: ({ id, data }: { id: number; data: EducationFormData }) =>
      hrApi.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'educations'] })
      toast({
        title: tCommon('success'),
        description: t('updateEducationSuccess') || 'Education updated successfully',
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

  const onSubmit = (data: EducationFormData) => {
    if (education) {
      updateMutation.mutate({ id: education.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isEditing = !!education

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editEducation') : t('newEducation')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateEducation') : t('createEducation')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level">
                  {t('educationLevel')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="level">
                        <SelectValue placeholder={t('selectEducationLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">{t('elementary')}</SelectItem>
                        <SelectItem value="middle">{t('middle')}</SelectItem>
                        <SelectItem value="high_school">{t('highSchool')}</SelectItem>
                        <SelectItem value="technical">{t('technical')}</SelectItem>
                        <SelectItem value="bachelor">{t('bachelor')}</SelectItem>
                        <SelectItem value="specialization">{t('specialization')}</SelectItem>
                        <SelectItem value="masters">{t('masters')}</SelectItem>
                        <SelectItem value="phd">{t('phd')}</SelectItem>
                        <SelectItem value="post_phd">{t('postPhd')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.level && <p className="text-sm text-red-500">{errors.level.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">
                  {t('institution')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="institution"
                  {...register('institution')}
                  placeholder={t('institutionPlaceholder')}
                  className={errors.institution ? 'border-red-500' : ''}
                />
                {errors.institution && (
                  <p className="text-sm text-red-500">{errors.institution.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">{t('course')}</Label>
                <Input
                  id="course"
                  {...register('course')}
                  placeholder={t('coursePlaceholder')}
                  className={errors.course ? 'border-red-500' : ''}
                />
                {errors.course && (
                  <p className="text-sm text-red-500">{errors.course.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('startDate')}</Label>
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
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Controller
                  name="is_completed"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_completed"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="is_completed" className="cursor-pointer">
                        {t('isCompleted')}
                      </Label>
                    </div>
                  )}
                />
              </div>

              {isCompleted && (
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">{t('graduationYear')}</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    {...register('graduation_year', {
                      valueAsNumber: true,
                    })}
                    placeholder={t('graduationYearPlaceholder')}
                    className={errors.graduation_year ? 'border-red-500' : ''}
                  />
                  {errors.graduation_year && (
                    <p className="text-sm text-red-500">{errors.graduation_year.message}</p>
                  )}
                </div>
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

