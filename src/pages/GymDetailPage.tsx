import { useState, type ElementType } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { useGym, useUpdateGym } from '@/hooks/useGyms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { GymForm, type GymFormData } from '@/features/gyms/GymForm'
import { StaffPanel } from '@/features/gyms/StaffPanel'

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-2 rounded-lg bg-muted">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = useState(false)
  const tab = (searchParams.get('tab') as 'info' | 'staff') || 'info'
  const setTab = (newTab: 'info' | 'staff') => setSearchParams({ tab: newTab })

  const { data: gym, isLoading } = useGym(id!)
  const updateGym = useUpdateGym(id!)

  const handleUpdate = (data: GymFormData) => {
    updateGym.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="text-center py-24 text-muted-foreground">Gym not found.</div>
    )
  }

  const TABS = [
    { key: 'info' as const, label: 'Info & Details' },
    { key: 'staff' as const, label: `Staff (${gym.staff_count})` },
  ]

  return (
    <div>
      <button
        onClick={() => navigate('/super-admin/gyms')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Gyms
      </button>

      <PageHeader
        title={gym.name}
        description={[gym.city, gym.state].filter(Boolean).join(', ')}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={gym.is_active ? 'success' : 'destructive'}>
              {gym.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <button
              onClick={() => setEditOpen(true)}
              className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Edit Gym
            </button>
          </div>
        }
      />

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Contact</p>
              <div className="space-y-4">
                <InfoRow icon={Phone} label="Phone" value={gym.phone} />
                <InfoRow icon={Mail} label="Email" value={gym.email} />
                <InfoRow icon={Globe} label="Website" value={gym.website} />
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Location</p>
              <div className="space-y-4">
                <InfoRow icon={MapPin} label="Address" value={gym.address} />
                <InfoRow icon={Building2} label="City / State"
                  value={[gym.city, gym.state, gym.pincode].filter(Boolean).join(', ')} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {gym.description && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">About</p>
                <p className="text-sm text-foreground leading-relaxed">{gym.description}</p>
              </div>
            )}

            {gym.amenities.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {gym.amenities.map(a => (
                    <Badge key={a.id} variant="outline">{a.label}</Badge>
                  ))}
                </div>
              </div>
            )}

            {gym.images.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Gallery</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gym.images.map(img => (
                    <div key={img.id} className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'staff' && (
        <div className="max-w-2xl">
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Staff Members</p>
            <StaffPanel gymId={gym.id} />
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Gym" size="lg">
        <GymForm
          defaultValues={gym}
          onSubmit={handleUpdate}
          isLoading={updateGym.isPending}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  )
}
