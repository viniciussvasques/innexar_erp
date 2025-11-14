export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  tenant: Tenant
}

export interface Tenant {
  id: number
  name: string
  schema_name: string
  plan: 'starter' | 'professional' | 'enterprise'
  is_active: boolean
  trial_ends_on?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
  tenant?: Tenant // Pode vir separado do user
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  schema_name: string
  plan: 'starter' | 'professional' | 'enterprise'
  admin_user: {
    name: string
    email: string
    password: string
  }
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source: 'website' | 'social' | 'referral' | 'ads' | 'cold_call' | 'event' | 'other'
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  notes?: string
  tags: string[]
  owner?: number // ID do usuário
  owner_name?: string
  assigned_to?: User // Mantido para compatibilidade
  created_at: string
  updated_at: string
}

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  mobile?: string
  company?: string
  position?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip_code?: string
  linkedin?: string
  twitter?: string
  notes?: string
  tags?: string | string[]
  is_customer: boolean
  converted_from_lead?: number
  converted_from_lead_name?: string
  owner?: number
  owner_name?: string
  created_at: string
  updated_at?: string
}

export interface Deal {
  id: number
  title: string
  description?: string
  amount: string
  currency: 'USD' | 'BRL' | 'MXN' | 'ARS' | 'CLP' | 'COP'
  probability: number
  expected_revenue?: string
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  contact?: number // ID do contato
  contact_name?: string
  contact_obj?: Contact // Objeto completo (mantido para compatibilidade)
  owner?: number
  owner_name?: string
  expected_close_date?: string
  actual_close_date?: string
  assigned_to?: User // Mantido para compatibilidade
  created_at: string
  updated_at: string
}

export interface Activity {
  id: number
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'whatsapp'
  type?: 'call' | 'email' | 'meeting' | 'task' // Mantido para compatibilidade
  subject: string
  description?: string
  status: 'planned' | 'completed' | 'canceled'
  lead?: number | null
  lead_name?: string | null
  contact?: number | null
  contact_name?: string | null
  deal?: number | null
  deal_title?: string | null
  owner?: number
  owner_name?: string
  scheduled_at?: string
  due_date?: string // Mantido para compatibilidade
  completed?: boolean // Mantido para compatibilidade
  completed_at?: string | null
  assigned_to?: User // Mantido para compatibilidade
  related_to_type?: 'lead' | 'contact' | 'deal' // Mantido para compatibilidade
  related_to_id?: number // Mantido para compatibilidade
  created_at: string
  updated_at?: string
}

export interface Account {
  id: number
  name: string
  type: 'receivable' | 'payable'
  category: Category
  category_id?: number // ID da categoria (para criação)
  description: string
  amount: string
  currency: 'USD' | 'BRL' | 'MXN'
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paid_at?: string
  payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'pix' | 'boleto'
  customer?: Contact
  customer_id?: number // ID do cliente (para criação)
  vendor?: string
  invoice_id?: number
  notes?: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  parent?: Category
  color: string
}

export interface Invoice {
  id: number
  number: string
  customer: Contact
  issue_date: string
  due_date: string
  currency: 'USD' | 'BRL' | 'MXN'
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue'
  items: InvoiceItem[]
  subtotal: string
  discount: string
  tax: string
  total: string
  notes?: string
  payment_link?: string
  nfe_number?: string
  nfe_key?: string
  nfe_xml_url?: string
  nfe_pdf_url?: string
  nfe_status?: 'pending' | 'authorized' | 'denied' | 'cancelled'
  cfdi_uuid?: string
  cfdi_xml_url?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unit_price: string
  discount: string
  tax_rate: number
  total: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description?: string
  category?: string
  unit: 'un' | 'kg' | 'l' | 'm'
  cost_price: string
  sale_price: string
  barcode?: string
  stock: number
  min_stock: number
  max_stock?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface StockMovement {
  id: number
  product: Product
  type: 'in' | 'out'
  quantity: number
  reason: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer'
  reference?: string
  created_at: string
  created_by?: User
}

export interface Project {
  id: number
  name: string
  description?: string
  customer?: Contact
  customer_id?: number
  start_date: string
  end_date?: string
  budget?: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  progress: number
  tasks?: Task[]
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: number
  project: Project
  project_id?: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: User
  assigned_to_id?: number
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  position: number
  dependencies: number[]
  created_at?: string
  updated_at?: string
}

export interface TimeEntry {
  id: number
  task: Task
  task_id?: number
  user: User
  user_id?: number
  hours: number
  description?: string
  date: string
  created_at?: string
}
