import apiClient from './client'
import { Product, StockMovement, PaginatedResponse } from '@/types/api'

export interface LowStockProduct {
  product: Product
  current_stock: number
  min_stock: number
  suggested_order: number
}

export const inventoryApi = {
  // Products
  getProducts: async (params?: {
    page?: number
    page_size?: number
    search?: string
    category?: string
    is_active?: boolean
    low_stock?: boolean
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/v1/inventory/products/', {
      params,
    })
    return response.data
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/v1/inventory/products/${id}/`)
    return response.data
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post<Product>('/api/v1/inventory/products/', data)
    return response.data
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/api/v1/inventory/products/${id}/`, data)
    return response.data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/inventory/products/${id}/`)
  },

  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    const response = await apiClient.get<LowStockProduct[]>('/api/v1/inventory/products/low_stock/')
    return response.data
  },

  // Stock Movements
  getStockMovements: async (params?: {
    page?: number
    page_size?: number
    product_id?: number
    type?: 'in' | 'out'
    reason?: string
  }): Promise<PaginatedResponse<StockMovement>> => {
    const response = await apiClient.get<PaginatedResponse<StockMovement>>(
      '/api/v1/inventory/movements/',
      { params }
    )
    return response.data
  },

  createStockMovement: async (data: {
    product_id: number
    type: 'in' | 'out'
    quantity: number
    reason: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer'
    reference?: string
  }): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/api/v1/inventory/movements/', data)
    return response.data
  },
}


