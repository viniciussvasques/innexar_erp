import { toast as showToast } from '@/lib/hooks/use-toast'

export const toast = {
  success: (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'success',
    })
  },
  error: (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'destructive',
    })
  },
  warning: (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'warning',
    })
  },
  info: (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'info',
    })
  },
}

