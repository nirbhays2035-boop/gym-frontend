import { useState } from 'react'
import { BookOpen, CalendarDays, Clock, Loader2, Users } from 'lucide-react'
import { useBookClass, useCancelBooking, useMyClasses } from '@/hooks/useClasses'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { GymClass } from '@/api/classes'

function ClassCard({ cls, onBook, onCancel, isLoading }: {
  cls: GymClass
  onBook: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  const start = new Date(cls.starts_at)
  const end = new Date(cls.ends_at)
  const date = start.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const time = `${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  const capacityPercent = cls.capacity > 0
    ? Math.min(100, (cls.bookings_count / cls.capacity) * 100)
    : 0

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md',
      cls.member_booked ? 'border-primary/40 ring-1 ring-primary/10' : 'border-border',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{cls.title}</h3>
          {cls.trainer && <p className="text-xs text-muted-foreground mt-0.5">with {cls.trainer}</p>}
        </div>
        {cls.member_booked ? (
          <Badge variant="success">Booked</Badge>
        ) : cls.is_full ? (
          <Badge variant="destructive">Full</Badge>
        ) : (
          <Badge variant="outline">{cls.spots_remaining} spots left</Badge>
        )}
      </div>

      {cls.description && <p className="text-sm text-muted-foreground">{cls.description}</p>}

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><CalendarDays size={14} />{date}</span>
        <span className="flex items-center gap-2"><Clock size={14} />{time}</span>
        <span className="flex items-center gap-2"><Users size={14} />{cls.bookings_count} / {cls.capacity} booked</span>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', cls.is_full ? 'bg-destructive' : 'bg-primary')}
          style={{ width: `${capacityPercent}%` }}
        />
      </div>

      <button
        onClick={cls.member_booked ? onCancel : onBook}
        disabled={isLoading || (!cls.member_booked && cls.is_full)}
        className={cn(
          'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60',
          cls.member_booked
            ? 'border border-border text-muted-foreground hover:bg-muted hover:text-destructive'
            : cls.is_full
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" />
          : cls.member_booked ? 'Cancel Booking'
            : cls.is_full ? 'Class Full' : 'Book Class'}
      </button>
    </div>
  )
}

export default function MemberClassesPage() {
  const { data: classes = [], isLoading } = useMyClasses()
  const bookClass = useBookClass()
  const cancelBooking = useCancelBooking()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleBooking = (classId: string, action: 'book' | 'cancel') => {
    setLoadingId(classId)
    const mutation = action === 'book' ? bookClass : cancelBooking
    mutation.mutate(classId, { onSettled: () => setLoadingId(null) })
  }

  return (
    <div>
      <PageHeader title="Classes" description="Upcoming classes at your gym." />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <BookOpen size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No upcoming classes</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onBook={() => handleBooking(cls.id, 'book')}
              onCancel={() => handleBooking(cls.id, 'cancel')}
              isLoading={loadingId === cls.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
