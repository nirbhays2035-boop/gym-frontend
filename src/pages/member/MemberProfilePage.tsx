import { useState } from 'react'
import axios from 'axios'
import { CheckCircle2, Lock, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const profileSchema = z.object({ full_name: z.string().min(2, 'Name required'), phone: z.string().optional() })
const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine((data) => data.new_password === data.confirm, { message: "Passwords don't match", path: ['confirm'] })
type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
const inputClass = (error?: string) => cn('w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring', error ? 'border-destructive' : 'border-input')

function apiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
  return data?.errors?.old_password?.[0] ?? data?.message ?? fallback
}

export default function MemberProfilePage() {
  const { user, setUser } = useAuthStore()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: user?.full_name ?? '', phone: user?.phone ?? '' } })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const saveProfile = async (data: ProfileForm) => {
    try {
      setProfileError('')
      const response = await authApi.updateMe(data)
      setUser(response.data.data)
      setProfileSaved(true)
      window.setTimeout(() => setProfileSaved(false), 3000)
    } catch (error) {
      setProfileError(apiError(error, 'Update failed.'))
    }
  }

  const savePassword = async (data: PasswordForm) => {
    try {
      setPasswordError('')
      await authApi.changePassword({ old_password: data.old_password, new_password: data.new_password })
      passwordForm.reset()
      setPasswordSaved(true)
      window.setTimeout(() => setPasswordSaved(false), 3000)
    } catch (error) {
      setPasswordError(apiError(error, 'Password change failed.'))
    }
  }

  return <div className="max-w-2xl"><PageHeader title="My Profile" description="Manage your account details." /><div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><span className="text-2xl font-black text-primary">{user?.full_name?.charAt(0).toUpperCase()}</span></div><div><p className="text-lg font-bold">{user?.full_name}</p><p className="text-sm text-muted-foreground">{user?.email}</p><p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p></div></div><div className="bg-card border border-border rounded-2xl p-6 mb-6"><div className="flex items-center gap-2 mb-5"><User size={16} className="text-primary" /><p className="font-semibold">Personal Information</p></div><form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4"><div><label className="text-sm font-medium">Full Name</label><input {...profileForm.register('full_name')} className={inputClass(profileForm.formState.errors.full_name?.message)} />{profileForm.formState.errors.full_name && <p className="text-xs text-destructive">{profileForm.formState.errors.full_name.message}</p>}</div><div><label className="text-sm font-medium">Email</label><input value={user?.email ?? ''} disabled className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-muted text-muted-foreground" /><p className="text-xs text-muted-foreground">Email cannot be changed.</p></div><div><label className="text-sm font-medium">Phone</label><input {...profileForm.register('phone')} className={inputClass()} /></div>{profileError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{profileError}</p>}<div className="flex items-center justify-between pt-2">{profileSaved && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 size={15} /> Saved</span>}<button disabled={profileForm.formState.isSubmitting} className="ml-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">{profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</button></div></form></div><div className="bg-card border border-border rounded-2xl p-6"><div className="flex items-center gap-2 mb-5"><Lock size={16} className="text-primary" /><p className="font-semibold">Change Password</p></div><form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">{(['old_password', 'new_password', 'confirm'] as const).map((name) => <div key={name}><label className="text-sm font-medium">{{ old_password: 'Current Password', new_password: 'New Password', confirm: 'Confirm New Password' }[name]}</label><input {...passwordForm.register(name)} type="password" className={inputClass(passwordForm.formState.errors[name]?.message)} />{passwordForm.formState.errors[name] && <p className="text-xs text-destructive">{passwordForm.formState.errors[name]?.message}</p>}</div>)}{passwordError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{passwordError}</p>}<div className="flex items-center justify-between pt-2">{passwordSaved && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 size={15} /> Password changed</span>}<button disabled={passwordForm.formState.isSubmitting} className="ml-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">{passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}</button></div></form></div></div>
}
