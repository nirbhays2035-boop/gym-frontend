import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
}

const variants = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  destructive: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
}

export function StatCard({ label, value, icon: Icon, trend, variant = 'default', className }: Props) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl p-5 shadow-xs', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl', variants[variant])}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
