import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    if (user.role === 'super_admin') return <Navigate to="/super-admin" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/member" replace />
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Premium Ambient Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-primary) 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Centered Main Form Wrapper with Subtle Micro-Animation */}
      <div className="relative z-10 w-full flex justify-center animate-fade-in animate-zoom-in duration-300">
        <Outlet />
      </div>
    </div>
  )
}
