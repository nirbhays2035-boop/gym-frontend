import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock, CreditCard, Headphones, UserRound } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMyAttendance, useMyPayments } from '@/hooks/usePayments'
import { useMyProfile } from '@/hooks/useMembers'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'

export default function MemberDashboard() {
  const { user } = useAuthStore()
  const { data: profile } = useMyProfile()
  const { data: payments = [] } = useMyPayments()
  const { data: attendance = [] } = useMyAttendance()
  const now = new Date()
  const visitsThisMonth = attendance.filter(({ check_in }) => {
    const date = new Date(check_in)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Member overview</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
          Welcome back, {user?.full_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {profile?.gym_name ? `Here is what is happening at ${profile.gym_name}.` : 'Here is your latest gym activity.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Visits This Month" value={visitsThisMonth} icon={CalendarCheck} variant="success" trend="Based on check-in logs" />
        <StatCard label="Total Payments" value={payments.length} icon={CreditCard} trend={`${payments.filter(p => p.status === 'captured').length} successful`} />
        <StatCard
          label="Last Visit"
          value={attendance[0] ? new Date(attendance[0].check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/member/plans', label: 'Browse Plans', description: 'Upgrade or renew your membership', icon: CreditCard },
          { to: '/member/card', label: 'Membership Card', description: 'Open your QR check-in card', icon: UserRound },
          { to: '/member/tickets', label: 'Get Support', description: 'Raise a query with your gym', icon: Headphones },
        ].map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to} className="group bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Icon size={18} className="text-primary" />
            </div>
            <p className="font-semibold text-foreground text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Visits</p>
          {profile?.active_subscription && <Badge variant="success">{profile.active_subscription.plan.name}</Badge>}
        </div>
        {attendance.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground mt-3">No visits recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your latest check-ins will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {attendance.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.gym_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.check_in).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{log.logged_by === 'qr' ? 'QR Scan' : 'Manual'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
