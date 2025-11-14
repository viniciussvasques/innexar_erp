import { Module } from '@/types';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  Package, 
  BarChart3,
  Settings,
  UserCircle,
  Mail,
  Calendar,
  ShoppingCart
} from 'lucide-react';

// Define all available modules with their plans
export const AVAILABLE_MODULES: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Visão geral e métricas do sistema',
    icon: 'LayoutDashboard',
    plans: ['trial', 'basic', 'professional', 'enterprise'],
    enabled: true,
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Gestão de leads, contatos e negócios',
    icon: 'UserCircle',
    plans: ['professional', 'enterprise'],
    enabled: true,
  },
  {
    id: 'invoices',
    name: 'Faturamento',
    description: 'Emissão e gestão de faturas',
    icon: 'FileText',
    plans: ['basic', 'professional', 'enterprise'],
    enabled: true,
  },
  {
    id: 'customers',
    name: 'Clientes',
    description: 'Cadastro e gestão de clientes',
    icon: 'Users',
    plans: ['trial', 'basic', 'professional', 'enterprise'],
    enabled: true,
  },
  {
    id: 'subscriptions',
    name: 'Assinaturas',
    description: 'Gestão de planos e cobranças recorrentes',
    icon: 'CreditCard',
    plans: ['professional', 'enterprise'],
    enabled: true,
  },
  {
    id: 'inventory',
    name: 'Estoque',
    description: 'Controle de produtos e estoque',
    icon: 'Package',
    plans: ['professional', 'enterprise'],
    enabled: false, // Not implemented yet
  },
  {
    id: 'projects',
    name: 'Projetos',
    description: 'Gestão de projetos e tarefas',
    icon: 'BarChart3',
    plans: ['professional', 'enterprise'],
    enabled: false, // Not implemented yet
  },
  {
    id: 'email',
    name: 'Email Marketing',
    description: 'Campanhas e automações de email',
    icon: 'Mail',
    plans: ['enterprise'],
    enabled: false, // Not implemented yet
  },
  {
    id: 'calendar',
    name: 'Agenda',
    description: 'Calendário e agendamentos',
    icon: 'Calendar',
    plans: ['professional', 'enterprise'],
    enabled: false, // Not implemented yet
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Loja virtual integrada',
    icon: 'ShoppingCart',
    plans: ['enterprise'],
    enabled: false, // Not implemented yet
  },
];

// Get modules available for a specific plan
export function getModulesForPlan(plan: string): Module[] {
  return AVAILABLE_MODULES.filter(module => 
    module.plans.includes(plan as any) && module.enabled
  );
}

// Check if module is available for plan
export function isModuleAvailable(moduleId: string, plan: string): boolean {
  const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
  return module ? module.plans.includes(plan as any) && module.enabled : false;
}

// Get icon component by name
export function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    CreditCard,
    Package,
    BarChart3,
    Settings,
    UserCircle,
    Mail,
    Calendar,
    ShoppingCart,
  };
  return icons[iconName] || LayoutDashboard;
}

// Plan details
export const PLAN_DETAILS = {
  trial: {
    name: 'Trial',
    color: 'bg-gray-500',
    description: '14 dias grátis',
    price: 0,
  },
  basic: {
    name: 'Basic',
    color: 'bg-blue-500',
    description: 'Plano básico',
    price: 99,
  },
  professional: {
    name: 'Professional',
    color: 'bg-purple-500',
    description: 'Plano profissional',
    price: 299,
  },
  enterprise: {
    name: 'Enterprise',
    color: 'bg-orange-500',
    description: 'Plano empresarial',
    price: 999,
  },
};
