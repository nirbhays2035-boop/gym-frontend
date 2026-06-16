import { CheckCircle2, Clock, Receipt, XCircle } from 'lucide-react'
import { useMyPayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

const statusConfig = {
  captured: { icon: CheckCircle2, color: 'text-emerald-500', badge: 'success' as const, label: 'Paid' },
  failed: { icon: XCircle, color: 'text-red-500', badge: 'destructive' as const, label: 'Failed' },
  created: { icon: Clock, color: 'text-amber-500', badge: 'warning' as const, label: 'Pending' },
  refunded: { icon: Receipt, color: 'text-blue-500', badge: 'outline' as const, label: 'Refunded' },
}

export default function PaymentHistoryPage() {
  const { data: payments = [], isLoading } = useMyPayments()
  return (
    <div>
      <PageHeader title="Payment History" description={`${payments.length} transaction${payments.length === 1 ? '' : 's'}`} />
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <Receipt size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No payments yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your transactions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => {
            const config = statusConfig[payment.status]
            const Icon = config.icon
            return (
              <div key={payment.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-muted shrink-0"><Icon size={20} className={config.color} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-semibold text-foreground text-sm">{payment.plan_name ?? 'Membership payment'}</p><Badge variant={config.badge}>{config.label}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-1">{payment.invoice_number} · {new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0"><p className="font-bold text-foreground">₹{Number(payment.amount).toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground mt-0.5">{payment.currency}</p></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
