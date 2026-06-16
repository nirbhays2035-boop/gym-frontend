import type React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Mail, Lock, Dumbbell } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import type { ApiResponse } from '@/types'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})
type FormData = z.infer<typeof schema>

function InputField({
  label, icon: Icon, error, ...props
}: { label: string; icon: React.ElementType; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className={cn(
            'w-full pl-9 pr-3 py-2.5 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring transition-shadow',
            error ? 'border-destructive focus:ring-destructive/30' : 'border-input'
          )}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function LoginPage() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="w-full max-w-md">
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Dumbbell size={18} className="text-primary-foreground" strokeWidth={2} />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">GymOS</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-7">Sign in to your GymOS account</p>

        <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-5">
          <InputField
            label="Email"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <InputField
            label="Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {login.error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              {(login.error as AxiosError<ApiResponse<unknown>>)?.response?.data?.message ?? 'Invalid credentials.'}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          No account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
