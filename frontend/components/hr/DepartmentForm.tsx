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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Department } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'

const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  open: boolean
  onClose: () => void
  department?: Department
  onSuccess?: () => void
}

export function DepartmentForm({ open, onClose, department, onSuccess }: DepartmentFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!department

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description || '',
          is_active: department.is_active ?? true,
        }
      : {
          name: '',
          code: '',
          description: '',
          is_active: true,
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        department
          ? {
              name: department.name,
              code: department.code,
              description: department.description || '',
              is_active: department.is_active ?? true,
            }
          : {
              name: '',
              code: '',
              description: '',
              is_active: true,
            }
      )
    }
  }, [open, department, reset])

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (isEditing && department) {
        await hrApi.updateDepartment(department.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess') || 'Department updated successfully',
        })
      } else {
        await hrApi.createDepartment(data)
        toast({
          title: tCommon('success'),
          description: t('createSuccess') || 'Department created successfully',
        })
      }
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || error.message || 'Failed to save department',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium" className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') || 'Edit Department' : t('newDepartment')}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateDepartment') || 'Update department information'
              : t('createDepartment') || 'Create a new department'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('name') || 'Department name'}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">{t('code') || 'Code'}</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder={t('code') || 'Department code'}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description') || 'Description'}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('description') || 'Department description'}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="is_active"
                  />
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

