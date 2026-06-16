import { Megaphone, Pin } from 'lucide-react'
import { useMyAnnouncements } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export default function MemberAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useMyAnnouncements()
  return (
    <div>
      <PageHeader title="Announcements" description="Updates from your gym." />
      {isLoading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
        : announcements.length === 0 ? <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl"><Megaphone size={40} className="text-muted-foreground/30 mb-4" /><p className="font-medium">No announcements yet</p><p className="text-sm text-muted-foreground mt-1">Your gym has not posted anything yet.</p></div>
          : <div className="space-y-4">{announcements.map((announcement) => <div key={announcement.id} className={cn('bg-card border rounded-2xl p-5', announcement.is_pinned ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border')}><div className="flex items-start gap-3 mb-2">{announcement.is_pinned && <Pin size={14} className="text-primary mt-0.5" />}<div className="flex-1"><div className="flex items-center gap-2"><p className="font-semibold">{announcement.title}</p>{announcement.is_pinned && <Badge>Pinned</Badge>}</div><p className="text-xs text-muted-foreground mt-0.5">{new Date(announcement.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div><p className="text-sm leading-relaxed">{announcement.body}</p></div>)}</div>}
    </div>
  )
}
