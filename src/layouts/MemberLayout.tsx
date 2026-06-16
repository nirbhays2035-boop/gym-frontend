import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, CreditCard, CalendarDays, Ticket, User, LogOut, Menu, X, Bell, QrCode, Receipt, Megaphone } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV = [
  { to: '/member', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/member/plans', icon: CreditCard, label: 'Plans' },
  { to: '/member/card', icon: QrCode, label: 'My Card' },
  { to: '/member/payments', icon: Receipt, label: 'Payments' },
  { to: '/member/classes', icon: CalendarDays, label: 'Classes' },
  { to: '/member/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/member/tickets', icon: Ticket, label: 'Support' },
  { to: '/member/profile', icon: User, label: 'Profile' },
]

export default function MemberLayout() {
  const { user } = useAuthStore()
  const logout = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Get user initials for avatar
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'M'

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
      {/* Premium Ambient decorative glow blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-64 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card/60 backdrop-blur-md border-r border-border/50 flex-col z-20 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-border/50 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-violet-600 flex items-center justify-center text-white shadow-md shadow-primary/20 font-black text-lg">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              GymOS
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Member Portal</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 font-semibold scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:translate-x-1'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Card & Logout */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-3 bg-card border border-border/50 p-3 rounded-2xl shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-98 transition-all py-2 rounded-xl border border-destructive/20 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary to-violet-600 flex items-center justify-center text-white font-black">
              G
            </div>
            <span className="font-bold text-lg bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">GymOS</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary to-violet-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 active:scale-98 transition-all py-2 rounded-xl border border-destructive/20 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header / Top Bar */}
        <header className="lg:hidden h-16 bg-card/60 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg border border-border text-muted-foreground hover:bg-accent cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-primary to-violet-600 flex items-center justify-center text-white font-black text-sm">
              G
            </div>
            <span className="font-bold text-base bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">GymOS</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="p-2 rounded-full border border-border text-muted-foreground hover:bg-accent relative cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-violet-500 text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Desktop Header / Top Bar */}
        <header className="hidden lg:flex h-16 bg-card/20 border-b border-border/30 backdrop-blur-xs items-center justify-between px-8 z-10 shrink-0">
          <div className="text-sm font-medium text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.full_name}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="p-2.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/40 relative transition-colors shadow-2xs cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            <div className="h-6 w-px bg-border/40" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {initials}
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
