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
import { JobPosition } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'

const jobPositionSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  department_id: z.number().min(1, 'Department is required'),
  level: z.enum(['intern', 'junior', 'pleno', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level']),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  is_active: z.boolean().default(true),
})

type JobPositionFormData = z.infer<typeof jobPositionSchema>

interface JobPositionFormProps {
  open: boolean
  onClose: () => void
  jobPosition?: JobPosition
  onSuccess?: () => void
}

export function JobPositionForm({ open, onClose, jobPosition, onSuccess }: JobPositionFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!jobPosition

  // Buscar departamentos
  const { data: departments } = useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: () => hrApi.getDepartments({ active_only: true }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<JobPositionFormData>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues: jobPosition
      ? {
          code: jobPosition.code,
          name: jobPosition.name,
          department_id: jobPosition.department_id || (departments?.results?.[0]?.id || 0),
          level: jobPosition.level,
          salary_min: jobPosition.salary_min || '',
          salary_max: jobPosition.salary_max || '',
          description: jobPosition.description || '',
          requirements: jobPosition.requirements || '',
          responsibilities: jobPosition.responsibilities || '',
          is_active: jobPosition.is_active ?? true,
        }
      : {
          code: '',
          name: '',
          department_id: departments?.results?.[0]?.id || 0,
          level: 'junior',
          salary_min: '',
          salary_max: '',
          description: '',
          requirements: '',
          responsibilities: '',
          is_active: true,
        },
  })

  React.useEffect(() => {
    if (open) {
      const defaultDepartmentId = departments?.results?.[0]?.id
      reset(
        jobPosition
          ? {
              code: jobPosition.code,
              name: jobPosition.name,
              department_id: jobPosition.department_id || defaultDepartmentId || 0,
              level: jobPosition.level,
              salary_min: jobPosition.salary_min || '',
              salary_max: jobPosition.salary_max || '',
              description: jobPosition.description || '',
              requirements: jobPosition.requirements || '',
              responsibilities: jobPosition.responsibilities || '',
              is_active: jobPosition.is_active ?? true,
            }
          : {
              code: '',
              name: '',
              department_id: defaultDepartmentId || 0,
              level: 'junior',
              salary_min: '',
              salary_max: '',
              description: '',
              requirements: '',
              responsibilities: '',
              is_active: true,
            }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobPosition, departments])

  const onSubmit = async (data: JobPositionFormData) => {
    try {
      // Função para limpar valores vazios
      const cleanValue = (value: any): any => {
        if (value === '' || value === null || value === undefined) {
          return undefined
        }
        return value
      }

      const submitData: any = {
        code: data.code,
        name: data.name,
        department: data.department_id, // Backend espera 'department', não 'department_id'
        level: data.level,
        is_active: data.is_active,
      }

      // Campos opcionais - só adicionar se tiver valor
      if (cleanValue(data.salary_min)) submitData.salary_min = data.salary_min
      if (cleanValue(data.salary_max)) submitData.salary_max = data.salary_max
      if (cleanValue(data.description)) submitData.description = data.description
      if (cleanValue(data.requirements)) submitData.requirements = data.requirements
      if (cleanValue(data.responsibilities)) submitData.responsibilities = data.responsibilities

      if (isEditing && jobPosition) {
        await hrApi.updateJobPosition(jobPosition.id, submitData)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess') || 'Job position updated successfully',
        })
      } else {
        await hrApi.createJobPosition(submitData)
        toast({
          title: tCommon('success'),
          description: t('createSuccess') || 'Job position created successfully',
        })
      }
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
      <DialogContent size="large" className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editJobPosition') || 'Edit Job Position' : t('newJobPosition') || 'New Job Position'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateJobPosition') || 'Update job position information'
              : t('createJobPosition') || 'Create a new job position'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('code') || 'Code'}</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder={t('code') || 'Job position code (e.g., DEV-JR)'}
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('name') || 'Job position name'}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department_id">{t('department')}</Label>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={value => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('selectDepartment') || 'Select department'} />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.results.map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department_id && (
                  <p className="text-sm text-red-500">{errors.department_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">{t('level') || 'Level'}</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intern">{t('levels.intern') || 'Intern'}</SelectItem>
                        <SelectItem value="junior">{t('levels.junior') || 'Junior'}</SelectItem>
                        <SelectItem value="pleno">{t('levels.pleno') || 'Mid-Level'}</SelectItem>
                        <SelectItem value="senior">{t('levels.senior') || 'Senior'}</SelectItem>
                        <SelectItem value="lead">{t('levels.lead') || 'Lead'}</SelectItem>
                        <SelectItem value="manager">{t('levels.manager') || 'Manager'}</SelectItem>
                        <SelectItem value="director">{t('levels.director') || 'Director'}</SelectItem>
                        <SelectItem value="vp">{t('levels.vp') || 'Vice President'}</SelectItem>
                        <SelectItem value="c_level">{t('levels.c_level') || 'C-Level'}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">{t('salaryMin') || 'Minimum Salary'}</Label>
                <Input
                  id="salary_min"
                  type="number"
                  step="0.01"
                  {...register('salary_min')}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">{t('salaryMax') || 'Maximum Salary'}</Label>
                <Input
                  id="salary_max"
                  type="number"
                  step="0.01"
                  {...register('salary_max')}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description') || 'Description'}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('description') || 'Job position description'}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">{t('requirements') || 'Requirements'}</Label>
              <Textarea
                id="requirements"
                {...register('requirements')}
                placeholder={t('requirements') || 'Job requirements'}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">{t('responsibilities') || 'Responsibilities'}</Label>
              <Textarea
                id="responsibilities"
                {...register('responsibilities')}
                placeholder={t('responsibilities') || 'Job responsibilities'}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="is_active" />
                )}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {t('active') || 'Active'}
              </Label>
              </div>

            </div>
          </div>

          <DialogFooter className="mt-4 px-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

