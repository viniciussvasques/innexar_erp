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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Contact } from '@/types/api'
import { crmApi } from '@/lib/api/crm'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip_code: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitter: z.string().optional(),
  notes: z.string().optional(),
  is_customer: z.boolean().default(false),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  open: boolean
  onClose: () => void
  contact?: Contact
  onSuccess?: () => void
}

export function ContactForm({ open, onClose, contact, onSuccess }: ContactFormProps) {
  const t = useTranslations('crm.contacts')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('crm.contacts.placeholders')
  const { toast } = useToast()
  const isEditing = !!contact

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          mobile: contact.mobile || '',
          company: contact.company || '',
          position: contact.position || '',
          address: contact.address || '',
          city: contact.city || '',
          state: contact.state || '',
          country: contact.country || '',
          zip_code: contact.zip_code || '',
          linkedin: contact.linkedin || '',
          twitter: contact.twitter || '',
          notes: contact.notes || '',
          is_customer: contact.is_customer || false,
        }
      : {
          is_customer: false,
        },
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contact) {
        await crmApi.updateContact(contact.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await crmApi.createContact(data)
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
      <DialogContent size="large" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateContact') : t('createContact')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('basicInfo')}
            </h3>
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
                <Label htmlFor="mobile">{t('mobile')}</Label>
                <Input
                  id="mobile"
                  {...register('mobile')}
                  placeholder={tPlaceholders('mobile')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('company')}</Label>
                <Input
                  id="company"
                  {...register('company')}
                  placeholder={tPlaceholders('company')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">{t('position')}</Label>
                <Input
                  id="position"
                  {...register('position')}
                  placeholder={tPlaceholders('position')}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('addressInfo')}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input id="address" {...register('address')} placeholder={tPlaceholders('address')} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input id="city" {...register('city')} placeholder={tPlaceholders('city')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t('state')}</Label>
                <Input id="state" {...register('state')} placeholder={tPlaceholders('state')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">{t('zipCode')}</Label>
                <Input
                  id="zip_code"
                  {...register('zip_code')}
                  placeholder={tPlaceholders('zipCode')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t('country')}</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder={tPlaceholders('country')}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('socialMedia')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">{t('linkedin')}</Label>
                <Input
                  id="linkedin"
                  {...register('linkedin')}
                  placeholder={tPlaceholders('linkedin')}
                  className={errors.linkedin ? 'border-red-500' : ''}
                />
                {errors.linkedin && (
                  <p className="text-sm text-red-500">{errors.linkedin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">{t('twitter')}</Label>
                <Input
                  id="twitter"
                  {...register('twitter')}
                  placeholder={tPlaceholders('twitter')}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder={tPlaceholders('notes')}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_customer"
                checked={watch('is_customer')}
                onCheckedChange={checked => setValue('is_customer', checked === true)}
              />
              <Label htmlFor="is_customer" className="cursor-pointer">
                {t('isCustomer')}
              </Label>
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

