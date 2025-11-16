'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'text' | 'date' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  values: Record<string, string | number | undefined>
  onChange: (key: string, value: string | number | undefined) => void
  onClear: () => void
  className?: string
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onClear,
  className,
}: AdvancedFiltersProps) {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)

  const activeFiltersCount = Object.values(values).filter(
    v => v !== undefined && v !== null && v !== ''
  ).length

  const hasActiveFilters = activeFiltersCount > 0

  const handleClear = () => {
    onClear()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('relative', className)}>
          <Filter className="mr-2 h-4 w-4" />
          {t('filters') || 'Filters'}
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{t('advancedFilters') || 'Advanced Filters'}</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                {t('clearAll') || 'Clear all'}
              </Button>
            )}
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {filters.map(filter => {
              const value = values[filter.key]

              return (
                <div key={filter.key} className="space-y-2">
                  <Label className="text-sm">{filter.label}</Label>
                  {filter.type === 'select' && filter.options ? (
                    <Select
                      value={value?.toString() || 'all'}
                      onValueChange={val => {
                        onChange(filter.key, val === 'all' ? undefined : val)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder || t('selectOption') || 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all') || 'All'}</SelectItem>
                        {filter.options.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter.type === 'text' ? (
                    <Input
                      value={value?.toString() || ''}
                      onChange={e => onChange(filter.key, e.target.value || undefined)}
                      placeholder={filter.placeholder}
                    />
                  ) : filter.type === 'date' ? (
                    <Input
                      type="date"
                      value={value?.toString() || ''}
                      onChange={e => onChange(filter.key, e.target.value || undefined)}
                    />
                  ) : filter.type === 'number' ? (
                    <Input
                      type="number"
                      value={value?.toString() || ''}
                      onChange={e => onChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
                      placeholder={filter.placeholder}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {Object.entries(values).map(([key, value]) => {
                if (!value || value === '') return null
                const filter = filters.find(f => f.key === key)
                if (!filter) return null

                const displayValue =
                  filter.type === 'select'
                    ? filter.options?.find(opt => opt.value === value.toString())?.label || value
                    : value

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs">
                      {filter.label}: {displayValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => onChange(key, undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

