import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Users, ArrowRight } from 'lucide-react'
import { useGyms } from '@/hooks/useGyms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

export default function StaffPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: gyms = [], isLoading } = useGyms({ search })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Select a gym to manage and view its assigned staff members."
      />

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search gyms…"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-muted rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : gyms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card">
          <Building2 size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-foreground">No gyms found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Try adjusting your search term.' : 'Add a gym to start managing its staff.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gyms.map(gym => (
            <div
              key={gym.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-sm transition-all duration-200 group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-3">
                    {gym.logo_url ? (
                      <img src={gym.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 size={20} className="text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{gym.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {[gym.city, gym.state].filter(Boolean).join(', ') || 'Location not set'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={gym.is_active ? 'success' : 'destructive'}>
                    {gym.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
                  <Users size={16} className="text-muted-foreground/75" />
                  <span className="font-semibold text-foreground">{gym.staff_count}</span> staff member{gym.staff_count !== 1 ? 's' : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/super-admin/gyms/${gym.id}?tab=staff`)}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2.5 rounded-xl text-sm transition-all duration-200"
              >
                Manage Staff
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
