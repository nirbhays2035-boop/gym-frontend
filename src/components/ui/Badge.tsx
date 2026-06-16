import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'default' | 'success' | 'destructive' | 'warning' | 'outline'

const variants: Record<Variant, string> = {
  default:     'bg-primary/10 text-primary border-primary/20',
  success:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
  warning:     'bg-amber-50 text-amber-700 border-amber-200',
  outline:     'bg-transparent text-foreground border-border',
}

export function Badge({ children, variant = 'default', className }: {
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
