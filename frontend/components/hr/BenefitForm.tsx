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
import { Benefit } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const benefitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  benefit_type: z.enum([
    'meal_voucher',
    'food_voucher',
    'transportation',
    'health_insurance',
    'dental_insurance',
    'life_insurance',
    'daycare',
    'gympass',
    'other',
  ]),
  description: z.string().optional(),
  value: z.string().optional(),
  limit: z.string().optional(),
  is_active: z.boolean().default(true),
})

type BenefitFormData = z.infer<typeof benefitSchema>

interface BenefitFormProps {
  open: boolean
  onClose: () => void
  benefit?: Benefit | null
}

export function BenefitForm({ open, onClose, benefit }: BenefitFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BenefitFormData>({
    resolver: zodResolver(benefitSchema),
    defaultValues: benefit
      ? {
          name: benefit.name,
          benefit_type: benefit.benefit_type,
          description: benefit.description || '',
          value: benefit.value || '',
          limit: benefit.limit || '',
          is_active: benefit.is_active,
        }
      : {
          name: '',
          benefit_type: 'meal_voucher',
          description: '',
          value: '',
          limit: '',
          is_active: true,
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: BenefitFormData) => {
      const payload: Partial<Benefit> = {
        ...data,
        value: data.value || undefined,
        limit: data.limit || undefined,
      }
      return hrApi.createBenefit(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'benefits'] })
      toast({
        title: tCommon('success'),
        description: t('createBenefitSuccess') || 'Benefit created successfully',
      })
      reset()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail ||
          error?.message ||
          tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: BenefitFormData) => {
      if (!benefit) return Promise.reject(new Error('No benefit provided'))
      const payload: Partial<Benefit> = {
        ...data,
        value: data.value || undefined,
        limit: data.limit || undefined,
      }
      return hrApi.updateBenefit(benefit.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'benefits'] })
      toast({
        title: tCommon('success'),
        description: t('updateBenefitSuccess') || 'Benefit updated successfully',
      })
      reset()
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail ||
          error?.message ||
          tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: BenefitFormData) => {
    if (benefit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const benefitTypeOptions = [
    { value: 'meal_voucher', label: t('mealVoucher') || 'Meal Voucher' },
    { value: 'food_voucher', label: t('foodVoucher') || 'Food Voucher' },
    { value: 'transportation', label: t('transportation') || 'Transportation' },
    {
      value: 'health_insurance',
      label: t('healthInsurance') || 'Health Insurance',
    },
    {
      value: 'dental_insurance',
      label: t('dentalInsurance') || 'Dental Insurance',
    },
    {
      value: 'life_insurance',
      label: t('lifeInsurance') || 'Life Insurance',
    },
    { value: 'daycare', label: t('daycare') || 'Daycare' },
    { value: 'gympass', label: t('gympass') || 'Gympass' },
    { value: 'other', label: t('other') || 'Other' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {benefit ? t('editBenefit') || 'Edit Benefit' : t('newBenefit') || 'New Benefit'}
          </DialogTitle>
          <DialogDescription>
            {benefit
              ? t('updateBenefitDescription') || 'Update benefit information'
              : t('createBenefitDescription') || 'Create a new benefit'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('name')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('benefitNamePlaceholder') || 'Benefit name'}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefit_type">
              {t('type')} <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="benefit_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className={errors.benefit_type ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('selectType') || 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {benefitTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.benefit_type && (
              <p className="text-sm text-red-500">
                {errors.benefit_type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('benefitDescriptionPlaceholder') || 'Benefit description'}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">{t('value')}</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register('value')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">{t('limit')}</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                {...register('limit')}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              {t('active')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {benefit ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

