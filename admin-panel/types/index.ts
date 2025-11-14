// Types for API responses and models

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  default_tenant?: Tenant;
  date_joined: string;
  last_login?: string;
}

export interface Tenant {
  id: number;
  name: string;
  schema_name: string;
  plan: 'trial' | 'basic' | 'professional' | 'enterprise';
  is_active: boolean;
  created_on: string;
  domains?: Domain[];
}

export interface Domain {
  id: number;
  domain: string;
  tenant: number | Tenant;
  is_primary: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  plans: ('trial' | 'basic' | 'professional' | 'enterprise')[];
  enabled: boolean;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  score?: number;
  notes?: string;
  owner: number | User;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  type: 'customer' | 'lead' | 'partner' | 'vendor';
  notes?: string;
  owner: number | User;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  title: string;
  contact: number | Contact;
  value?: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability?: number;
  expected_close?: string;
  notes?: string;
  owner: number | User;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  subject: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  description?: string;
  lead?: number | Lead;
  contact?: number | Contact;
  deal?: number | Deal;
  owner: number | User;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_revenue: number;
  mrr: number;
  new_tenants_this_month: number;
  growth_rate: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  tenant?: Tenant;
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
