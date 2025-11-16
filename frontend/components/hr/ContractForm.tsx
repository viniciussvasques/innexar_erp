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
import { Contract } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import React from 'react'

const contractSchema = z.object({
  contract_type: z.enum([
    'w2_employee',
    '1099_contractor',
    'clt',
    'pj',
    'llc',
    's_corp',
    'c_corp',
    'partnership',
    'intern',
    'temporary',
  ]),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  contract_data: z.record(z.any()).optional(),
  notes: z.string().optional(),
})

type ContractFormData = z.infer<typeof contractSchema>

interface ContractFormProps {
  open: boolean
  onClose: () => void
  employeeId: number
  contract?: Contract
  onSuccess?: () => void
}

export function ContractForm({
  open,
  onClose,
  employeeId,
  contract,
  onSuccess,
}: ContractFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!contract
  const [isGenerating, setIsGenerating] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract
      ? {
          contract_type: contract.contract_type,
          start_date: contract.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : '',
          end_date: contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
          notes: contract.notes || '',
        }
      : {
          contract_type: 'w2_employee',
          start_date: new Date().toISOString().split('T')[0],
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        contract
          ? {
              contract_type: contract.contract_type,
              start_date: contract.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : '',
              end_date: contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
              notes: contract.notes || '',
            }
          : {
              contract_type: 'w2_employee',
              start_date: new Date().toISOString().split('T')[0],
            }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contract])

  const onSubmit = async (data: ContractFormData) => {
    try {
      if (isEditing && contract) {
        // Update existing contract
        await hrApi.updateContract(contract.id, {
          contract_type: data.contract_type,
          start_date: data.start_date,
          end_date: data.end_date || undefined,
          notes: data.notes || undefined,
        })
        toast({
          title: tCommon('success'),
          description: t('updateSuccess') || 'Contract updated successfully',
        })
      } else {
        // Generate new contract
        setIsGenerating(true)
        const newContract = await hrApi.generateContractForEmployee({
          employee_id: employeeId,
          contract_type: data.contract_type,
          start_date: data.start_date,
          contract_data: data.contract_data,
        })
        toast({
          title: tCommon('success'),
          description: t('contractGenerated') || 'Contract generated successfully',
        })
        // Optionally generate PDF immediately
        if (newContract.id) {
          try {
            await hrApi.generateContractPDF(newContract.id)
            toast({
              title: tCommon('success'),
              description: t('contractPDFGenerated') || 'Contract PDF generated successfully',
            })
          } catch (pdfError: any) {
            // Log error silently - PDF generation is optional
            // In production, use proper logging service instead of console.error
            if (process.env.NODE_ENV === 'development') {
              console.error('Error generating PDF:', pdfError)
            }
          }
        }
      }
      reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!contract) return
    
    try {
      setIsGenerating(true)
      const updatedContract = await hrApi.generateContractPDF(contract.id)
      toast({
        title: tCommon('success'),
        description: t('contractPDFGenerated') || 'Contract PDF generated successfully',
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="medium">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('updateContract') || 'Update Contract'
              : t('generateContract') || 'Generate Contract'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateContractDescription') || 'Update contract information'
              : t('generateContractDescription') || 'Generate a new contract for this employee'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract_type">{t('contractType')}</Label>
            <Controller
              name="contract_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w2_employee">{t('contractTypes.w2_employee')}</SelectItem>
                    <SelectItem value="1099_contractor">{t('contractTypes.1099_contractor')}</SelectItem>
                    <SelectItem value="clt">{t('contractTypes.clt')}</SelectItem>
                    <SelectItem value="pj">{t('contractTypes.pj')}</SelectItem>
                    <SelectItem value="llc">{t('contractTypes.llc')}</SelectItem>
                    <SelectItem value="s_corp">{t('contractTypes.s_corp')}</SelectItem>
                    <SelectItem value="c_corp">{t('contractTypes.c_corp')}</SelectItem>
                    <SelectItem value="partnership">{t('contractTypes.partnership')}</SelectItem>
                    <SelectItem value="intern">{t('contractTypes.intern')}</SelectItem>
                    <SelectItem value="temporary">{t('contractTypes.temporary')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.contract_type && (
              <p className="text-sm text-red-500">{errors.contract_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">{t('startDate') || 'Start Date'}</Label>
            <Input id="start_date" type="date" {...register('start_date')} />
            {errors.start_date && (
              <p className="text-sm text-red-500">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">{t('endDate') || 'End Date (Optional)'}</Label>
            <Input id="end_date" type="date" {...register('end_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes') || 'Notes (Optional)'}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder={t('contractNotesPlaceholder') || 'Additional notes about the contract'}
            />
          </div>

          {isEditing && contract && !contract.pdf_file_url && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {t('contractNoPDF') || 'This contract does not have a PDF yet.'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('generatePDF') || 'Generate PDF'}
              </Button>
            </div>
          )}

          <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isGenerating}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || isGenerating}>
                {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? tCommon('update') : t('generate') || 'Generate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

