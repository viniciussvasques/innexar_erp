export interface User {
  id: number
  email: string
  name?: string // Mantido para compatibilidade
  first_name?: string
  last_name?: string
  role?: 'admin' | 'manager' | 'user'
  tenant?: Tenant
  default_tenant?: Tenant // Campo retornado pela API de auth
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

// HR Module Types
export interface Employee {
  id: number
  user?: User
  user_id?: number
  employee_number: string
  // Dados pessoais
  date_of_birth?: string
  cpf?: string
  ssn?: string
  rg?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  gender_display?: string
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'common_law'
  marital_status_display?: string
  nationality?: string
  photo?: string
  photo_url?: string
  ethnicity?: string
  has_disability?: boolean
  disability_description?: string
  // Endereço
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  // Contatos de emergência
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  // Dados profissionais
  job_position?: JobPosition
  job_position_id?: number
  job_position_name?: string
  job_position_code?: string
  job_title?: string
  department?: Department
  department_id?: number
  department_name?: string // Campo display retornado pela API
  warehouse?: number
  warehouse_id?: number
  supervisor?: Employee
  supervisor_id?: number
  supervisor_name?: string // Campo display retornado pela API
  // Contrato
  contract_type: 'w2_employee' | '1099_contractor' | 'llc' | 's_corp' | 'c_corp' | 'partnership' | 'clt' | 'pj' | 'intern' | 'temporary'
  contract_type_display?: string // Campo display retornado pela API
  hire_type: 'individual' | 'company'
  hire_type_display?: string // Campo display retornado pela API
  company?: Company
  company_id?: number
  company_name?: string // Campo display retornado pela API
  hire_date: string
  termination_date?: string
  probation_period_days?: number
  probation_end_date?: string
  // Jornada de trabalho
  work_shift?: 'morning' | 'afternoon' | 'night' | 'full_time' | 'flexible'
  work_shift_display?: string
  weekly_hours?: string
  work_schedule_start?: string
  work_schedule_end?: string
  days_off?: string
  // Salário
  base_salary: string
  commission_percent?: string
  // Status
  status: 'active' | 'on_leave' | 'terminated' | 'resigned'
  status_display?: string // Campo display retornado pela API
  created_at?: string
  updated_at?: string
}

export interface JobPosition {
  id: number
  code: string
  name: string
  department?: Department
  department_id?: number
  department_name?: string
  level: 'intern' | 'junior' | 'pleno' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c_level'
  level_display?: string
  salary_min?: string
  salary_max?: string
  description?: string
  requirements?: string
  responsibilities?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Department {
  id: number
  name: string
  code?: string
  description?: string
  manager?: Employee
  manager_id?: number
  manager_name?: string // Campo display retornado pela API
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Company {
  id: number
  legal_name: string
  trade_name?: string
  company_type: 'llc' | 's_corp' | 'c_corp' | 'partnership' | 'sole_proprietorship' | 'other'
  company_type_display?: string // Campo display retornado pela API
  ein: string
  address: string
  city: string
  state: string
  zip_code: string
  country?: string
  phone?: string
  email?: string
  website?: string
  owner?: Employee
  owner_id?: number
  owner_name?: string // Campo display retornado pela API
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Payroll {
  id: number
  payroll_number: string
  month: number
  year: number
  employee: Employee
  employee_id?: number
  base_salary: string
  commissions?: string
  overtime?: string
  bonuses?: string
  benefits_value?: string
  total_earnings: string
  inss?: string
  irrf?: string
  fgts?: string
  transportation?: string
  meal_voucher?: string
  loans?: string
  advances?: string
  other_deductions?: string
  total_deductions: string
  net_salary: string
  is_processed: boolean
  processed_at?: string
  created_at?: string
  updated_at?: string
}

export interface TimeRecord {
  id: number
  employee: Employee
  employee_id?: number
  record_type: 'check_in' | 'check_out' | 'lunch_in' | 'lunch_out' | 'overtime_in' | 'overtime_out'
  record_date: string
  record_time: string
  latitude?: string
  longitude?: string
  is_approved: boolean
  approved_by?: User
  approved_by_id?: number
  approved_at?: string
  justification?: string
  created_at?: string
}

export interface Vacation {
  id: number
  employee: Employee
  employee_id?: number
  status: 'requested' | 'approved' | 'rejected' | 'taken' | 'cancelled'
  start_date: string
  end_date: string
  days: number
  acquisition_period_start: string
  acquisition_period_end: string
  sell_days?: number
  cash_allowance?: boolean
  approved_by?: User
  approved_by_id?: number
  approved_at?: string
  rejection_reason?: string
  requested_at?: string
  updated_at?: string
}

export interface Benefit {
  id: number
  name: string
  benefit_type: 'meal_voucher' | 'food_voucher' | 'transportation' | 'health_insurance' | 'dental_insurance' | 'life_insurance' | 'daycare' | 'gympass' | 'other'
  description?: string
  value?: string
  limit?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface EmployeeBenefit {
  id: number
  employee: Employee
  employee_id?: number
  benefit: Benefit
  benefit_id?: number
  value?: string
  start_date: string
  end_date?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface PerformanceReview {
  id: number
  employee: Employee
  employee_id?: number
  reviewer: Employee
  reviewer_id?: number
  review_period_start: string
  review_period_end: string
  review_date: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  criteria_scores?: Record<string, number>
  overall_score?: string
  strengths?: string
  areas_for_improvement?: string
  goals?: string
  development_plan?: string
  created_at?: string
  updated_at?: string
}

export interface Training {
  id: number
  name: string
  description?: string
  training_type?: string
  start_date: string
  end_date: string
  duration_hours?: number
  instructor?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface BankAccount {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  bank_name: string
  bank_code?: string
  agency: string
  account_number: string
  account_type: 'checking' | 'savings'
  account_type_display?: string
  pix_key?: string
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  pix_key_type_display?: string
  is_primary: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Dependent {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  name: string
  date_of_birth: string
  cpf?: string
  ssn?: string
  relationship: 'spouse' | 'son' | 'daughter' | 'father' | 'mother' | 'brother' | 'sister' | 'other'
  relationship_display?: string
  is_tax_dependent: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Education {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  level: 'elementary' | 'middle' | 'high_school' | 'technical' | 'bachelor' | 'specialization' | 'masters' | 'phd' | 'post_phd'
  level_display?: string
  institution: string
  course?: string
  start_date?: string
  end_date?: string
  is_completed: boolean
  graduation_year?: number
  certificate_file?: string
  certificate_file_url?: string
  created_at?: string
  updated_at?: string
}

export interface WorkExperience {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  company_name: string
  job_title: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  responsibilities?: string
  achievements?: string
  reference_name?: string
  reference_phone?: string
  reference_email?: string
  created_at?: string
  updated_at?: string
}

export interface Contract {
  id: number
  contract_number: string
  employee?: Employee
  employee_id?: number
  employee_name?: string
  employee_number?: string
  contract_type: 'w2_employee' | '1099_contractor' | 'clt' | 'pj' | 'llc' | 's_corp' | 'c_corp' | 'partnership' | 'intern' | 'temporary'
  contract_type_display?: string
  start_date: string
  end_date?: string
  signature_date?: string
  pdf_file?: string
  pdf_file_url?: string
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'expired' | 'terminated'
  status_display?: string
  contract_data?: Record<string, any>
  notes?: string
  created_at?: string
  updated_at?: string
  generated_at?: string
}

export interface EmployeeDocument {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  employee_number?: string
  document_type: 'work_permit' | 'id_card' | 'diploma' | 'certificate' | 'contract' | 'other'
  document_type_display?: string
  name: string
  description?: string
  file?: string
  file_url?: string
  expiry_date?: string
  is_expired?: boolean
  days_until_expiry?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface EmployeeTraining {
  id: number
  employee: Employee
  employee_id?: number
  training: Training
  training_id?: number
  status: 'enrolled' | 'completed' | 'failed' | 'cancelled'
  score?: string
  certificate_number?: string
  certificate_file?: string
  certificate_expiry?: string
  enrolled_at?: string
  completed_at?: string
}

export interface JobOpening {
  id: number
  title: string
  department?: Department
  department_id?: number
  warehouse?: number
  warehouse_id?: number
  description?: string
  requirements?: string
  responsibilities?: string
  salary_min?: string
  salary_max?: string
  status: 'open' | 'closed' | 'cancelled'
  posted_date?: string
  closing_date?: string
  created_at?: string
  updated_at?: string
}

export interface Candidate {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  job_opening: JobOpening
  job_opening_id?: number
  resume_file?: string
  cover_letter?: string
  status: 'applied' | 'screening' | 'interview' | 'test' | 'approved' | 'rejected' | 'hired'
  interview_notes?: string
  test_score?: string
  overall_rating?: number
  applied_at?: string
  interview_date?: string
}

export interface EmployeeHistory {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  employee_number?: string
  change_type: 'hired' | 'promotion' | 'transfer' | 'salary_change' | 'status_change' | 'termination' | 'other'
  change_type_display?: string
  old_job_title?: string
  new_job_title?: string
  old_department?: number
  old_department_name?: string
  new_department?: number
  new_department_name?: string
  old_salary?: string
  new_salary?: string
  reason?: string
  notes?: string
  changed_by?: number
  changed_by_name?: string
  effective_date: string
  created_at?: string
}

export interface HRNotification {
  id: number
  employee?: Employee
  employee_id?: number
  employee_name?: string
  employee_number?: string
  notification_type: 'vacation_expiring' | 'vacation_balance_low' | 'document_expiring' | 'time_record_pending' | 'vacation_request' | 'payroll_processed' | 'other'
  notification_type_display?: string
  title: string
  message: string
  is_read: boolean
  read_at?: string
  action_url?: string
  created_at: string
}
