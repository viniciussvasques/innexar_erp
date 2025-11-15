'use client'

import { useForm } from 'react-hook-form'
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
import { Project } from '@/types/api'
import { projectsApi } from '@/lib/api/projects'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { crmApi } from '@/lib/api/crm'

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  customer_id: z.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  budget: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'], {
    required_error: 'Status is required',
  }),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  project?: Project
  onSuccess?: () => void
}

export function ProjectForm({ open, onClose, project, onSuccess }: ProjectFormProps) {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('projects.placeholders')
  const tStatuses = useTranslations('projects.statuses')
  const { toast } = useToast()
  const isEditing = !!project

  // Buscar contatos (clientes)
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: () => crmApi.getContacts({ page: 1, page_size: 1000 }),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description || '',
          customer_id: project.customer?.id,
          start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
          end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
          budget: project.budget || '',
          status: project.status,
        }
      : {
          status: 'planning',
          start_date: new Date().toISOString().split('T')[0],
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              name: project.name,
              description: project.description || '',
              customer_id: project.customer?.id,
              start_date: project.start_date
                ? new Date(project.start_date).toISOString().split('T')[0]
                : '',
              end_date: project.end_date
                ? new Date(project.end_date).toISOString().split('T')[0]
                : '',
              budget: project.budget || '',
              status: project.status,
            }
          : {
              status: 'planning',
              start_date: new Date().toISOString().split('T')[0],
            }
      )
    }
  }, [open, project, reset])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (isEditing && project) {
        await projectsApi.updateProject(project.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await projectsApi.createProject(data)
        toast({
          title: tCommon('success'),
          description: t('createSuccess'),
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
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateProject') : t('createProject')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={tPlaceholders('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={tPlaceholders('description')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">{t('customer')}</Label>
                <Select
                  value={watch('customer_id')?.toString() || 'none'}
                  onValueChange={value => setValue('customer_id', value === 'none' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('customer')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{tCommon('none')}</SelectItem>
                    {contactsData?.results
                      .filter(contact => contact.is_customer)
                      .map(contact => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.name} {contact.email ? `(${contact.email})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  {t('status')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('status')}
                  onValueChange={value => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">{tStatuses('planning')}</SelectItem>
                    <SelectItem value="in_progress">{tStatuses('in_progress')}</SelectItem>
                    <SelectItem value="on_hold">{tStatuses('on_hold')}</SelectItem>
                    <SelectItem value="completed">{tStatuses('completed')}</SelectItem>
                    <SelectItem value="cancelled">{tStatuses('cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">{t('budget')}</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                {...register('budget')}
                placeholder={tPlaceholders('budget')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tCommon('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}


