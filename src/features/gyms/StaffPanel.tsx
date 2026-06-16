import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useGymStaff, useAddStaff, useRemoveStaff } from '@/hooks/useGyms'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { ApiResponse } from '@/types'

const schema = z.object({
  email:       z.string().email('Valid email required'),
  designation: z.enum(['manager', 'trainer', 'receptionist', 'maintenance', 'other']),
})
type FormData = z.infer<typeof schema>

const designationLabels: Record<string, string> = {
  manager: 'Manager', trainer: 'Trainer',
  receptionist: 'Receptionist', maintenance: 'Maintenance', other: 'Other',
}

function staffErrorMessage(error: Error | null) {
  if (!error) return 'Failed to add staff.'
  const axiosErr = error as AxiosError<ApiResponse<unknown>>
  const emailErr = axiosErr.response?.data?.errors?.email?.[0]
  if (emailErr) return emailErr
  return axiosErr.response?.data?.message ?? 'Failed to add staff.'
}

export function StaffPanel({ gymId }: { gymId: string }) {
  const [adding, setAdding] = useState(false)
  const { data: staff = [], isLoading } = useGymStaff(gymId)
  const addStaff    = useAddStaff(gymId)
  const removeStaff = useRemoveStaff(gymId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { designation: 'trainer' },
  })

  const onAdd = (data: FormData) => {
    addStaff.mutate(data, {
      onSuccess: () => { reset(); setAdding(false) },
    })
  }

  const inputCls = (err?: string) => cn(
    'w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground',
    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
    err ? 'border-destructive' : 'border-input'
  )

  return (
    <div className="space-y-4">
      {adding ? (
        <form onSubmit={handleSubmit(onAdd)} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
          <p className="text-sm font-medium text-foreground">Add staff member</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input {...register('email')} placeholder="staff@email.com" className={inputCls(errors.email?.message)} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <select {...register('designation')} className={inputCls()}>
              {Object.entries(designationLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addStaff.isPending}
                className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {addStaff.isPending ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="flex-1 border border-border text-sm text-muted-foreground py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          {addStaff.error && (
            <p className="text-xs text-destructive">
              {staffErrorMessage(addStaff.error)}
            </p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <UserPlus size={16} /> Add staff member
        </button>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : staff.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No staff assigned yet.</p>
      ) : (
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-card">
              <div>
                <p className="text-sm font-medium text-foreground">{s.user.full_name}</p>
                <p className="text-xs text-muted-foreground">{s.user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={s.is_active ? 'success' : 'destructive'}>
                  {designationLabels[s.designation]}
                </Badge>
                <button
                  onClick={() => removeStaff.mutate(s.id)}
                  disabled={removeStaff.isPending}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove staff"
                >
                  <UserMinus size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
