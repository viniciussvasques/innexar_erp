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
import { Switch } from '@/components/ui/switch'
import { Dependent } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const dependentSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  cpf: z.string().optional(),
  ssn: z.string().optional(),
  relationship: z.enum(
    ['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other'],
    {
      required_error: 'Relationship is required',
    }
  ),
  is_tax_dependent: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type DependentFormData = z.infer<typeof dependentSchema>

interface DependentFormProps {
  open: boolean
  onClose: () => void
  dependent?: Dependent | null
  employeeId?: number
  onSuccess?: () => void
}

export function DependentForm({
  open,
  onClose,
  dependent,
  employeeId,
  onSuccess,
}: DependentFormProps) {
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
  } = useForm<DependentFormData>({
    resolver: zodResolver(dependentSchema),
    defaultValues: dependent
      ? {
          employee_id: dependent.employee_id || dependent.employee?.id,
          name: dependent.name || '',
          date_of_birth: dependent.date_of_birth
            ? new Date(dependent.date_of_birth).toISOString().split('T')[0]
            : '',
          cpf: dependent.cpf || '',
          ssn: dependent.ssn || '',
          relationship: dependent.relationship || 'other',
          is_tax_dependent: dependent.is_tax_dependent || false,
          is_active: dependent.is_active ?? true,
        }
      : {
          employee_id: employeeId || undefined,
          name: '',
          date_of_birth: '',
          cpf: '',
          ssn: '',
          relationship: 'other',
          is_tax_dependent: false,
          is_active: true,
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: DependentFormData) => hrApi.createDependent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'dependents'] })
      toast({
        title: tCommon('success'),
        description: t('createDependentSuccess') || 'Dependent created successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DependentFormData }) =>
      hrApi.updateDependent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'dependents'] })
      toast({
        title: tCommon('success'),
        description: t('updateDependentSuccess') || 'Dependent updated successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description:
          error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: DependentFormData) => {
    if (dependent) {
      updateMutation.mutate({ id: dependent.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isEditing = !!dependent

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editDependent') : t('newDependent')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateDependent') : t('createDependent')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('dependentNamePlaceholder')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">
                  {t('dateOfBirth')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    placeholder={t('cpfPlaceholder')}
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-red-500">{errors.cpf.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN</Label>
                  <Input
                    id="ssn"
                    {...register('ssn')}
                    placeholder={t('ssnPlaceholder')}
                    className={errors.ssn ? 'border-red-500' : ''}
                  />
                  {errors.ssn && (
                    <p className="text-sm text-red-500">{errors.ssn.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  {t('relationship')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relationship"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder={t('selectRelationship')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">{t('spouse')}</SelectItem>
                        <SelectItem value="son">{t('son')}</SelectItem>
                        <SelectItem value="daughter">{t('daughter')}</SelectItem>
                        <SelectItem value="father">{t('father')}</SelectItem>
                        <SelectItem value="mother">{t('mother')}</SelectItem>
                        <SelectItem value="brother">{t('brother')}</SelectItem>
                        <SelectItem value="sister">{t('sister')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.relationship && (
                  <p className="text-sm text-red-500">{errors.relationship.message}</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <Controller
                  name="is_tax_dependent"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_tax_dependent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="is_tax_dependent" className="cursor-pointer">
                        {t('isTaxDependent')}
                      </Label>
                    </div>
                  )}
                />

                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">
                        {t('isActive')}
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

