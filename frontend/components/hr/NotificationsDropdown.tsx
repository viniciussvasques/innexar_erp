'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/authStore'
import { hrApi } from '@/lib/api/hr'
import { HRNotification } from '@/types/api'
import { format } from 'date-fns'
import { useRouter } from '@/lib/i18n/navigation'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'

function useTenantSchemaReady() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false)
      return
    }
    const schema = globalThis.window?.localStorage.getItem('tenant_schema')
    if (schema) {
      setReady(true)
      return
    }
    let attempts = 0
    const id = setInterval(() => {
      const s = globalThis.window?.localStorage.getItem('tenant_schema')
      if (s) {
        setReady(true)
        clearInterval(id)
      } else if (++attempts > 10) {
        clearInterval(id)
      }
    }, 300)
    return () => clearInterval(id)
  }, [isAuthenticated])
  return ready
}

export function NotificationsDropdown() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const tenantReady = useTenantSchemaReady()

  // Buscar notificações não lidas
  useQuery({
    queryKey: ['hr', 'notifications', 'unread'],
    queryFn: () => hrApi.getNotifications({ is_read: false, page_size: 10 }),
    refetchInterval: 30000,
    enabled: tenantReady,
  })

  // Buscar contagem de não lidas
  const { data: unreadCount } = useQuery({
    queryKey: ['hr', 'notifications', 'unread-count'],
    queryFn: () => hrApi.getUnreadNotificationsCount(),
    refetchInterval: 30000,
    enabled: tenantReady,
  })

  // Buscar todas as notificações recentes
  const { data: allNotifications } = useQuery({
    queryKey: ['hr', 'notifications', 'all'],
    queryFn: () => hrApi.getNotifications({ page_size: 20 }),
    enabled: open && tenantReady,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => hrApi.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => hrApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'notifications'] })
      toast({
        title: tCommon('success'),
        description: t('allNotificationsMarkedAsRead') || 'All notifications marked as read',
      })
    },
  })

  const handleNotificationClick = (notification: HRNotification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }

    if (notification.action_url) {
      router.push(notification.action_url)
      setOpen(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vacation_expiring':
      case 'vacation_request':
        return '🏖️'
      case 'document_expiring':
        return '📄'
      case 'time_record_pending':
        return '⏰'
      case 'payroll_processed':
        return '💰'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vacation_expiring':
      case 'document_expiring':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'time_record_pending':
      case 'vacation_request':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'payroll_processed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const unreadCountNumber = tenantReady ? (unreadCount?.count || 0) : 0
  const notifications = allNotifications?.results || []
  const hasUnread = unreadCountNumber > 0

  // Estado de carregamento inicial enquanto tenant schema não disponível
  if (!tenantReady) {
    return (
      <Button variant="ghost" size="icon" className="relative h-9 w-9" disabled>
        <Bell className="h-5 w-5 opacity-50" />
        <span className="sr-only">{t('notifications') || 'Notifications'}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
          {unreadCountNumber > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCountNumber > 9 ? '9+' : unreadCountNumber}
            </Badge>
          )}
          <span className="sr-only">{t('notifications') || 'Notifications'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-base font-semibold">
            {t('notifications') || 'Notifications'}
          </DropdownMenuLabel>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              {t('markAllAsRead') || 'Mark all as read'}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="space-y-1 p-1">
              {notifications.map(notification => (
                <button
                  type="button"
                  key={notification.id}
                  className={cn(
                    'relative text-left w-full rounded-lg p-3 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                    !notification.is_read && 'bg-blue-50/50 dark:bg-blue-900/10'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleNotificationClick(notification)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 text-lg">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            !notification.is_read && 'font-semibold'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'PPp')}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getNotificationColor(notification.notification_type))}
                        >
                          {notification.notification_type_display || notification.notification_type}
                        </Badge>
                      </div>
                      {notification.action_url && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <ExternalLink className="h-3 w-3" />
                          <span>{t('viewDetails') || 'View details'}</span>
                        </div>
                      )}
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={e => {
                          e.stopPropagation()
                          markAsReadMutation.mutate(notification.id)
                        }}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t('noNotifications') || 'No notifications'}
              </p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={() => {
                  router.push('/hr')
                  setOpen(false)
                }}
              >
                {t('viewAllNotifications') || 'View all notifications'}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

