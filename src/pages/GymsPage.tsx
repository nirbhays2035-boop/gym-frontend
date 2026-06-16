import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Building2, Users, Image,
  MoreVertical, PencilLine, PowerOff, Eye,
} from 'lucide-react'
import { useGyms, useCreateGym, useDeactivateGym } from '@/hooks/useGyms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { GymForm, type GymFormData } from '@/features/gyms/GymForm'
import { cn } from '@/utils/cn'
import type { GymListItem } from '@/api/gyms'

function GymCard({ gym, onEdit, onDeactivate, onView }: {
  gym: GymListItem
  onEdit: () => void
  onDeactivate: () => void
  onView: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-36 bg-muted relative overflow-hidden">
        {gym.cover_image ? (
          <img src={gym.cover_image} alt={gym.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={36} className="text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={gym.is_active ? 'success' : 'destructive'}>
            {gym.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              type="button"
              aria-label="Gym actions"
              aria-haspopup="menu"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
              className="p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <MoreVertical size={15} aria-hidden="true" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  {[
                    { icon: Eye,       label: 'View details', action: onView },
                    { icon: PencilLine, label: 'Edit gym',    action: onEdit },
                    { icon: PowerOff,  label: gym.is_active ? 'Deactivate' : 'Activate', action: onDeactivate, danger: true },
                  ].map(({ icon: Icon, label, action, danger }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { action(); setMenuOpen(false) }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left',
                        danger
                          ? 'text-destructive hover:bg-destructive/10'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          {gym.logo_url ? (
            <img src={gym.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{gym.name}</h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {[gym.city, gym.state].filter(Boolean).join(', ') || 'Location not set'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 pt-4 border-t border-border">
          {[
            { icon: Users, count: gym.staff_count, label: 'Staff' },
            { icon: Image, count: gym.image_count, label: 'Photos' },
          ].map(({ icon: Icon, count, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon size={13} />
              <span className="font-medium text-foreground">{count}</span> {label}
            </div>
          ))}
          {gym.phone && (
            <p className="ml-auto text-xs text-muted-foreground truncate">{gym.phone}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GymsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editGym, setEditGym] = useState<GymListItem | null>(null)

  const { data: gyms = [], isLoading } = useGyms({ search })
  const createGym = useCreateGym()
  const deactivateGym = useDeactivateGym()

  const handleCreate = (data: GymFormData) => {
    createGym.mutate(data, { onSuccess: () => setCreateOpen(false) })
  }

  return (
    <div>
      <PageHeader
        title="Gyms"
        description={`${gyms.length} gym${gyms.length !== 1 ? 's' : ''} registered`}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} aria-hidden="true" /> Add Gym
          </button>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search gyms…"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-36 bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : gyms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <Building2 size={40} className="text-muted-foreground/40 mb-4" />
          <p className="text-foreground font-medium mb-1">No gyms yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first gym to get started.</p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} aria-hidden="true" /> Add Gym
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gyms.map(gym => (
            <GymCard
              key={gym.id}
              gym={gym}
              onView={() => navigate(`/super-admin/gyms/${gym.id}`)}
              onEdit={() => setEditGym(gym)}
              onDeactivate={() => deactivateGym.mutate(gym.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Gym"
        description="Fill in the details to register a new gym."
        size="lg"
      >
        <GymForm
          onSubmit={handleCreate}
          isLoading={createGym.isPending}
          submitLabel="Create Gym"
        />
      </Modal>

      <Modal
        open={!!editGym}
        onClose={() => setEditGym(null)}
        title="Edit Gym"
        description={editGym?.name}
        size="lg"
      >
        {editGym && (
          <GymForm
            defaultValues={editGym}
            onSubmit={() => {
              navigate(`/super-admin/gyms/${editGym.id}`)
              setEditGym(null)
            }}
            submitLabel="Go to Full Edit"
          />
        )}
      </Modal>
    </div>
  )
}
