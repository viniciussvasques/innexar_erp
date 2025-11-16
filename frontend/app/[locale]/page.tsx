'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { LogIn, Mail, Lock, Sparkles, TrendingUp, Users, DollarSign, Zap } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

export default function HomePage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tHome = useTranslations('home')
  const router = useRouter()
  const setAuth = useAuthStore(state => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authApi.login(data)
      // Debug: Log the full response to see what we're getting
      if (process.env.NODE_ENV === 'development') {
        console.log('[Login] Full response:', response)
        console.log('[Login] User object:', response.user)
        console.log('[Login] default_tenant:', response.user?.default_tenant)
        console.log('[Login] tenant (from response):', response.tenant)
      }
      // Pass tenant from response as fallback
      setAuth(response.user, response.access, response.refresh, response.tenant)
      router.push('/dashboard')
    } catch (err: any) {
      // Tratamento de erros mais detalhado
      if (err.response?.status === 401) {
        setError(t('invalidCredentials'))
      } else if (err.response?.status === 429) {
        setError(t('tooManyAttempts') || 'Too many login attempts. Please try again later.')
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0])
      } else if (err.message === 'Network Error') {
        setError(t('networkError') || 'Network error. Please check your connection.')
      } else {
        setError(t('loginFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 text-white">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl xl:text-6xl font-bold">{tHome('title')}</h1>
            </div>
            <p className="text-2xl xl:text-3xl text-white/90 mb-12 font-light">
              {tHome('subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl xl:text-2xl font-semibold mb-2">
                  {tHome('features.completeManagement.title')}
                </h3>
                <p className="text-white/80 text-base xl:text-lg leading-relaxed">
                  {tHome('features.completeManagement.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl xl:text-2xl font-semibold mb-2">
                  {tHome('features.multiTenant.title')}
                </h3>
                <p className="text-white/80 text-base xl:text-lg leading-relaxed">
                  {tHome('features.multiTenant.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl xl:text-2xl font-semibold mb-2">
                  {tHome('features.international.title')}
                </h3>
                <p className="text-white/80 text-base xl:text-lg leading-relaxed">
                  {tHome('features.international.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl xl:text-2xl font-semibold mb-2">
                  {tHome('features.cloudBased.title')}
                </h3>
                <p className="text-white/80 text-base xl:text-lg leading-relaxed">
                  {tHome('features.cloudBased.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">{tHome('version')}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 xl:w-3/5 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-lg xl:max-w-xl">
          <Card className="border-2 shadow-2xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <LogIn className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-4xl xl:text-5xl font-bold">{t('loginTitle')}</CardTitle>
              <CardDescription className="text-lg xl:text-xl mt-2">
                {t('loginDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    {t('email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('enterEmail')}
                    className="h-14 text-base"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive animate-in fade-in">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="password"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    {t('password')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('enterPassword')}
                    className="h-14 text-base"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive animate-in fade-in">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-muted-foreground">{t('rememberMe')}</span>
                  </label>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                    onClick={e => {
                      e.preventDefault()
                    }}
                  >
                    {t('forgotPassword')}
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {tCommon('loading')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      {t('login')}
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('noAccount')}</span>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href="https://innexar.app/register"
                    className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('registerOnSite')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>{tHome('copyright')}</p>
            <p className="mt-1">{tHome('version')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
