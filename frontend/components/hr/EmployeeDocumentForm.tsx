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
import { EmployeeDocument } from '@/types/api'
import { hrApi } from '@/lib/api/hr'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Upload, X } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { useState } from 'react'
import React from 'react'

const documentSchema = z.object({
  document_type: z.enum([
    'work_permit',
    'id_card',
    'diploma',
    'certificate',
    'contract',
    'other',
  ]),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  expiry_date: z.string().optional(),
  is_active: z.boolean().default(true),
  file: z.instanceof(File).optional(),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface EmployeeDocumentFormProps {
  open: boolean
  onClose: () => void
  employeeId: number
  document?: EmployeeDocument
  onSuccess?: () => void
}

export function EmployeeDocumentForm({
  open,
  onClose,
  employeeId,
  document,
  onSuccess,
}: EmployeeDocumentFormProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const isEditing = !!document
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: document
      ? {
          document_type: document.document_type,
          name: document.name,
          description: document.description || '',
          expiry_date: document.expiry_date
            ? new Date(document.expiry_date).toISOString().split('T')[0]
            : '',
          is_active: document.is_active,
        }
      : {
          document_type: 'other',
          name: '',
          description: '',
          expiry_date: '',
          is_active: true,
        },
  })

  React.useEffect(() => {
    if (open) {
      reset(
        document
          ? {
              document_type: document.document_type,
              name: document.name,
              description: document.description || '',
              expiry_date: document.expiry_date
                ? new Date(document.expiry_date).toISOString().split('T')[0]
                : '',
              is_active: document.is_active,
            }
          : {
              document_type: 'other',
              name: '',
              description: '',
              expiry_date: '',
              is_active: true,
            }
      )
      setSelectedFile(null)
      setUploadProgress(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document])

  const onSubmit = async (data: DocumentFormData) => {
    try {
      const formData = new FormData()
      formData.append('employee', employeeId.toString())
      formData.append('document_type', data.document_type)
      formData.append('name', data.name)
      if (data.description) {
        formData.append('description', data.description)
      }
      if (data.expiry_date) {
        formData.append('expiry_date', data.expiry_date)
      }
      formData.append('is_active', data.is_active.toString())

      if (selectedFile) {
        formData.append('file', selectedFile)
      } else if (isEditing && !document?.file) {
        // If editing and no new file selected, we need to keep the existing file
        // The backend should handle this, but we need to ensure file is not required
      }

      if (isEditing && document) {
        await hrApi.updateEmployeeDocument(document.id, formData)
        toast({
          title: tCommon('success'),
          description: t('updateSuccess') || 'Document updated successfully',
        })
      } else {
        if (!selectedFile) {
          toast({
            title: tCommon('error'),
            description: t('fileRequired') || 'File is required',
            variant: 'destructive',
          })
          return
        }
        await hrApi.createEmployeeDocument(formData)
        toast({
          title: tCommon('success'),
          description: t('createSuccess') || 'Document uploaded successfully',
        })
      }
      reset()
      setSelectedFile(null)
      setUploadProgress(0)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.detail || error?.message || tCommon('errorOccurred'),
        variant: 'destructive',
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: tCommon('error'),
          description: t('fileTooLarge') || 'File size must be less than 10MB',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('updateDocument') || 'Update Document' : t('uploadDocument') || 'Upload Document'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('updateDocumentDescription') || 'Update document information'
              : t('uploadDocumentDescription') || 'Upload a new document for this employee'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">{t('documentType') || 'Document Type'}</Label>
                <Controller
                  name="document_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work_permit">
                          {t('documentTypes.work_permit') || 'Work Permit'}
                        </SelectItem>
                        <SelectItem value="id_card">
                          {t('documentTypes.id_card') || 'ID Card'}
                        </SelectItem>
                        <SelectItem value="diploma">
                          {t('documentTypes.diploma') || 'Diploma'}
                        </SelectItem>
                        <SelectItem value="certificate">
                          {t('documentTypes.certificate') || 'Certificate'}
                        </SelectItem>
                        <SelectItem value="contract">
                          {t('documentTypes.contract') || 'Contract'}
                        </SelectItem>
                        <SelectItem value="other">
                          {t('documentTypes.other') || 'Other'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.document_type && (
                  <p className="text-sm text-red-500">{errors.document_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('name') || 'Name'}</Label>
                <Input id="name" {...register('name')} placeholder={t('documentNamePlaceholder') || 'e.g., Passport, Driver License'} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description') || 'Description'}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  placeholder={t('documentDescriptionPlaceholder') || 'Optional description'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">{t('expiryDate') || 'Expiry Date (Optional)'}</Label>
                <Input id="expiry_date" type="date" {...register('expiry_date')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">
                  {t('file') || 'File'} {!isEditing && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedFile.name}</span>
                      <span className="text-xs">({formatFileSize(selectedFile.size)})</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {!isEditing && !selectedFile && (
                  <p className="text-sm text-red-500">{t('fileRequired') || 'File is required'}</p>
                )}
                {isEditing && document?.file_url && !selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {t('currentFile') || 'Current file'}: {document.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? tCommon('update') : t('upload') || 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

