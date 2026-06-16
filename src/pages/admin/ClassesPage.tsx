import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Plus, Trash2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminClasses, useCancelClass, useCreateClass } from '@/hooks/useClasses'
import { useGyms } from '@/hooks/useGyms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const schema = z.object({
  gym: z.string().min(1, 'Gym required'),
  title: z.string().min(2, 'Title required'),
  description: z.string().optional(),
  trainer: z.string().optional(),
  starts_at: z.string().min(1, 'Start time required'),
  ends_at: z.string().min(1, 'End time required'),
  capacity: z.coerce.number().min(1).max(500),
}).refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
  message: 'End time must be after start time',
  path: ['ends_at'],
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

const inputClass = (error?: string) => cn(
  'w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground',
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
  error ? 'border-destructive' : 'border-input',
)

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  const { data: gyms = [] } = useGyms()
  const { data: classes = [], isLoading } = useAdminClasses()
  const createClass = useCreateClass()
  const cancelClass = useCancelClass()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 20, gym: '' },
  })

  useEffect(() => {
    if (gyms.length === 1) setValue('gym', gyms[0].id)
  }, [gyms, setValue])

  const onSubmit = (data: FormData) => {
    createClass.mutate(data, {
      onSuccess: () => {
        reset({ capacity: 20, gym: gyms.length === 1 ? gyms[0].id : '' })
        setOpen(false)
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description={`${classes.length} class${classes.length === 1 ? '' : 'es'}`}
        actions={
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90">
            <Plus size={16} /> Add Class
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <CalendarDays size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No classes scheduled</p>
          <p className="text-sm text-muted-foreground mt-1">Add a class to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const start = new Date(cls.starts_at)
            const end = new Date(cls.ends_at)
            return (
              <div key={cls.id} className={cn('bg-card border border-border rounded-2xl p-5 flex items-center gap-5', cls.is_past && 'opacity-60')}>
                <div className="shrink-0 w-14 text-center bg-muted rounded-xl p-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{start.toLocaleDateString('en-IN', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-foreground leading-none mt-0.5">{start.getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{cls.title}</p>
                    {cls.is_past ? <Badge variant="outline">Past</Badge>
                      : cls.is_full ? <Badge variant="destructive">Full</Badge>
                        : <Badge variant="success">{cls.spots_remaining} spots</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {cls.trainer && <span>with {cls.trainer}</span>}
                    <span className="flex items-center gap-1"><Clock size={11} />{start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{cls.bookings_count}/{cls.capacity}</span>
                  </div>
                </div>
                {!cls.is_past && (
                  <button onClick={() => cancelClass.mutate(cls.id)} disabled={cancelClass.isPending} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg" title="Cancel class">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Class" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Gym</label>
            <select {...register('gym')} className={inputClass(errors.gym?.message)}><option value="">Select gym</option>{gyms.map((gym) => <option key={gym.id} value={gym.id}>{gym.name}</option>)}</select>
            {errors.gym && <p className="text-xs text-destructive">{errors.gym.message}</p>}
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Title</label><input {...register('title')} className={inputClass(errors.title?.message)} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Trainer</label><input {...register('trainer')} className={inputClass()} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Capacity</label><input type="number" {...register('capacity')} className={inputClass(errors.capacity?.message)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Starts</label><input type="datetime-local" {...register('starts_at')} className={inputClass(errors.starts_at?.message)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Ends</label><input type="datetime-local" {...register('ends_at')} className={inputClass(errors.ends_at?.message)} />{errors.ends_at && <p className="text-xs text-destructive">{errors.ends_at.message}</p>}</div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea rows={3} {...register('description')} className={cn(inputClass(), 'resize-none')} /></div>
          <div className="flex justify-end"><button type="submit" disabled={createClass.isPending} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">{createClass.isPending ? 'Creating...' : 'Create Class'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
