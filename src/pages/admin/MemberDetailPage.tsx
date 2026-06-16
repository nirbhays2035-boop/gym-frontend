import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, XCircle, CreditCard, Calendar } from 'lucide-react'
import { useMember, useAssignPlan } from '@/hooks/useMembers'
import { usePlans } from '@/hooks/usePlans'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import type { Subscription } from '@/types'

const subStatusIcon = {
  active:    <CheckCircle2 size={14} className="text-emerald-500" />,
  expired:   <XCircle size={14} className="text-red-400" />,
  cancelled: <XCircle size={14} className="text-red-400" />,
  pending:   <Clock size={14} className="text-amber-400" />,
}

const subStatusBadge = {
  active: 'success', expired: 'destructive', cancelled: 'destructive', pending: 'warning',
} as const

function SubscriptionRow({ sub }: { sub: Subscription }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-3">
        {subStatusIcon[sub.status]}
        <div>
          <p className="text-sm font-medium text-foreground">{sub.plan.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(sub.start_date).toLocaleDateString('en-IN')} →{' '}
            {new Date(sub.end_date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">
          ₹{Number(sub.plan.price).toLocaleString('en-IN')}
        </span>
        <Badge variant={subStatusBadge[sub.status]}>
          {sub.status === 'active' && sub.days_remaining <= 7
            ? `Expires in ${sub.days_remaining}d`
            : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)
          }
        </Badge>
      </div>
    </div>
  )
}

export default function MemberDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState('')

  const { data: member, isLoading } = useMember(id!)
  const { data: plans = [] }        = usePlans({ gym: member?.gym })
  const assignPlan = useAssignPlan(id!)

  const handleAssign = () => {
    if (!selectedPlanId) return
    assignPlan.mutate(selectedPlanId, { onSuccess: () => { setAssignOpen(false); setSelectedPlanId('') } })
  }

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
      <div className="h-48 bg-muted rounded-2xl animate-pulse" />
    </div>
  )
  if (!member) return <div className="text-muted-foreground text-center py-24">Member not found.</div>

  const activeSub = member.active_subscription

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title={member.user.full_name}
        description={`${member.member_code} · ${member.gym_name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={member.is_active ? 'success' : 'destructive'}>
              {member.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <button
              onClick={() => setAssignOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <CreditCard size={15} /> Assign Plan
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile info */}
        <div className="space-y-4">
          {/* Avatar + basic */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-border mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                {member.profile_pic_url
                  ? <img src={member.profile_pic_url} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                  : <span className="text-2xl font-bold text-primary">
                      {member.user.full_name.charAt(0).toUpperCase()}
                    </span>
                }
              </div>
              <div>
                <p className="font-semibold text-foreground">{member.user.full_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{member.user.email}</p>
                {member.user.phone && (
                  <p className="text-xs text-muted-foreground">{member.user.phone}</p>
                )}
              </div>
            </div>
            {[
              { label: 'Member Since', value: new Date(member.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Gender', value: { M: 'Male', F: 'Female', O: 'Other', N: 'Prefer not to say', '': '—' }[member.gender || ''] },
              { label: 'Date of Birth', value: member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-IN') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Emergency contact */}
          {(member.emergency_contact_name || member.emergency_contact_phone) && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Emergency Contact</p>
              <p className="text-sm font-medium text-foreground">{member.emergency_contact_name}</p>
              <p className="text-xs text-muted-foreground">{member.emergency_contact_phone}</p>
            </div>
          )}

          {/* Notes */}
          {member.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Admin Notes</p>
              <p className="text-sm text-amber-900">{member.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Subscription + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active subscription */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Current Subscription
            </p>
            {activeSub ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{activeSub.plan.name}</p>
                    <p className="text-sm text-muted-foreground">₹{Number(activeSub.plan.price).toLocaleString('en-IN')} · {activeSub.plan.duration_label}</p>
                  </div>
                  {activeSub.is_expiring_soon
                    ? <Badge variant="warning">Expires in {activeSub.days_remaining}d</Badge>
                    : <Badge variant="success">Active</Badge>
                  }
                </div>
                <div className="flex gap-6 pt-3 border-t border-border">
                  {[
                    { icon: Calendar, label: 'Start', value: new Date(activeSub.start_date).toLocaleDateString('en-IN') },
                    { icon: Calendar, label: 'End',   value: new Date(activeSub.end_date).toLocaleDateString('en-IN') },
                    { icon: Clock,    label: 'Days left', value: `${activeSub.days_remaining} days` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium text-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No active plan</p>
                <button
                  onClick={() => setAssignOpen(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Assign a plan →
                </button>
              </div>
            )}
          </div>

          {/* Subscription history */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Subscription History
            </p>
            {member.subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No subscriptions yet.</p>
            ) : (
              <div className="space-y-2">
                {member.subscriptions.map(sub => (
                  <SubscriptionRow key={sub.id} sub={sub} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Plan Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Plan" description={`Assign a membership plan to ${member.user.full_name}`} size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            {plans.filter(p => p.is_active).map(plan => (
              <label
                key={plan.id}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  selectedPlanId === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.duration_label}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  ₹{Number(plan.price).toLocaleString('en-IN')}
                </span>
              </label>
            ))}
          </div>

          {assignPlan.error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {(assignPlan.error as any)?.response?.data?.message ?? 'Failed to assign plan.'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAssignOpen(false)}
              className="px-4 py-2.5 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedPlanId || assignPlan.isPending}
              className="px-4 py-2.5 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {assignPlan.isPending ? 'Assigning…' : 'Assign Plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
