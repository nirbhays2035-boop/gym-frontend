import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import AuthLayout from '@/layouts/AuthLayout'
import ProtectedLayout from '@/layouts/ProtectedLayout'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import AdminLayout from '@/layouts/AdminLayout'
import MemberLayout from '@/layouts/MemberLayout'

import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import SuperAdminDashboard from '@/pages/SuperAdminDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import MemberDashboard from '@/pages/MemberDashboard'
import GymsPage from '@/pages/GymsPage'
import GymDetailPage from '@/pages/GymDetailPage'
import StaffPage from '@/pages/StaffPage'
import SettingsPage from '@/pages/SettingsPage'
import PlansPage from '@/pages/admin/PlansPage'
import MembersPage from '@/pages/admin/MembersPage'
import MemberDetailPage from '@/pages/admin/MemberDetailPage'
import ClassesPage from '@/pages/admin/ClassesPage'
import AnnouncementsPage from '@/pages/admin/AnnouncementsPage'
import AdminTicketsPage from '@/pages/admin/TicketsPage'
import MemberPlansPage from '@/pages/member/MemberPlansPage'
import MemberClassesPage from '@/pages/member/MemberClassesPage'
import MemberTicketsPage from '@/pages/member/MemberTicketsPage'
import MemberProfilePage from '@/pages/member/MemberProfilePage'
import MemberAnnouncementsPage from '@/pages/member/MemberAnnouncementsPage'
import MembershipCardPage from '@/pages/member/MembershipCardPage'
import PaymentHistoryPage from '@/pages/member/PaymentHistoryPage'
import PaymentsPage from '@/pages/admin/PaymentsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Super Admin */}
          <Route element={<ProtectedLayout allowedRoles={['super_admin']} />}>
            <Route element={<SuperAdminLayout />}>
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/gyms" element={<GymsPage />} />
              <Route path="/super-admin/gyms/:id" element={<GymDetailPage />} />
              <Route path="/super-admin/staff" element={<StaffPage />} />
              <Route path="/super-admin/settings" element={<SettingsPage />} />
              <Route path="/super-admin/plans" element={<PlansPage />} />
              <Route path="/super-admin/members" element={<MembersPage />} />
              <Route path="/super-admin/members/:id" element={<MemberDetailPage />} />
              <Route path="/super-admin/payments" element={<PaymentsPage />} />
              <Route path="/super-admin/tickets" element={<AdminTicketsPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedLayout allowedRoles={['admin', 'super_admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/plans" element={<PlansPage />} />
              <Route path="/admin/members" element={<MembersPage />} />
              <Route path="/admin/members/:id" element={<MemberDetailPage />} />
              <Route path="/admin/classes" element={<ClassesPage />} />
              <Route path="/admin/announcements" element={<AnnouncementsPage />} />
              <Route path="/admin/tickets" element={<AdminTicketsPage />} />
              <Route path="/admin/payments" element={<PaymentsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Member */}
          <Route element={<ProtectedLayout allowedRoles={['member']} />}>
            <Route element={<MemberLayout />}>
              <Route path="/member" element={<MemberDashboard />} />
              <Route path="/member/plans" element={<MemberPlansPage />} />
              <Route path="/member/card" element={<MembershipCardPage />} />
              <Route path="/member/payments" element={<PaymentHistoryPage />} />
              <Route path="/member/classes" element={<MemberClassesPage />} />
              <Route path="/member/tickets" element={<MemberTicketsPage />} />
              <Route path="/member/profile" element={<MemberProfilePage />} />
              <Route path="/member/announcements" element={<MemberAnnouncementsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
