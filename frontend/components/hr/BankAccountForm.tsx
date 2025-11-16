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
import { BankAccount } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

const bankAccountSchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  bank_code: z.string().optional(),
  agency: z.string().min(1, 'Agency is required'),
  account_number: z.string().min(1, 'Account number is required'),
  account_type: z.enum(['checking', 'savings'], {
    required_error: 'Account type is required',
  }),
  pix_key: z.string().optional(),
  pix_key_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']).optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type BankAccountFormData = z.infer<typeof bankAccountSchema>

interface BankAccountFormProps {
  open: boolean
  onClose: () => void
  bankAccount?: BankAccount | null
  employeeId?: number
  onSuccess?: () => void
}

export function BankAccountForm({
  open,
  onClose,
  bankAccount,
  employeeId,
  onSuccess,
}: BankAccountFormProps) {
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
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: bankAccount
      ? {
          employee_id: bankAccount.employee_id || bankAccount.employee?.id,
          bank_name: bankAccount.bank_name || '',
          bank_code: bankAccount.bank_code || '',
          agency: bankAccount.agency || '',
          account_number: bankAccount.account_number || '',
          account_type: bankAccount.account_type || 'checking',
          pix_key: bankAccount.pix_key || '',
          pix_key_type: bankAccount.pix_key_type || undefined,
          is_primary: bankAccount.is_primary || false,
          is_active: bankAccount.is_active ?? true,
        }
      : {
          employee_id: employeeId || undefined,
          bank_name: '',
          bank_code: '',
          agency: '',
          account_number: '',
          account_type: 'checking',
          pix_key: '',
          pix_key_type: undefined,
          is_primary: false,
          is_active: true,
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: BankAccountFormData) => {
      const payload: any = {
        employee: data.employee_id, // Backend espera 'employee', não 'employee_id'
        bank_name: data.bank_name,
        agency: data.agency,
        account_number: data.account_number,
        account_type: data.account_type,
        is_primary: data.is_primary,
        is_active: data.is_active,
      }
      
      // Campos opcionais
      if (data.bank_code && data.bank_code.trim() !== '') {
        payload.bank_code = data.bank_code
      }
      if (data.pix_key && data.pix_key.trim() !== '') {
        payload.pix_key = data.pix_key
      }
      if (data.pix_key_type) {
        payload.pix_key_type = data.pix_key_type
      }
      
      return hrApi.createBankAccount(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'bank-accounts'] })
      toast({
        title: tCommon('success'),
        description: t('createBankAccountSuccess') || 'Bank account created successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      // Tratar erros de validação do Django REST Framework
      let errorMessage = tCommon('errorOccurred')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Se for um objeto de validação (DRF)
        if (typeof errorData === 'object' && !errorData.detail) {
          // Coletar todas as mensagens de erro
          const errorMessages: string[] = []
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`)
            } else if (typeof messages === 'object') {
              errorMessages.push(`${field}: ${JSON.stringify(messages)}`)
            }
          }
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join('; ') 
            : JSON.stringify(errorData)
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BankAccountFormData }) => {
      const payload: any = {
        employee: data.employee_id, // Backend espera 'employee', não 'employee_id'
        bank_name: data.bank_name,
        agency: data.agency,
        account_number: data.account_number,
        account_type: data.account_type,
        is_primary: data.is_primary,
        is_active: data.is_active,
      }
      
      // Campos opcionais
      if (data.bank_code && data.bank_code.trim() !== '') {
        payload.bank_code = data.bank_code
      }
      if (data.pix_key && data.pix_key.trim() !== '') {
        payload.pix_key = data.pix_key
      }
      if (data.pix_key_type) {
        payload.pix_key_type = data.pix_key_type
      }
      
      return hrApi.updateBankAccount(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'bank-accounts'] })
      toast({
        title: tCommon('success'),
        description: t('updateBankAccountSuccess') || 'Bank account updated successfully',
      })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      // Tratar erros de validação do Django REST Framework
      let errorMessage = tCommon('errorOccurred')
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Se for um objeto de validação (DRF)
        if (typeof errorData === 'object' && !errorData.detail) {
          // Coletar todas as mensagens de erro
          const errorMessages: string[] = []
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`)
            } else if (typeof messages === 'object') {
              errorMessages.push(`${field}: ${JSON.stringify(messages)}`)
            }
          }
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join('; ') 
            : JSON.stringify(errorData)
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: tCommon('error'),
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: BankAccountFormData) => {
    if (bankAccount) {
      updateMutation.mutate({ id: bankAccount.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isEditing = !!bankAccount

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editBankAccount') : t('newBankAccount')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('updateBankAccount') : t('createBankAccount')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">
                    {t('bankName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank_name"
                    {...register('bank_name')}
                    placeholder={t('bankNamePlaceholder')}
                    className={errors.bank_name ? 'border-red-500' : ''}
                  />
                  {errors.bank_name && (
                    <p className="text-sm text-red-500">{errors.bank_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_code">{t('bankCode')}</Label>
                  <Input
                    id="bank_code"
                    {...register('bank_code')}
                    placeholder={t('bankCodePlaceholder')}
                    className={errors.bank_code ? 'border-red-500' : ''}
                  />
                  {errors.bank_code && (
                    <p className="text-sm text-red-500">{errors.bank_code.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">
                    {t('agency')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="agency"
                    {...register('agency')}
                    placeholder={t('agencyPlaceholder')}
                    className={errors.agency ? 'border-red-500' : ''}
                  />
                  {errors.agency && (
                    <p className="text-sm text-red-500">{errors.agency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">
                    {t('accountNumber')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="account_number"
                    {...register('account_number')}
                    placeholder={t('accountNumberPlaceholder')}
                    className={errors.account_number ? 'border-red-500' : ''}
                  />
                  {errors.account_number && (
                    <p className="text-sm text-red-500">{errors.account_number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">
                  {t('accountType')} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="account_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="account_type">
                        <SelectValue placeholder={t('selectAccountType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">{t('checking')}</SelectItem>
                        <SelectItem value="savings">{t('savings')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.account_type && (
                  <p className="text-sm text-red-500">{errors.account_type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pix_key">{t('pixKey')}</Label>
                  <Input
                    id="pix_key"
                    {...register('pix_key')}
                    placeholder={t('pixKeyPlaceholder')}
                    className={errors.pix_key ? 'border-red-500' : ''}
                  />
                  {errors.pix_key && (
                    <p className="text-sm text-red-500">{errors.pix_key.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix_key_type">{t('pixKeyType')}</Label>
                  <Controller
                    name="pix_key_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onValueChange={value => field.onChange(value || undefined)}
                      >
                        <SelectTrigger id="pix_key_type">
                          <SelectValue placeholder={t('selectPixKeyType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">{t('email')}</SelectItem>
                          <SelectItem value="phone">{t('phone')}</SelectItem>
                          <SelectItem value="random">{t('random')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Controller
                  name="is_primary"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_primary"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="is_primary" className="cursor-pointer">
                        {t('isPrimary')}
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

