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
import { Textarea } from '@/components/ui/textarea'
import { PerformanceReview, Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, TrendingUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import React from 'react'

const performanceReviewSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  reviewer_id: z.number().min(1, 'Reviewer is required'),
  review_period_start: z.string().min(1, 'Review period start is required'),
  review_period_end: z.string().min(1, 'Review period end is required'),
  review_date: z.string().min(1, 'Review date is required'),
  status: z.enum(['draft', 'in_progress', 'completed', 'cancelled']),
  overall_score: z.string().optional(),
  strengths: z.string().optional(),
  areas_for_improvement: z.string().optional(),
  goals: z.string().optional(),
  development_plan: z.string().optional(),
})

type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>

interface PerformanceReviewFormProps {
  open: boolean
  onClose: () => void
  performanceReview?: PerformanceReview
  onSuccess?: () => void
}

export function PerformanceReviewForm({
  open,
  onClose,
  performanceReview,
  onSuccess,
}: PerformanceReviewFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEditing = !!performanceReview

  // Fetch employees for selects
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'all'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000, status: 'active' }),
  })

  const employees = employeesData?.results || []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: performanceReview
      ? {
          employee_id: performanceReview.employee_id || performanceReview.employee?.id,
          reviewer_id: performanceReview.reviewer_id || performanceReview.reviewer?.id,
          review_period_start: performanceReview.review_period_start
            ? format(new Date(performanceReview.review_period_start), 'yyyy-MM-dd')
            : '',
          review_period_end: performanceReview.review_period_end
            ? format(new Date(performanceReview.review_period_end), 'yyyy-MM-dd')
            : '',
          review_date: performanceReview.review_date
            ? format(new Date(performanceReview.review_date), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          status: performanceReview.status || 'draft',
          overall_score: performanceReview.overall_score || '',
          strengths: performanceReview.strengths || '',
          areas_for_improvement: performanceReview.areas_for_improvement || '',
          goals: performanceReview.goals || '',
          development_plan: performanceReview.development_plan || '',
        }
      : {
          review_date: format(new Date(), 'yyyy-MM-dd'),
          status: 'draft',
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: PerformanceReviewFormData) => hrApi.createPerformanceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'performance-reviews'] })
      toast({
        title: tCommon('success'),
        description: t('createPerformanceReviewSuccess') || 'Performance review created successfully',
      })
      reset()
      onSuccess?.()
      onClose()
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
    mutationFn: (data: PerformanceReviewFormData) =>
      hrApi.updatePerformanceReview(performanceReview!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'performance-reviews'] })
      toast({
        title: tCommon('success'),
        description: t('updatePerformanceReviewSuccess') || 'Performance review updated successfully',
      })
      onSuccess?.()
      onClose()
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

  const onSubmit = async (data: PerformanceReviewFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const getEmployeeName = (employeeId?: number) => {
    if (!employeeId) return ''
    const employee = employees.find((e: Employee) => e.id === employeeId)
    if (!employee) return ''
    return employee.user
      ? `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() ||
          employee.user.email
      : employee.employee_number || ''
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editPerformanceReview') || 'Edit Performance Review' : t('newPerformanceReview') || 'New Performance Review'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updatePerformanceReview') || 'Update performance review details'
              : t('createPerformanceReview') || 'Create a new performance review'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
          <DialogBody>
            <div className="space-y-4">
              {/* Employee */}
              <div className="space-y-2">
                <Label htmlFor="employee_id">
                  {t('employee')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="employee_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={value => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectEmployee') || 'Select employee'} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee: Employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {getEmployeeName(employee.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.employee_id && (
                  <p className="text-sm text-red-500">{errors.employee_id.message}</p>
                )}
              </div>

              {/* Reviewer */}
              <div className="space-y-2">
                <Label htmlFor="reviewer_id">
                  {t('reviewer') || 'Reviewer'} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="reviewer_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={value => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectReviewer') || 'Select reviewer'} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee: Employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {getEmployeeName(employee.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.reviewer_id && (
                  <p className="text-sm text-red-500">{errors.reviewer_id.message}</p>
                )}
              </div>

              {/* Review Period */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="review_period_start">
                    {t('reviewPeriodStart') || 'Review Period Start'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="review_period_start"
                    type="date"
                    {...register('review_period_start')}
                  />
                  {errors.review_period_start && (
                    <p className="text-sm text-red-500">{errors.review_period_start.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_period_end">
                    {t('reviewPeriodEnd') || 'Review Period End'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="review_period_end"
                    type="date"
                    {...register('review_period_end')}
                  />
                  {errors.review_period_end && (
                    <p className="text-sm text-red-500">{errors.review_period_end.message}</p>
                  )}
                </div>
              </div>

              {/* Review Date */}
              <div className="space-y-2">
                <Label htmlFor="review_date">
                  {t('reviewDate') || 'Review Date'} <span className="text-red-500">*</span>
                </Label>
                <Input id="review_date" type="date" {...register('review_date')} />
                {errors.review_date && (
                  <p className="text-sm text-red-500">{errors.review_date.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  {t('status')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus') || 'Select status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('draft') || 'Draft'}</SelectItem>
                        <SelectItem value="in_progress">{t('inProgress') || 'In Progress'}</SelectItem>
                        <SelectItem value="completed">{t('completed') || 'Completed'}</SelectItem>
                        <SelectItem value="cancelled">{t('cancelled') || 'Cancelled'}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              {/* Overall Score */}
              <div className="space-y-2">
                <Label htmlFor="overall_score">{t('overallScore') || 'Overall Score'}</Label>
                <Input
                  id="overall_score"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  {...register('overall_score')}
                  placeholder="0.0 - 10.0"
                />
                {errors.overall_score && (
                  <p className="text-sm text-red-500">{errors.overall_score.message}</p>
                )}
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <Label htmlFor="strengths">{t('strengths') || 'Strengths'}</Label>
                <Textarea
                  id="strengths"
                  {...register('strengths')}
                  placeholder={t('enterStrengths') || 'Enter strengths...'}
                  rows={3}
                />
              </div>

              {/* Areas for Improvement */}
              <div className="space-y-2">
                <Label htmlFor="areas_for_improvement">
                  {t('areasForImprovement') || 'Areas for Improvement'}
                </Label>
                <Textarea
                  id="areas_for_improvement"
                  {...register('areas_for_improvement')}
                  placeholder={t('enterAreasForImprovement') || 'Enter areas for improvement...'}
                  rows={3}
                />
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label htmlFor="goals">{t('goals') || 'Goals'}</Label>
                <Textarea
                  id="goals"
                  {...register('goals')}
                  placeholder={t('enterGoals') || 'Enter goals...'}
                  rows={3}
                />
              </div>

              {/* Development Plan */}
              <div className="space-y-2">
                <Label htmlFor="development_plan">
                  {t('developmentPlan') || 'Development Plan'}
                </Label>
                <Textarea
                  id="development_plan"
                  {...register('development_plan')}
                  placeholder={t('enterDevelopmentPlan') || 'Enter development plan...'}
                  rows={4}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

