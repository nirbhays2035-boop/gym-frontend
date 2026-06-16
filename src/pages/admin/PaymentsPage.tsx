import { CheckCircle2, IndianRupee, XCircle } from 'lucide-react'
import { useAllPayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import type { Payment } from '@/api/payments'

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = useAllPayments()
  const captured = payments.filter(payment => payment.status === 'captured')
  const total = captured.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const columns = [
    { key: 'invoice', header: 'Invoice', render: (payment: Payment) => <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">{payment.invoice_number}</span> },
    { key: 'member', header: 'Member', render: (payment: Payment) => <span className="text-sm font-medium">{payment.member_name}</span> },
    { key: 'plan', header: 'Plan', render: (payment: Payment) => <span className="text-sm">{payment.plan_name ?? '-'}</span> },
    { key: 'amount', header: 'Amount', render: (payment: Payment) => <span className="text-sm font-semibold">₹{Number(payment.amount).toLocaleString('en-IN')}</span> },
    { key: 'status', header: 'Status', render: (payment: Payment) => {
      const map = { captured: ['success', 'Paid'], failed: ['destructive', 'Failed'], created: ['warning', 'Pending'], refunded: ['outline', 'Refunded'] } as const
      const [variant, label] = map[payment.status]
      return <Badge variant={variant}>{label}</Badge>
    } },
    { key: 'date', header: 'Date', render: (payment: Payment) => <span className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
  ]

  return (
    <div>
      <PageHeader title="Payments" description="All member transactions for your gyms." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${total.toLocaleString('en-IN')}`} icon={IndianRupee} variant="success" trend={`${captured.length} successful payments`} />
        <StatCard label="Successful" value={captured.length} icon={CheckCircle2} variant="success" />
        <StatCard label="Failed / Pending" value={payments.length - captured.length} icon={XCircle} variant="destructive" />
      </div>
      <DataTable columns={columns} data={payments} loading={isLoading} emptyMessage="No transactions yet." />
    </div>
  )
}
