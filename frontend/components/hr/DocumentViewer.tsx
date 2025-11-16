'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { EmployeeDocument } from '@/types/api'

interface DocumentViewerProps {
  open: boolean
  onClose: () => void
  document: EmployeeDocument | null
}

export function DocumentViewer({ open, onClose, document }: DocumentViewerProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (!document || !document.file_url) {
    return null
  }

  const fileUrl = document.file_url
  const fileName = document.name || 'document'
  const fileExtension = fileUrl.split('.').pop()?.toLowerCase() || ''
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)
  const isPdf = fileExtension === 'pdf'

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleImageError = () => {
    setError(true)
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
    setError(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="large" className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isPdf ? (
                <FileText className="h-5 w-5" />
              ) : isImage ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {tCommon('download') || 'Download'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative w-full h-[calc(90vh-200px)] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">{t('errorLoadingDocument') || 'Error loading document'}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('errorLoadingDocumentDescription') || 'Unable to preview this document. Please download it to view.'}
              </p>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {tCommon('download') || 'Download'}
              </Button>
            </div>
          ) : isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={() => setLoading(false)}
              onError={handleImageError}
            />
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: loading ? 'none' : 'block' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">{t('previewNotAvailable') || 'Preview not available'}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('previewNotAvailableDescription') || 'This file type cannot be previewed. Please download it to view.'}
              </p>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {tCommon('download') || 'Download'}
              </Button>
            </div>
          )}
        </div>

        {document.description && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{t('description') || 'Description'}:</span> {document.description}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

