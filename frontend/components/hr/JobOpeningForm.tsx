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
import { JobOpening, Department } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Briefcase } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import React from 'react'

const jobOpeningSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department_id: z.number().optional().nullable(),
  warehouse_id: z.number().optional().nullable(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  status: z.enum(['open', 'closed', 'cancelled']),
  posted_date: z.string().optional(),
  closing_date: z.string().optional(),
})

type JobOpeningFormData = z.infer<typeof jobOpeningSchema>

interface JobOpeningFormProps {
  open: boolean
  onClose: () => void
  jobOpening?: JobOpening
  onSuccess?: () => void
}

export function JobOpeningForm({
  open,
  onClose,
  jobOpening,
  onSuccess,
}: JobOpeningFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEditing = !!jobOpening

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: () => hrApi.getDepartments({ active_only: true }),
  })

  const departments = departmentsData?.results || []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: jobOpening
      ? {
          title: jobOpening.title || '',
          department_id: jobOpening.department_id || null,
          warehouse_id: jobOpening.warehouse_id || null,
          description: jobOpening.description || '',
          requirements: jobOpening.requirements || '',
          responsibilities: jobOpening.responsibilities || '',
          salary_min: jobOpening.salary_min || '',
          salary_max: jobOpening.salary_max || '',
          status: jobOpening.status || 'open',
          posted_date: jobOpening.posted_date
            ? format(new Date(jobOpening.posted_date), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          closing_date: jobOpening.closing_date
            ? format(new Date(jobOpening.closing_date), 'yyyy-MM-dd')
            : '',
        }
      : {
          status: 'open',
          posted_date: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: JobOpeningFormData) => hrApi.createJobOpening(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'job-openings'] })
      toast({
        title: tCommon('success'),
        description: t('createJobOpeningSuccess') || 'Job opening created successfully',
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
    mutationFn: (data: JobOpeningFormData) => hrApi.updateJobOpening(jobOpening!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'job-openings'] })
      toast({
        title: tCommon('success'),
        description: t('updateJobOpeningSuccess') || 'Job opening updated successfully',
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

  const onSubmit = async (data: JobOpeningFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editJobOpening') || 'Edit Job Opening' : t('newJobOpening') || 'New Job Opening'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateJobOpening') || 'Update job opening details'
              : t('createJobOpening') || 'Create a new job opening'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('title') || 'Title'} <span className="text-red-500">*</span>
                </Label>
                <Input id="title" {...register('title')} placeholder={t('jobTitle') || 'Job title'} />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department_id">{t('department')}</Label>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || 'none'}
                      onValueChange={value =>
                        field.onChange(value === 'none' ? null : parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectDepartment') || 'Select department'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('none') || 'None'}</SelectItem>
                        {departments.map((dept: Department) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                        <SelectItem value="open">{t('open') || 'Open'}</SelectItem>
                        <SelectItem value="closed">{t('closed') || 'Closed'}</SelectItem>
                        <SelectItem value="cancelled">{t('cancelled') || 'Cancelled'}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posted_date">{t('postedDate') || 'Posted Date'}</Label>
                  <Input id="posted_date" type="date" {...register('posted_date')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closing_date">{t('closingDate') || 'Closing Date'}</Label>
                  <Input id="closing_date" type="date" {...register('closing_date')} />
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">{t('salaryMin') || 'Min Salary'}</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('salary_min')}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_max">{t('salaryMax') || 'Max Salary'}</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('salary_max')}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('jobDescription') || 'Job description...'}
                  rows={4}
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">{t('requirements') || 'Requirements'}</Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  placeholder={t('jobRequirements') || 'Job requirements...'}
                  rows={4}
                />
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <Label htmlFor="responsibilities">{t('responsibilities') || 'Responsibilities'}</Label>
                <Textarea
                  id="responsibilities"
                  {...register('responsibilities')}
                  placeholder={t('jobResponsibilities') || 'Job responsibilities...'}
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

