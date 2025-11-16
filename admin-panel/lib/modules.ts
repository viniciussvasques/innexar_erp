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
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

type Plan = Module['plans'][number];

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
export function getModulesForPlan(plan: Plan): Module[] {
  return AVAILABLE_MODULES.filter((item) => item.plans.includes(plan) && item.enabled);
}

// Check if module is available for plan
export function isModuleAvailable(moduleId: string, plan: Plan): boolean {
  const foundModule = AVAILABLE_MODULES.find((m) => m.id === moduleId);
  return foundModule ? foundModule.plans.includes(plan) && foundModule.enabled : false;
}

// Get icon component by name
export function getIconComponent(iconName: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
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
