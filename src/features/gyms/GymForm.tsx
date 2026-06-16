import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import type { GymDetail } from '@/api/gyms'

const schema = z.object({
  name:        z.string().min(2, 'Name required'),
  email:       z.string().email('Valid email required').or(z.literal('')),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  state:       z.string().optional(),
  pincode:     z.string().optional(),
  description: z.string().optional(),
  logo_url:    z.string().url('Must be a valid URL').or(z.literal('')),
  website:     z.string().url('Must be a valid URL').or(z.literal('')),
})

export type GymFormData = z.infer<typeof schema>

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

const inputCls = (error?: string) => cn(
  'w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground',
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow',
  error ? 'border-destructive' : 'border-input'
)

interface Props {
  defaultValues?: Partial<GymDetail>
  onSubmit: (data: GymFormData) => void
  isLoading?: boolean
  submitLabel?: string
}

export function GymForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save' }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GymFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Basic Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Gym Name" error={errors.name?.message} required>
              <input {...register('name')} placeholder="e.g. Iron Paradise Gym" className={inputCls(errors.name?.message)} />
            </Field>
          </div>
          <Field label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="gym@example.com" className={inputCls(errors.email?.message)} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="+91 9876543210" className={inputCls()} />
          </Field>
          <Field label="Logo URL" error={errors.logo_url?.message}>
            <input {...register('logo_url')} placeholder="https://..." className={inputCls(errors.logo_url?.message)} />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input {...register('website')} placeholder="https://..." className={inputCls(errors.website?.message)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief description of the gym…"
                className={cn(inputCls(), 'resize-none')}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Location</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Address">
              <input {...register('address')} placeholder="Street address" className={inputCls()} />
            </Field>
          </div>
          <Field label="City">
            <input {...register('city')} placeholder="Ahmedabad" className={inputCls()} />
          </Field>
          <Field label="State">
            <input {...register('state')} placeholder="Gujarat" className={inputCls()} />
          </Field>
          <Field label="Pincode">
            <input {...register('pincode')} placeholder="380001" className={inputCls()} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
