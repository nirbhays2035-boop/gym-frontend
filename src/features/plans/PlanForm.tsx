import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { MembershipPlan } from '@/types'

const DURATIONS = [
  { value: 30, label: '1 Month' },
  { value: 60, label: '2 Months' },
  { value: 90, label: '3 Months' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' },
]

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price: z.number().min(1, 'Price must be > 0'),
  duration_days: z.number(),
  is_featured: z.boolean().optional(),
})
export type PlanFormData = z.infer<typeof schema> & { features: string[] }
type FormValues = z.infer<typeof schema>

const inputCls = (err?: string) => cn(
  'w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground',
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
  err ? 'border-destructive' : 'border-input'
)

interface Props {
  gymId: string
  defaultValues?: Partial<MembershipPlan>
  onSubmit: (data: PlanFormData & { gym: string }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function PlanForm({ gymId, defaultValues, onSubmit, isLoading, submitLabel = 'Save' }: Props) {
  const [features, setFeatures] = useState<string[]>(defaultValues?.features ?? [])
  const [featureInput, setFeatureInput] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ? Number(defaultValues.price) : undefined,
      duration_days: defaultValues?.duration_days ?? 30,
      is_featured: defaultValues?.is_featured ?? false,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        description: defaultValues.description,
        price: Number(defaultValues.price),
        duration_days: defaultValues.duration_days,
        is_featured: defaultValues.is_featured,
      })
      setFeatures(defaultValues.features ?? [])
    }
  }, [defaultValues])

  const addFeature = () => {
    const val = featureInput.trim()
    if (val && !features.includes(val)) {
      setFeatures(prev => [...prev, val])
      setFeatureInput('')
    }
  }

  const removeFeature = (f: string) => setFeatures(prev => prev.filter(x => x !== f))

  const onValid = (data: FormValues) => {
    onSubmit({ ...data, features, gym: gymId })
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Plan Name <span className="text-destructive">*</span>
        </label>
        <input {...register('name')} placeholder="e.g. Premium Monthly" className={inputCls(errors.name?.message)} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Price + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Price (₹) <span className="text-destructive">*</span>
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="999"
            className={inputCls(errors.price?.message)}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Duration</label>
          <select {...register('duration_days', { valueAsNumber: true })} className={inputCls()}>
            {DURATIONS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="What's included in this plan…"
          className={cn(inputCls(), 'resize-none')}
        />
      </div>

      {/* Features */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Features</label>
        <div className="flex gap-2">
          <input
            value={featureInput}
            onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
            placeholder="e.g. Unlimited cardio access"
            className={cn(inputCls(), 'flex-1')}
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-3 py-2 border border-input rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {features.map(f => (
              <span
                key={f}
                className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
              >
                {f}
                <button type="button" onClick={() => removeFeature(f)} className="hover:text-destructive">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-primary rounded" />
        <span className="text-sm font-medium text-foreground">Mark as featured plan</span>
      </label>

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
