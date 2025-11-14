'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ProductForm } from '@/components/inventory/ProductForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  AlertTriangle,
  DollarSign,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/lib/api/inventory'
import { Product } from '@/types/api'
import { useToast } from '@/lib/hooks/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'

export default function InventoryPage() {
  const t = useTranslations('inventory')
  const tCommon = useTranslations('common')
  const tUnits = useTranslations('inventory.units')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'products', page, pageSize, debouncedSearch],
    queryFn: () =>
      inventoryApi.getProducts({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      }),
  })

  // Low stock alert
  const { data: lowStockData } = useQuery({
    queryKey: ['inventory', 'low_stock'],
    queryFn: () => inventoryApi.getLowStockProducts(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({
        title: tCommon('success'),
        description: t('deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error.response?.data?.detail || 'Failed to delete product',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id)
    }
  }

  const isLowStock = (product: Product) => {
    return product.stock <= product.min_stock
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: t('sku'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.sku}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: t('category'),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.category || '-'}</span>
      ),
    },
    {
      accessorKey: 'stock',
      header: t('stock'),
      cell: ({ row }) => {
        const product = row.original
        const lowStock = isLowStock(product)
        return (
          <div className="flex items-center gap-2">
            <span className={lowStock ? 'font-medium text-red-600 dark:text-red-400' : ''}>
              {product.stock} {tUnits(product.unit)}
            </span>
            {lowStock && (
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'sale_price',
      header: t('salePrice'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {parseFloat(row.original.sale_price).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: t('isActive'),
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }
        >
          {row.original.is_active ? tCommon('yes') : tCommon('no')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product)
                  setFormOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('description')}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedProduct(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('totalProducts')}
              </CardTitle>
              <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {data?.count || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('lowStock')}
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {lowStockData?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('itemsNeedRestocking')}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('products')}
              </CardTitle>
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {data?.results.filter(p => p.is_active).length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tCommon('active') || 'Active'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={tCommon('search')}
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-muted-foreground">{tCommon('loading')}</p>
              </div>
            ) : data?.results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noProducts')}</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedProduct(null)
                    setFormOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('new')}
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data?.results || []}
                pagination={{
                  page,
                  pageSize,
                  total: data?.count || 0,
                  onPageChange: setPage,
                }}
              />
            )}
          </CardContent>
        </Card>

        <ProductForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct || undefined}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedProduct(null)
          }}
          onConfirm={confirmDelete}
          title={tCommon('delete')}
          description={
            selectedProduct?.name
              ? t('deleteConfirm', { name: selectedProduct.name })
              : t('deleteConfirmGeneric')
          }
          confirmText={tCommon('delete')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}
