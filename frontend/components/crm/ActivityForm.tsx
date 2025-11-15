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
import { Activity } from '@/types/api'
import { crmApi } from '@/lib/api/crm'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const activitySchema = z
  .object({
    activity_type: z.enum(['call', 'email', 'meeting', 'task', 'note', 'whatsapp'], {
      required_error: 'Activity type is required',
    }),
    subject: z.string().min(2, 'Subject must be at least 2 characters'),
    description: z.string().optional(),
    status: z.enum(['planned', 'completed', 'canceled'], {
      required_error: 'Status is required',
    }),
    lead: z.number().optional().nullable(),
    contact: z.number().optional().nullable(),
    deal: z.number().optional().nullable(),
    scheduled_at: z.string().optional(),
  })
  .refine(
    data => data.lead || data.contact || data.deal,
    {
      message: 'At least one of lead, contact, or deal must be selected',
      path: ['deal'],
    }
  )

type ActivityFormData = z.infer<typeof activitySchema>

interface ActivityFormProps {
  open: boolean
  onClose: () => void
  activity?: Activity
  onSuccess?: () => void
  defaultLeadId?: number
  defaultContactId?: number
  defaultDealId?: number
}

export function ActivityForm({
  open,
  onClose,
  activity,
  onSuccess,
  defaultLeadId,
  defaultContactId,
  defaultDealId,
}: ActivityFormProps) {
  const t = useTranslations('crm.activities')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('crm.activities.placeholders')
  const tTypes = useTranslations('crm.activities.types')
  const tStatuses = useTranslations('crm.activities.statuses')
  const { toast } = useToast()
  const isEditing = !!activity

  // Buscar leads, contacts e deals para os selects
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'all'],
    queryFn: () => crmApi.getLeads({ page: 1, page_size: 1000 }),
    enabled: open,
  })

  const { data: contactsData } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: () => crmApi.getContacts({ page: 1, page_size: 1000 }),
    enabled: open,
  })

  const { data: dealsData } = useQuery({
    queryKey: ['deals', 'all'],
    queryFn: () => crmApi.getDeals({ page: 1, page_size: 1000 }),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          activity_type: activity.activity_type,
          subject: activity.subject,
          description: activity.description || '',
          status: activity.status,
          lead: activity.lead || null,
          contact: activity.contact || null,
          deal: activity.deal || null,
          scheduled_at: activity.scheduled_at
            ? new Date(activity.scheduled_at).toISOString().slice(0, 16)
            : '',
        }
      : {
          activity_type: 'call',
          status: 'planned',
          lead: defaultLeadId || null,
          contact: defaultContactId || null,
          deal: defaultDealId || null,
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        activity
          ? {
              activity_type: activity.activity_type,
              subject: activity.subject,
              description: activity.description || '',
              status: activity.status,
              lead: activity.lead || null,
              contact: activity.contact || null,
              deal: activity.deal || null,
              scheduled_at: activity.scheduled_at
                ? new Date(activity.scheduled_at).toISOString().slice(0, 16)
                : '',
            }
          : {
              activity_type: 'call',
              status: 'planned',
              lead: defaultLeadId || null,
              contact: defaultContactId || null,
              deal: defaultDealId || null,
            }
      )
    }
  }, [open, activity, defaultLeadId, defaultContactId, defaultDealId, reset])

  const onSubmit = async (data: ActivityFormData) => {
    try {
      if (isEditing && activity) {
        await crmApi.updateActivity(activity.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await crmApi.createActivity(data)
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
            {isEditing ? t('updateActivity') : t('createActivity')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_type">
                  {t('type')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('activity_type')}
                  onValueChange={value => setValue('activity_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">{tTypes('call')}</SelectItem>
                    <SelectItem value="email">{tTypes('email')}</SelectItem>
                    <SelectItem value="meeting">{tTypes('meeting')}</SelectItem>
                    <SelectItem value="task">{tTypes('task')}</SelectItem>
                    <SelectItem value="note">{tTypes('note')}</SelectItem>
                    <SelectItem value="whatsapp">{tTypes('whatsapp')}</SelectItem>
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
                    <SelectItem value="planned">{tStatuses('planned')}</SelectItem>
                    <SelectItem value="completed">{tStatuses('completed')}</SelectItem>
                    <SelectItem value="canceled">{tStatuses('canceled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                {t('subject')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder={tPlaceholders('subject')}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
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

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead">{t('lead')}</Label>
                  <Select
                    value={watch('lead')?.toString() || 'none'}
                    onValueChange={value => setValue('lead', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('lead')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('none')}</SelectItem>
                      {leadsData?.results.map(lead => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">{t('contact')}</Label>
                  <Select
                    value={watch('contact')?.toString() || 'none'}
                    onValueChange={value => setValue('contact', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('contact')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('none')}</SelectItem>
                      {contactsData?.results.map(contact => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal">{t('deal')}</Label>
                  <Select
                    value={watch('deal')?.toString() || 'none'}
                    onValueChange={value => setValue('deal', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tPlaceholders('deal')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('none')}</SelectItem>
                      {dealsData?.results.map(deal => (
                        <SelectItem key={deal.id} value={deal.id.toString()}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(errors.lead || errors.contact || errors.deal) && (
                <p className="text-sm text-red-500">
                  {errors.lead?.message || errors.contact?.message || errors.deal?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">{t('scheduledAt')}</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                {...register('scheduled_at')}
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

