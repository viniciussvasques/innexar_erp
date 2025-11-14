'use client'

import { useForm, useFieldArray } from 'react-hook-form'
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
import { Invoice, InvoiceItem } from '@/types/api'
import { invoicingApi, CreateInvoiceData } from '@/lib/api/invoicing'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { crmApi } from '@/lib/api/crm'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.string().min(1, 'Unit price is required'),
  discount: z.string().optional().default('0'),
  tax_rate: z.number().min(0).max(100).optional().default(0),
})

const invoiceSchema = z.object({
  customer_id: z.number().min(1, 'Customer is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.enum(['USD', 'BRL', 'MXN'], {
    required_error: 'Currency is required',
  }),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  invoice?: Invoice
  onSuccess?: () => void
}

export function InvoiceForm({ open, onClose, invoice, onSuccess }: InvoiceFormProps) {
  const t = useTranslations('invoicing')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('invoicing.placeholders')
  const tCurrencies = useTranslations('invoicing.currencies')
  const { toast } = useToast()
  const isEditing = !!invoice

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
    control,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          customer_id: invoice.customer.id,
          issue_date: invoice.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : '',
          due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
          currency: invoice.currency,
          items: invoice.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount || '0',
            tax_rate: item.tax_rate || 0,
          })),
          notes: invoice.notes || '',
        }
      : {
          currency: 'USD',
          issue_date: new Date().toISOString().split('T')[0],
          items: [
            {
              description: '',
              quantity: 1,
              unit_price: '0.00',
              discount: '0',
              tax_rate: 0,
            },
          ],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  React.useEffect(() => {
    if (open) {
      reset(
        invoice
          ? {
              customer_id: invoice.customer.id,
              issue_date: invoice.issue_date
                ? new Date(invoice.issue_date).toISOString().split('T')[0]
                : '',
              due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
              currency: invoice.currency,
              items: invoice.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount || '0',
                tax_rate: item.tax_rate || 0,
              })),
              notes: invoice.notes || '',
            }
          : {
              currency: 'USD',
              issue_date: new Date().toISOString().split('T')[0],
              items: [
                {
                  description: '',
                  quantity: 1,
                  unit_price: '0.00',
                  discount: '0',
                  tax_rate: 0,
                },
              ],
            }
      )
    }
  }, [open, invoice, reset])

  const calculateItemTotal = (index: number): number => {
    const items = watch('items')
    const item = items[index]
    if (!item) return 0

    const quantity = item.quantity || 0
    const unitPrice = parseFloat(item.unit_price || '0')
    const discount = parseFloat(item.discount || '0')
    const taxRate = item.tax_rate || 0

    const subtotal = quantity * unitPrice - discount
    const tax = subtotal * (taxRate / 100)
    return subtotal + tax
  }

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const payload: CreateInvoiceData = {
        customer_id: data.customer_id,
        issue_date: data.issue_date,
        due_date: data.due_date,
        currency: data.currency,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || '0',
          tax_rate: item.tax_rate || 0,
        })),
        notes: data.notes,
      }

      if (isEditing && invoice) {
        await invoicingApi.updateInvoice(invoice.id, payload)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await invoicingApi.createInvoice(payload)
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
      <DialogContent size="large">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('new')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateInvoice') : t('createInvoice')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">
                  {t('customer')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('customer_id')?.toString() || ''}
                  onValueChange={value => setValue('customer_id', parseInt(value))}
                >
                  <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('customer')} />
                  </SelectTrigger>
                  <SelectContent>
                    {contactsData?.results
                      .filter(contact => contact.is_customer)
                      .map(contact => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.name} {contact.email ? `(${contact.email})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.customer_id && (
                  <p className="text-sm text-red-500">{errors.customer_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_date">
                  {t('issueDate')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issue_date"
                  type="date"
                  {...register('issue_date')}
                  className={errors.issue_date ? 'border-red-500' : ''}
                />
                {errors.issue_date && (
                  <p className="text-sm text-red-500">{errors.issue_date.message}</p>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('items')} <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      description: '',
                      quantity: 1,
                      unit_price: '0.00',
                      discount: '0',
                      tax_rate: 0,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addItem')}
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="col-span-5 space-y-2">
                    <Label>{t('itemDescription')}</Label>
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder={tPlaceholders('description')}
                      className={errors.items?.[index]?.description ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-sm text-red-500">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>{t('itemQuantity')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      placeholder={tPlaceholders('quantity')}
                      className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>{t('itemUnitPrice')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`)}
                      placeholder={tPlaceholders('unitPrice')}
                      className={errors.items?.[index]?.unit_price ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>{t('itemTotal')}</Label>
                    <Input
                      value={calculateItemTotal(index).toFixed(2)}
                      readOnly
                      className="bg-slate-100 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
                <p className="text-sm text-red-500">{errors.items.message as string}</p>
              )}
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

