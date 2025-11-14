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
import { Lead } from '@/types/api'
import { crmApi } from '@/lib/api/crm'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  source: z.enum(['website', 'social', 'referral', 'ads', 'cold_call', 'event', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  notes: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  open: boolean
  onClose: () => void
  lead?: Lead
  onSuccess?: () => void
}

export function LeadForm({ open, onClose, lead, onSuccess }: LeadFormProps) {
  const t = useTranslations('crm.leads')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!lead
  const tSources = useTranslations('crm.leads.sources')
  const tStatuses = useTranslations('crm.leads.statuses')
  const tPlaceholders = useTranslations('crm.leads.placeholders')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          name: lead.name,
          email: lead.email,
          phone: lead.phone || '',
          company: lead.company || '',
          position: lead.position || '',
          source: lead.source,
          status: lead.status,
          notes: lead.notes || '',
        }
      : {
          source: 'website',
          status: 'new',
        },
  })

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (isEditing && lead) {
        await crmApi.updateLead(lead.id, data)
        toast({
          title: tCommon('success'),
          description: 'Lead updated successfully',
        })
      } else {
        await crmApi.createLead(data)
        toast({
          title: tCommon('success'),
          description: 'Lead created successfully',
        })
      }
      reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'An error occurred',
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
            {isEditing ? t('updateLead') : t('createLead')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="email">
                {t('email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={tPlaceholders('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder={tPlaceholders('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{t('company')}</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder={tPlaceholders('company')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">{t('position')}</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder={tPlaceholders('position')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">
                {t('source')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('source')}
                onValueChange={value => setValue('source', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">{tSources('website')}</SelectItem>
                  <SelectItem value="social">{tSources('social')}</SelectItem>
                  <SelectItem value="referral">{tSources('referral')}</SelectItem>
                  <SelectItem value="ads">{tSources('ads')}</SelectItem>
                  <SelectItem value="cold_call">{tSources('cold_call')}</SelectItem>
                  <SelectItem value="event">{tSources('event')}</SelectItem>
                  <SelectItem value="other">{tSources('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <SelectItem value="new">{tStatuses('new')}</SelectItem>
                <SelectItem value="contacted">{tStatuses('contacted')}</SelectItem>
                <SelectItem value="qualified">{tStatuses('qualified')}</SelectItem>
                <SelectItem value="converted">{tStatuses('converted')}</SelectItem>
                <SelectItem value="lost">{tStatuses('lost')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder={tPlaceholders('notes')}
              rows={3}
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

