import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Mail, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateMe, useChangePassword } from '@/hooks/useAuth'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/utils/cn'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_new_password: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.new_password === data.confirm_new_password, {
  message: 'Passwords do not match',
  path: ['confirm_new_password'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const inputCls = (error?: string) => cn(
  'w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground',
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow',
  error ? 'border-destructive' : 'border-input'
)

export default function SettingsPage() {
  const { user } = useAuthStore()
  const updateMe = useUpdateMe()
  const changePassword = useChangePassword()

  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  // Sync profile form when user store loaded/changed
  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name,
        phone: user.phone ?? '',
      })
    }
  }, [user, resetProfile])

  const onUpdateProfile = (data: ProfileFormData) => {
    setProfileSuccess('')
    setProfileError('')
    updateMe.mutate(data, {
      onSuccess: () => {
        setProfileSuccess('Profile updated successfully.')
      },
      onError: (err: any) => {
        setProfileError(err.response?.data?.message ?? 'Failed to update profile.')
      }
    })
  }

  const onChangePasswordSubmit = (data: PasswordFormData) => {
    setPasswordSuccess('')
    setPasswordError('')
    changePassword.mutate({
      old_password: data.old_password,
      new_password: data.new_password,
    }, {
      onSuccess: () => {
        setPasswordSuccess('Password changed successfully.')
        resetPassword({ old_password: '', new_password: '', confirm_new_password: '' })
      },
      onError: (err: any) => {
        setPasswordError(err.response?.data?.message ?? 'Failed to change password.')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your account profile and password settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Profile Details
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Update your account full name and contact number.</p>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    {...registerProfile('full_name')}
                    placeholder="Full name"
                    className={inputCls(profileErrors.full_name?.message)}
                  />
                  {profileErrors.full_name?.message && (
                    <p className="text-xs text-destructive">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <input
                    {...registerProfile('phone')}
                    placeholder="Contact number"
                    className={inputCls()}
                  />
                </div>
              </div>

              {profileSuccess && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg px-3 py-2.5">
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  {profileError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateMe.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  {updateMe.isPending ? 'Updating…' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Security Settings
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Change your account access password.</p>

            <form onSubmit={handlePasswordSubmit(onChangePasswordSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <input
                  {...registerPassword('old_password')}
                  type="password"
                  placeholder="••••••••"
                  className={inputCls(passwordErrors.old_password?.message)}
                />
                {passwordErrors.old_password?.message && (
                  <p className="text-xs text-destructive">{passwordErrors.old_password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <input
                    {...registerPassword('new_password')}
                    type="password"
                    placeholder="••••••••"
                    className={inputCls(passwordErrors.new_password?.message)}
                  />
                  {passwordErrors.new_password?.message && (
                    <p className="text-xs text-destructive">{passwordErrors.new_password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <input
                    {...registerPassword('confirm_new_password')}
                    type="password"
                    placeholder="••••••••"
                    className={inputCls(passwordErrors.confirm_new_password?.message)}
                  />
                  {passwordErrors.confirm_new_password?.message && (
                    <p className="text-xs text-destructive">{passwordErrors.confirm_new_password.message}</p>
                  )}
                </div>
              </div>

              {passwordSuccess && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg px-3 py-2.5">
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  {changePassword.isPending ? 'Updating…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Read-Only Info Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-widest text-muted-foreground/85">
              Account Metadata
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-muted">
                  <Mail size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 break-all">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-muted">
                  <ShieldAlert size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">System Role</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
