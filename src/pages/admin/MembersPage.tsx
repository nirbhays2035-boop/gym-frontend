import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMembers, useCreateMember } from '@/hooks/useMembers'
import { useGyms } from '@/hooks/useGyms'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import type { MemberListItem } from '@/types'

const statusVariant = {
  active:          'success',
  expiring_soon:   'warning',
  no_plan:         'outline',
} as const

const statusLabel = {
  active:         'Active',
  expiring_soon:  'Expiring Soon',
  no_plan:        'No Plan',
}

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().optional(),
  gym:       z.string().min(1, 'Gym required'),
  password:  z.string().min(8).optional().or(z.literal('')),
  gender:    z.enum(['M', 'F', 'O', 'N', '']).optional(),
  notes:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

const inputCls = (err?: string) => cn(
  'w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground',
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
  err ? 'border-destructive' : 'border-input'
)

export default function MembersPage() {
  const navigate   = useNavigate()
  const [search, setSearch]       = useState('')
  const [subFilter, setSubFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: gyms = [] }    = useGyms()
  const { data: members = [], isLoading } = useMembers({
    search: search || undefined,
    subscription_status: subFilter || undefined,
  })
  const createMember     = useCreateMember()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gym: gyms[0]?.id ?? '' },
  })

  const onSubmit = (data: FormData) => {
    createMember.mutate(
      { ...data, password: data.password || 'GymOS@1234' },
      { onSuccess: () => { reset(); setCreateOpen(false) } }
    )
  }

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (row: MemberListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {row.profile_pic_url
              ? <img src={row.profile_pic_url} className="w-8 h-8 rounded-full object-cover" alt="" />
              : <span className="text-xs font-bold text-primary">
                  {row.user.full_name.charAt(0).toUpperCase()}
                </span>
            }
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{row.user.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row: MemberListItem) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
          {row.member_code}
        </span>
      ),
    },
    {
      key: 'gym',
      header: 'Gym',
      render: (row: MemberListItem) => (
        <span className="text-sm text-foreground">{row.gym_name}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row: MemberListItem) => (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[row.subscription_status]}>
            {statusLabel[row.subscription_status]}
          </Badge>
          {row.active_plan_name && (
            <span className="text-xs text-muted-foreground">{row.active_plan_name}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: MemberListItem) => (
        <Badge variant={row.is_active ? 'default' : 'destructive'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (row: MemberListItem) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Members"
        description={`${members.length} member${members.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Add Member
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            className="pl-9 pr-3 py-2.5 text-sm border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
          />
        </div>
        <div className="relative">
          <select
            value={subFilter}
            onChange={e => setSubFilter(e.target.value)}
            className="appearance-none border border-input rounded-xl px-3 py-2.5 pr-8 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="active">Active plan</option>
            <option value="no_plan">No plan</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={members}
        loading={isLoading}
        emptyMessage="No members found."
        onRowClick={row => navigate(`/admin/members/${row.id}`)}
      />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Member" description="Creates a new member account." size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
              <input {...register('full_name')} placeholder="John Doe" className={inputCls(errors.full_name?.message)} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
              <input {...register('email')} type="email" placeholder="john@example.com" className={inputCls(errors.email?.message)} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input {...register('phone')} placeholder="+91 9876543210" className={inputCls()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gym <span className="text-destructive">*</span></label>
              <select {...register('gym')} className={inputCls(errors.gym?.message)}>
                <option value="">Select gym</option>
                {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {errors.gym && <p className="text-xs text-destructive">{errors.gym.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <select {...register('gender')} className={inputCls()}>
                <option value="">Prefer not to say</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Temp Password</label>
              <input {...register('password')} type="password" placeholder="Default: GymOS@1234" className={inputCls()} />
              <p className="text-xs text-muted-foreground">Leave blank to use default password.</p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notes (internal)</label>
              <textarea {...register('notes')} rows={2} className={cn(inputCls(), 'resize-none')} placeholder="Any admin notes…" />
            </div>
          </div>

          {createMember.error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {(createMember.error as any)?.response?.data?.message ?? 'Failed to create member.'}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createMember.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {createMember.isPending ? 'Creating…' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
