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
import { TimeRecord, Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import React from 'react'

const timeRecordSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  record_type: z.enum(['check_in', 'check_out', 'lunch_in', 'lunch_out', 'overtime_in', 'overtime_out']),
  record_date: z.string().min(1, 'Date is required'),
  record_time: z.string().min(1, 'Time is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  justification: z.string().optional(),
})

type TimeRecordFormData = z.infer<typeof timeRecordSchema>

interface TimeRecordFormProps {
  open: boolean
  onClose: () => void
  timeRecord?: TimeRecord
  employeeId?: number
  onSuccess?: () => void
}

export function TimeRecordForm({ open, onClose, timeRecord, employeeId, onSuccess }: TimeRecordFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<TimeRecordFormData>({
    resolver: zodResolver(timeRecordSchema),
    defaultValues: {
      employee_id: employeeId || timeRecord?.employee_id || undefined,
      record_type: timeRecord?.record_type || 'check_in',
      record_date: timeRecord?.record_date
        ? format(new Date(timeRecord.record_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      record_time: timeRecord?.record_time || format(new Date(), 'HH:mm'),
      latitude: timeRecord?.latitude || '',
      longitude: timeRecord?.longitude || '',
      justification: timeRecord?.justification || '',
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['hr', 'employees', 'all'],
    queryFn: () => hrApi.getEmployees({ page_size: 1000 }),
    enabled: !employeeId,
  })

  React.useEffect(() => {
    if (timeRecord) {
      reset({
        employee_id: timeRecord.employee_id || timeRecord.employee?.id,
        record_type: timeRecord.record_type,
        record_date: timeRecord.record_date
          ? format(new Date(timeRecord.record_date), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
        record_time: timeRecord.record_time || format(new Date(), 'HH:mm'),
        latitude: timeRecord.latitude || '',
        longitude: timeRecord.longitude || '',
        justification: timeRecord.justification || '',
      })
    } else {
      reset({
        employee_id: employeeId || undefined,
        record_type: 'check_in',
        record_date: format(new Date(), 'yyyy-MM-dd'),
        record_time: format(new Date(), 'HH:mm'),
        latitude: '',
        longitude: '',
        justification: '',
      })
    }
  }, [timeRecord, employeeId, reset])

  const onSubmit = async (data: TimeRecordFormData) => {
    try {
      const payload: any = {
        employee: data.employee_id,
        record_type: data.record_type,
        record_date: data.record_date,
        record_time: data.record_time,
      }

      if (data.latitude) payload.latitude = data.latitude
      if (data.longitude) payload.longitude = data.longitude
      if (data.justification) payload.justification = data.justification

      if (timeRecord) {
        await hrApi.updateTimeRecord(timeRecord.id, payload)
        toast({
          title: tCommon('success'),
          description: t('timeRecordUpdated') || 'Time record updated successfully',
        })
      } else {
        await hrApi.createTimeRecord(payload)
        toast({
          title: tCommon('success'),
          description: t('timeRecordCreated') || 'Time record created successfully',
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {timeRecord ? t('updateTimeRecord') || 'Update Time Record' : t('newTimeRecord') || 'New Time Record'}
          </DialogTitle>
          <DialogDescription>
            {timeRecord
              ? t('updateTimeRecordDescription') || 'Update time record information'
              : t('createTimeRecordDescription') || 'Create a new time record'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-4">
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

            {/* Record Type */}
            <div className="space-y-2">
              <Label htmlFor="record_type">
                {t('type')} <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="record_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectType') || 'Select type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check_in">{t('checkIn') || 'Check In'}</SelectItem>
                      <SelectItem value="check_out">{t('checkOut') || 'Check Out'}</SelectItem>
                      <SelectItem value="lunch_in">{t('lunchIn') || 'Lunch In'}</SelectItem>
                      <SelectItem value="lunch_out">{t('lunchOut') || 'Lunch Out'}</SelectItem>
                      <SelectItem value="overtime_in">{t('overtimeIn') || 'Overtime In'}</SelectItem>
                      <SelectItem value="overtime_out">{t('overtimeOut') || 'Overtime Out'}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.record_type && (
                <p className="text-sm text-red-500">{errors.record_type.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="record_date">
                {t('date')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="record_date"
                type="date"
                {...register('record_date')}
                className={errors.record_date ? 'border-red-500' : ''}
              />
              {errors.record_date && (
                <p className="text-sm text-red-500">{errors.record_date.message}</p>
              )}
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="record_time">
                {t('time')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="record_time"
                type="time"
                {...register('record_time')}
                className={errors.record_time ? 'border-red-500' : ''}
              />
              {errors.record_time && (
                <p className="text-sm text-red-500">{errors.record_time.message}</p>
              )}
            </div>

            {/* Latitude (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="latitude">{t('latitude') || 'Latitude'} ({t('optional')})</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="e.g., -23.5505"
              />
            </div>

            {/* Longitude (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="longitude">{t('longitude') || 'Longitude'} ({t('optional')})</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="e.g., -46.6333"
              />
              </div>
            </div>

            {/* Justification */}
              <div className="space-y-2">
                <Label htmlFor="justification">
                  {t('justification') || 'Justification'} ({t('optional')})
                </Label>
                <Textarea
                  id="justification"
                  {...register('justification')}
                  placeholder={t('justificationPlaceholder') || 'Optional justification for this record...'}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {timeRecord ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

