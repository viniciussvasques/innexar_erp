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
import { Account } from '@/types/api'
import { financeApi } from '@/lib/api/finance'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { crmApi } from '@/lib/api/crm'

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['receivable', 'payable'], {
    required_error: 'Type is required',
  }),
  category_id: z.number().optional(),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.enum(['USD', 'BRL', 'MXN'], {
    required_error: 'Currency is required',
  }),
  due_date: z.string().min(1, 'Due date is required'),
  customer_id: z.number().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  open: boolean
  onClose: () => void
  account?: Account
  onSuccess?: () => void
}

export function AccountForm({ open, onClose, account, onSuccess }: AccountFormProps) {
  const t = useTranslations('finance')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('finance.placeholders')
  const tTypes = useTranslations('finance.types')
  const tCurrencies = useTranslations('finance.currencies')
  const { toast } = useToast()
  const isEditing = !!account

  // Buscar categorias e contatos
  const { data: categoriesData } = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => financeApi.getCategories(),
    enabled: open,
  })

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
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          category_id: account.category?.id,
          description: account.description,
          amount: account.amount,
          currency: account.currency,
          due_date: account.due_date ? new Date(account.due_date).toISOString().split('T')[0] : '',
          customer_id: account.customer?.id,
          vendor: account.vendor || '',
          notes: account.notes || '',
        }
      : {
          type: 'receivable',
          currency: 'USD',
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        account
          ? {
              name: account.name,
              type: account.type,
              category_id: account.category?.id,
              description: account.description,
              amount: account.amount,
              currency: account.currency,
              due_date: account.due_date
                ? new Date(account.due_date).toISOString().split('T')[0]
                : '',
              customer_id: account.customer?.id,
              vendor: account.vendor || '',
              notes: account.notes || '',
            }
          : {
              type: 'receivable',
              currency: 'USD',
            }
      )
    }
  }, [open, account, reset])

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing && account) {
        await financeApi.updateAccount(account.id, data)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await financeApi.createAccount(data)
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

  const accountType = watch('type')
  const incomeCategories = categoriesData?.filter(c => c.type === 'income') || []
  const expenseCategories = categoriesData?.filter(c => c.type === 'expense') || []
  const relevantCategories = accountType === 'receivable' ? incomeCategories : expenseCategories

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateAccount') : t('createAccount')}
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
                <Label htmlFor="type">
                  {t('type')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('type')}
                  onValueChange={value => setValue('type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">{tTypes('receivable')}</SelectItem>
                    <SelectItem value="payable">{tTypes('payable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">{t('category')}</Label>
                <Select
                  value={watch('category_id')?.toString() || ''}
                  onValueChange={value => setValue('category_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{tCommon('none')}</SelectItem>
                    {relevantCategories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('description')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={tPlaceholders('description')}
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
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
                <Label htmlFor="due_date">
                  {t('dueDate')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                  className={errors.due_date ? 'border-red-500' : ''}
                />
                {errors.due_date && (
                  <p className="text-sm text-red-500">{errors.due_date.message}</p>
                )}
              </div>
            </div>

            {accountType === 'receivable' ? (
              <div className="space-y-2">
                <Label htmlFor="customer_id">{t('customer')}</Label>
                <Select
                  value={watch('customer_id')?.toString() || ''}
                  onValueChange={value => setValue('customer_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('customer')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{tCommon('none')}</SelectItem>
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="vendor">{t('vendor')}</Label>
                <Input
                  id="vendor"
                  {...register('vendor')}
                  placeholder={tPlaceholders('vendor')}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder={tPlaceholders('description')}
                rows={2}
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

