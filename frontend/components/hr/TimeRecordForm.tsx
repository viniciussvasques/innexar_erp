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
import { TimeRecord, Employee } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Clock, MapPin, Navigation } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import React, { useState } from 'react'

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
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationCaptured, setLocationCaptured] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: tCommon('error'),
        description: t('geolocationNotSupported') || 'Geolocation is not supported by your browser',
        variant: 'destructive',
      })
      return
    }

    setIsGettingLocation(true)
    setLocationCaptured(false)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        
        setValue('latitude', lat)
        setValue('longitude', lng)
        setLocationCaptured(true)
        setIsGettingLocation(false)
        
        toast({
          title: tCommon('success'),
          description: t('locationCaptured') || 'Location captured successfully',
        })
      },
      (error) => {
        setIsGettingLocation(false)
        let errorMessage = t('locationError') || 'Error getting location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('locationPermissionDenied') || 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('locationUnavailable') || 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = t('locationTimeout') || 'Location request timed out'
            break
        }
        
        toast({
          title: tCommon('error'),
          description: errorMessage,
          variant: 'destructive',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleClearLocation = () => {
    setValue('latitude', '')
    setValue('longitude', '')
    setLocationCaptured(false)
  }

  React.useEffect(() => {
    if (timeRecord) {
      const hasLocation = !!(timeRecord.latitude && timeRecord.longitude)
      setLocationCaptured(hasLocation)
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
      setLocationCaptured(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRecord, employeeId, open])

  const onSubmit = async (data: TimeRecordFormData) => {
    try {
      const payload: any = {
        employee: data.employee_id, // Backend espera 'employee', não 'employee_id'
        record_type: data.record_type,
        record_date: data.record_date,
        record_time: data.record_time,
      }

      // Campos opcionais - só adicionar se tiver valor
      if (data.latitude && data.latitude.trim() !== '') {
        payload.latitude = data.latitude
      }
      if (data.longitude && data.longitude.trim() !== '') {
        payload.longitude = data.longitude
      }
      if (data.justification && data.justification.trim() !== '') {
        payload.justification = data.justification
      }

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
      // Tratar erros de validação do Django REST Framework
      let errorMessage = tCommon('errorOccurred')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Se for um objeto de validação (DRF)
        if (typeof errorData === 'object' && !errorData.detail) {
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
          errorMessage = errorData.detail || errorData.message || errorMessage
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
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

        <DialogBody>
          <form id="time-record-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Location Section */}
            <div className="space-y-3 col-span-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base font-medium">
                    {t('location') || 'Location'} ({t('optional') || 'Optional'})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  {locationCaptured && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t('locationCaptured') || 'Captured'}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="h-8"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        {t('gettingLocation') || 'Getting location...'}
                      </>
                    ) : (
                      <>
                        <Navigation className="mr-2 h-3 w-3" />
                        {t('captureLocation') || 'Capture Location'}
                      </>
                    )}
                  </Button>
                  {(watch('latitude') || watch('longitude')) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLocation}
                      className="h-8 text-xs"
                    >
                      {tCommon('reset') || 'Clear'}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('locationHelp') || 'Click "Capture Location" to automatically get your current location, or enter coordinates manually.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm">
                    {t('latitude') || 'Latitude'}
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register('latitude', {
                      onChange: (e) => {
                        if (e.target.value && watch('longitude')) {
                          setLocationCaptured(true)
                        } else {
                          setLocationCaptured(false)
                        }
                      },
                    })}
                    placeholder="-23.5505"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm">
                    {t('longitude') || 'Longitude'}
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register('longitude', {
                      onChange: (e) => {
                        if (e.target.value && watch('latitude')) {
                          setLocationCaptured(true)
                        } else {
                          setLocationCaptured(false)
                        }
                      },
                    })}
                    placeholder="-46.6333"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="space-y-2 col-span-2">
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
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" form="time-record-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {timeRecord ? tCommon('update') : tCommon('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

