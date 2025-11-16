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
import { Switch } from '@/components/ui/switch'
import { Training } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, GraduationCap } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import React from 'react'

const trainingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  training_type: z.enum(['internal', 'external', 'online', 'workshop', 'seminar']).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  duration_hours: z.number().optional(),
  instructor: z.string().optional(),
  location: z.string().optional(),
  max_capacity: z.number().optional(),
  is_active: z.boolean().optional(),
})

type TrainingFormData = z.infer<typeof trainingSchema>

interface TrainingFormProps {
  open: boolean
  onClose: () => void
  training?: Training
  onSuccess?: () => void
}

export function TrainingForm({ open, onClose, training, onSuccess }: TrainingFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEditing = !!training

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: training
      ? {
          name: training.name || '',
          description: training.description || '',
          training_type: training.training_type || 'internal',
          start_date: training.start_date
            ? format(new Date(training.start_date), 'yyyy-MM-dd')
            : '',
          end_date: training.end_date
            ? format(new Date(training.end_date), 'yyyy-MM-dd')
            : '',
          duration_hours: training.duration_hours || undefined,
          instructor: training.instructor || '',
          location: training.location || '',
          max_capacity: training.max_capacity || undefined,
          is_active: training.is_active ?? true,
        }
      : {
          training_type: 'internal',
          is_active: true,
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: TrainingFormData) => hrApi.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainings'] })
      toast({
        title: tCommon('success'),
        description: t('createTrainingSuccess') || 'Training created successfully',
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
    mutationFn: (data: TrainingFormData) => hrApi.updateTraining(training!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainings'] })
      toast({
        title: tCommon('success'),
        description: t('updateTrainingSuccess') || 'Training updated successfully',
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

  const onSubmit = async (data: TrainingFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editTraining') || 'Edit Training' : t('newTraining') || 'New Training'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateTraining') || 'Update training details'
              : t('createTraining') || 'Create a new training'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('name')} <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register('name')} placeholder={t('trainingName') || 'Training name'} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('trainingDescription') || 'Training description...'}
                  rows={3}
                />
              </div>

              {/* Training Type */}
              <div className="space-y-2">
                <Label htmlFor="training_type">{t('type') || 'Type'}</Label>
                <Controller
                  name="training_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectType') || 'Select type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">{t('internal') || 'Internal'}</SelectItem>
                        <SelectItem value="external">{t('external') || 'External'}</SelectItem>
                        <SelectItem value="online">{t('online') || 'Online'}</SelectItem>
                        <SelectItem value="workshop">{t('workshop') || 'Workshop'}</SelectItem>
                        <SelectItem value="seminar">{t('seminar') || 'Seminar'}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {t('startDate') || 'Start Date'} <span className="text-red-500">*</span>
                  </Label>
                  <Input id="start_date" type="date" {...register('start_date')} />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">
                    {t('endDate') || 'End Date'} <span className="text-red-500">*</span>
                  </Label>
                  <Input id="end_date" type="date" {...register('end_date')} />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Duration and Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">{t('duration') || 'Duration (hours)'}</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...register('duration_hours', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_capacity">{t('maxCapacity') || 'Max Capacity'}</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    min="1"
                    {...register('max_capacity', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Instructor */}
              <div className="space-y-2">
                <Label htmlFor="instructor">{t('instructor') || 'Instructor'}</Label>
                <Input
                  id="instructor"
                  {...register('instructor')}
                  placeholder={t('instructorName') || 'Instructor name'}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">{t('location') || 'Location'}</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder={t('trainingLocation') || 'Training location'}
                />
              </div>

              {/* Active */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      id="is_active"
                    />
                  )}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {t('active')}
                </Label>
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

