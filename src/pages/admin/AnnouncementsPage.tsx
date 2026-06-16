import { useEffect, useState } from 'react'
import { Megaphone, Pin, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useTickets'
import { useGyms } from '@/hooks/useGyms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const schema = z.object({
  gym: z.string().min(1, 'Gym required'),
  title: z.string().min(3, 'Title required'),
  body: z.string().min(10, 'Message must be at least 10 characters'),
  is_pinned: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>
const inputClass = 'w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false)
  const { data: gyms = [] } = useGyms()
  const { data: announcements = [], isLoading } = useAnnouncements()
  const createAnnouncement = useCreateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gym: '', is_pinned: false },
  })

  useEffect(() => {
    if (gyms.length === 1) setValue('gym', gyms[0].id)
  }, [gyms, setValue])

  const onSubmit = (data: FormData) => createAnnouncement.mutate(data, {
    onSuccess: () => {
      reset({ gym: gyms.length === 1 ? gyms[0].id : '', is_pinned: false })
      setOpen(false)
    },
  })

  return (
    <div>
      <PageHeader title="Announcements" description="Post updates for your gym members." actions={<button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl"><Plus size={16} /> Post Announcement</button>} />
      {isLoading ? <div className="space-y-4">{[1, 2].map((item) => <div key={item} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
        : announcements.length === 0 ? <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl"><Megaphone size={40} className="text-muted-foreground/30 mb-4" /><p className="font-medium">No announcements yet</p><p className="text-sm text-muted-foreground mt-1">Post your first announcement to members.</p></div>
          : <div className="space-y-4">{announcements.map((announcement) => <div key={announcement.id} className={cn('bg-card border rounded-2xl p-5', announcement.is_pinned ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border')}><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3">{announcement.is_pinned && <Pin size={15} className="text-primary mt-0.5" />}<div><p className="font-semibold">{announcement.title}</p><p className="text-xs text-muted-foreground mt-0.5">{announcement.gym_name} | by {announcement.created_by_name} | {new Date(announcement.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div></div><div className="flex items-center gap-2">{announcement.is_pinned && <Badge>Pinned</Badge>}<button onClick={() => deleteAnnouncement.mutate(announcement.id)} disabled={deleteAnnouncement.isPending} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={15} /></button></div></div><p className="text-sm mt-3 leading-relaxed">{announcement.body}</p></div>)}</div>}
      <Modal open={open} onClose={() => setOpen(false)} title="Post Announcement"><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div><label className="text-sm font-medium">Gym</label><select {...register('gym')} className={cn(inputClass, errors.gym && 'border-destructive')}><option value="">Select gym</option>{gyms.map((gym) => <option key={gym.id} value={gym.id}>{gym.name}</option>)}</select>{errors.gym && <p className="text-xs text-destructive">{errors.gym.message}</p>}</div><div><label className="text-sm font-medium">Title</label><input {...register('title')} className={cn(inputClass, errors.title && 'border-destructive')} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div><div><label className="text-sm font-medium">Message</label><textarea {...register('body')} rows={4} className={cn(inputClass, 'resize-none', errors.body && 'border-destructive')} />{errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}</div><label className="flex items-center gap-3"><input type="checkbox" {...register('is_pinned')} className="w-4 h-4 accent-primary" /><span className="text-sm font-medium">Pin this announcement</span></label><div className="flex justify-end"><button disabled={createAnnouncement.isPending} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">{createAnnouncement.isPending ? 'Posting...' : 'Post Announcement'}</button></div></form></Modal>
    </div>
  )
}
