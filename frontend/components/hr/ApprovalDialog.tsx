'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ApprovalDialogProps {
  open: boolean
  onClose: () => void
  type: 'approve' | 'reject'
  title: string
  description?: string
  onConfirm: (reason?: string) => void
  isLoading?: boolean
  requireReason?: boolean
}

export function ApprovalDialog({
  open,
  onClose,
  type,
  title,
  description,
  onConfirm,
  isLoading = false,
  requireReason = false,
}: ApprovalDialogProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (type === 'reject' && requireReason && !reason.trim()) {
      return
    }
    onConfirm(reason || undefined)
    if (type === 'reject') {
      setReason('')
    }
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="small">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'approve' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogBody>
          {type === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                {t('rejectionReason') || 'Rejection Reason'}
                {requireReason && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id="rejection-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t('rejectionReasonPlaceholder') || 'Enter the reason for rejection...'}
                rows={4}
              />
              {requireReason && !reason.trim() && (
                <p className="text-sm text-red-500">
                  {t('rejectionReasonRequired') || 'Rejection reason is required'}
                </p>
              )}
            </div>
          )}
          {type === 'approve' && description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading || (type === 'reject' && requireReason && !reason.trim())}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {type === 'approve'
              ? t('approve') || 'Approve'
              : t('reject') || 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

