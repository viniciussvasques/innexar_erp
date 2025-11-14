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
import { Checkbox } from '@/components/ui/checkbox'
import { Product } from '@/types/api'
import { inventoryApi } from '@/lib/api/inventory'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import React from 'react'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.enum(['un', 'kg', 'l', 'm'], {
    required_error: 'Unit is required',
  }),
  cost_price: z.string().min(1, 'Cost price is required'),
  sale_price: z.string().min(1, 'Sale price is required'),
  barcode: z.string().optional(),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  min_stock: z.number().min(0, 'Min stock must be 0 or greater'),
  max_stock: z.number().optional().nullable(),
  is_active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: Product
  onSuccess?: () => void
}

export function ProductForm({ open, onClose, product, onSuccess }: ProductFormProps) {
  const t = useTranslations('inventory')
  const tCommon = useTranslations('common')
  const tPlaceholders = useTranslations('inventory.placeholders')
  const tUnits = useTranslations('inventory.units')
  const { toast } = useToast()
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          unit: product.unit,
          cost_price: product.cost_price,
          sale_price: product.sale_price,
          barcode: product.barcode || '',
          stock: product.stock,
          min_stock: product.min_stock,
          max_stock: product.max_stock || null,
          is_active: product.is_active,
        }
      : {
          unit: 'un',
          stock: 0,
          min_stock: 0,
          is_active: true,
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              sku: product.sku,
              name: product.name,
              description: product.description || '',
              category: product.category || '',
              unit: product.unit,
              cost_price: product.cost_price,
              sale_price: product.sale_price,
              barcode: product.barcode || '',
              stock: product.stock,
              min_stock: product.min_stock,
              max_stock: product.max_stock || null,
              is_active: product.is_active,
            }
          : {
              unit: 'un',
              stock: 0,
              min_stock: 0,
              is_active: true,
            }
      )
    }
  }, [open, product, reset])

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Convert null to undefined for max_stock to match API type
      const submitData = {
        ...data,
        max_stock: data.max_stock ?? undefined,
      }
      if (isEditing && product) {
        await inventoryApi.updateProduct(product.id, submitData)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess'),
        })
      } else {
        await inventoryApi.createProduct(submitData)
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
            {isEditing ? t('updateProduct') : t('createProduct')}
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">
                  {t('sku')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder={tPlaceholders('sku')}
                  className={errors.sku ? 'border-red-500' : ''}
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku.message}</p>
                )}
              </div>

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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder={tPlaceholders('category')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  {t('unit')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('unit')}
                  onValueChange={value => setValue('unit', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">{tUnits('un')}</SelectItem>
                    <SelectItem value="kg">{tUnits('kg')}</SelectItem>
                    <SelectItem value="l">{tUnits('l')}</SelectItem>
                    <SelectItem value="m">{tUnits('m')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">{t('barcode')}</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder={tPlaceholders('barcode')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">
                  {t('costPrice')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...register('cost_price')}
                  className={errors.cost_price ? 'border-red-500' : ''}
                />
                {errors.cost_price && (
                  <p className="text-sm text-red-500">{errors.cost_price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_price">
                  {t('salePrice')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  {...register('sale_price')}
                  className={errors.sale_price ? 'border-red-500' : ''}
                />
                {errors.sale_price && (
                  <p className="text-sm text-red-500">{errors.sale_price.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">
                  {t('stock')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  step="0.01"
                  {...register('stock', { valueAsNumber: true })}
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock">
                  {t('minStock')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="min_stock"
                  type="number"
                  step="0.01"
                  {...register('min_stock', { valueAsNumber: true })}
                  className={errors.min_stock ? 'border-red-500' : ''}
                />
                {errors.min_stock && (
                  <p className="text-sm text-red-500">{errors.min_stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_stock">{t('maxStock')}</Label>
                <Input
                  id="max_stock"
                  type="number"
                  step="0.01"
                  {...register('max_stock', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={checked => setValue('is_active', checked === true)}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {t('isActive')}
              </Label>
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


