import { useState } from 'react'
import { Plus, CreditCard, Star, Users, PencilLine, PowerOff, ChevronDown } from 'lucide-react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeactivatePlan } from '@/hooks/usePlans'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PlanForm } from '@/features/plans/PlanForm'
import { useAuthStore } from '@/store/authStore'
import { useGyms } from '@/hooks/useGyms'
import type { MembershipPlan } from '@/types'

function PlanCard({ plan, onEdit, onDeactivate }: {
  plan: MembershipPlan
  onEdit: () => void
  onDeactivate: () => void
}) {
  return (
    <div className={`relative bg-card border rounded-2xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-md ${plan.is_featured ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border'
      }`}>
      {plan.is_featured && (
        <div className="absolute -top-3 left-4">
          <span className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            <Star size={11} fill="currentColor" /> Featured
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.gym_name}</p>
        </div>
        <Badge variant={plan.is_active ? 'success' : 'destructive'}>
          {plan.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-foreground">₹{Number(plan.price).toLocaleString('en-IN')}</span>
        <span className="text-sm text-muted-foreground mb-1">/ {plan.duration_label}</span>
      </div>

      {/* Features */}
      {plan.features.length > 0 && (
        <ul className="space-y-1.5">
          {plan.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={13} />
          <span className="font-medium text-foreground">{plan.subscriber_count}</span> active members
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <PencilLine size={15} />
          </button>
          <button
            onClick={onDeactivate}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Deactivate"
          >
            <PowerOff size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<MembershipPlan | null>(null)
  const [selectedGym, setSelectedGym] = useState('')

  const { data: gyms = [] } = useGyms()
  const { data: plans = [], isLoading } = usePlans({ gym: selectedGym || undefined })
  const createPlan = useCreatePlan()
  const deactivatePlan = useDeactivatePlan()

  // For admin, auto-pick their gym
  const gymId = user?.role === 'admin'
    ? gyms[0]?.id ?? ''
    : selectedGym || (gyms[0]?.id ?? '')

  const updatePlan = useUpdatePlan(editPlan?.id ?? '')

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        description={`${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Add Plan
          </button>
        }
      />

      {/* Gym filter (super admin only) */}
      {user?.role === 'super_admin' && gyms.length > 1 && (
        <div className="relative w-56 mb-6">
          <select
            value={selectedGym}
            onChange={e => setSelectedGym(e.target.value)}
            className="w-full appearance-none border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
          >
            <option value="">All Gyms</option>
            {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <CreditCard size={40} className="text-muted-foreground/40 mb-4" />
          <p className="font-medium text-foreground mb-1">No plans yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first membership plan.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Add Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditPlan(plan)}
              onDeactivate={() => deactivatePlan.mutate(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Membership Plan" size="md">
        <PlanForm
          gymId={gymId}
          onSubmit={(data) => createPlan.mutate(data, { onSuccess: () => setCreateOpen(false) })}
          isLoading={createPlan.isPending}
          submitLabel="Create Plan"
        />
      </Modal>

      {/* Edit */}
      <Modal open={!!editPlan} onClose={() => setEditPlan(null)} title="Edit Plan" size="md">
        {editPlan && (
          <PlanForm
            gymId={editPlan.gym}
            defaultValues={editPlan}
            onSubmit={(data) => updatePlan.mutate(data, { onSuccess: () => setEditPlan(null) })}
            isLoading={updatePlan.isPending}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  )
}
