'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Building2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const translations = {
  'pt-BR': {
    title: 'Innexar Admin',
    subtitle: 'Painel Administrativo',
    email: 'Email',
    password: 'Senha',
    login: 'Entrar',
    logging: 'Entrando...',
    error: 'Email ou senha inválidos',
    adminOnly: 'Apenas administradores podem acessar',
  },
  en: {
    title: 'Innexar Admin',
    subtitle: 'Administrative Panel',
    email: 'Email',
    password: 'Password',
    login: 'Sign In',
    logging: 'Signing in...',
    error: 'Invalid email or password',
    adminOnly: 'Admin access only',
  },
  es: {
    title: 'Innexar Admin',
    subtitle: 'Panel Administrativo',
    email: 'Correo',
    password: 'Contraseña',
    login: 'Iniciar sesión',
    logging: 'Iniciando sesión...',
    error: 'Correo o contraseña inválidos',
    adminOnly: 'Solo acceso para administradores',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locale, setLocale] = useState<'pt-BR' | 'en' | 'es'>('pt-BR');

  const t = translations[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Check if user is admin/superuser
      if (!response.user.is_staff && !response.user.is_superuser) {
        setError(t.adminOnly);
        setLoading(false);
        return;
      }

      setAuth(response.user, response.access, response.refresh);
      toast.success(`${t.title} - ${response.user.email}`);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || t.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-lg shadow-black/20">
              <span className="text-2xl font-bold text-white">I</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Innexar ERP</h1>
              <p className="text-brand-100 text-sm">Sistema de Gestão Empresarial</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Gerencie todo seu<br/>negócio em um só lugar
          </h2>
          <p className="text-brand-100 text-lg">
            Painel administrativo completo com módulos integrados para controle total da sua empresa.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Multi-tenant</p>
                <p className="text-brand-100 text-sm">Gestão completa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/20">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Analytics</p>
                <p className="text-brand-100 text-sm">Dados em tempo real</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-brand-200 text-sm">© 2025 Innexar. Todos os direitos reservados.</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Language Selector */}
          <div className="flex justify-end gap-2 mb-8">
            <Button
              variant={locale === 'pt-BR' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocale('pt-BR')}
              className={cn(
                'h-9',
                locale === 'pt-BR' && 'bg-brand-500 hover:bg-brand-600 text-white'
              )}
            >
              🇧🇷 PT
            </Button>
            <Button
              variant={locale === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocale('en')}
              className={cn(
                'h-9',
                locale === 'en' && 'bg-brand-500 hover:bg-brand-600 text-white'
              )}
            >
              🇺🇸 EN
            </Button>
            <Button
              variant={locale === 'es' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocale('es')}
              className={cn(
                'h-9',
                locale === 'es' && 'bg-brand-500 hover:bg-brand-600 text-white'
              )}
            >
              🇪🇸 ES
            </Button>
          </div>

          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">I</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Innexar ERP</h1>
              <p className="text-gray-500 text-sm">Admin Panel</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@innexar.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="h-12 bg-gray-50 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="h-12 bg-gray-50 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/30 transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.logging}
                  </span>
                ) : t.login}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Innexar ERP v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
