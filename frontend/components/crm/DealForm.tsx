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
import { Deal } from '@/types/api'
import { crmApi } from '@/lib/api/crm'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const dealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.enum(['USD', 'BRL', 'MXN', 'ARS', 'CLP', 'COP'], {
    required_error: 'Currency is required',
  }),
  probability: z.number().min(0).max(100),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], {
    required_error: 'Stage is required',
  }),
  contact: z.number().optional(),
  expected_close_date: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormProps {
  open: boolean
  onClose: () => void
  deal?: Deal
  onSuccess?: () => void
}

export function DealForm({ open, onClose, deal, onSuccess }: DealFormProps) {
  const t = useTranslations('crm.deals')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('crm.deals.placeholders')
  const tStages = useTranslations('crm.deals.stages')
  const tCurrencies = useTranslations('crm.deals.currencies')
  const { toast } = useToast()
  const isEditing = !!deal

  // Buscar contatos para o select
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
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          description: deal.description || '',
          amount: deal.amount,
          currency: deal.currency,
          probability: deal.probability,
          stage: deal.stage,
          contact: deal.contact,
          expected_close_date: deal.expected_close_date
            ? new Date(deal.expected_close_date).toISOString().split('T')[0]
            : '',
        }
      : {
          currency: 'USD',
          probability: 50,
          stage: 'prospecting',
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        deal
          ? {
              title: deal.title,
              description: deal.description || '',
              amount: deal.amount,
              currency: deal.currency,
              probability: deal.probability,
              stage: deal.stage,
              contact: deal.contact,
              expected_close_date: deal.expected_close_date
                ? new Date(deal.expected_close_date).toISOString().split('T')[0]
                : '',
            }
          : {
              currency: 'USD',
              probability: 50,
              stage: 'prospecting',
            }
      )
    }
  }, [open, deal, reset])

  const onSubmit = async (data: DealFormData) => {
    try {
      if (isEditing && deal) {
        await crmApi.updateDeal(deal.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await crmApi.createDeal(data)
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
            {isEditing ? t('updateDeal') : t('createDeal')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('dealTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={tPlaceholders('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
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
                <Label htmlFor="amount">
                  {t('amount')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  placeholder={tPlaceholders('amount')}
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  {t('currency')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('currency')}
                  onValueChange={value => setValue('currency', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">{tCurrencies('USD')}</SelectItem>
                    <SelectItem value="BRL">{tCurrencies('BRL')}</SelectItem>
                    <SelectItem value="MXN">{tCurrencies('MXN')}</SelectItem>
                    <SelectItem value="ARS">{tCurrencies('ARS')}</SelectItem>
                    <SelectItem value="CLP">{tCurrencies('CLP')}</SelectItem>
                    <SelectItem value="COP">{tCurrencies('COP')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">
                  {t('probability')} ({watch('probability')}%)
                </Label>
                <Input
                  id="probability"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  {...register('probability', { valueAsNumber: true })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">
                  {t('stage')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('stage')}
                  onValueChange={value => setValue('stage', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">{tStages('prospecting')}</SelectItem>
                    <SelectItem value="qualification">{tStages('qualification')}</SelectItem>
                    <SelectItem value="proposal">{tStages('proposal')}</SelectItem>
                    <SelectItem value="negotiation">{tStages('negotiation')}</SelectItem>
                    <SelectItem value="closed_won">{tStages('closed_won')}</SelectItem>
                    <SelectItem value="closed_lost">{tStages('closed_lost')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">{t('contact')}</Label>
                <Select
                  value={watch('contact')?.toString() || 'none'}
                  onValueChange={value => setValue('contact', value === 'none' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tPlaceholders('contact')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noContact')}</SelectItem>
                    {contactsData?.results.map(contact => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.name} {contact.email ? `(${contact.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">{t('expectedCloseDate')}</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  {...register('expected_close_date')}
                />
              </div>
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

