export type Role = 'super_admin' | 'admin' | 'member'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  errors?: Record<string, string[]>
}

export interface AuthTokens {
  access: string
  refresh: string
  user: User
}

export interface MembershipPlan {
  id: string
  gym: string
  gym_name: string
  name: string
  description: string
  price: string
  duration_days: number
  duration_label: string
  features: string[]
  is_active: boolean
  is_featured: boolean
  subscriber_count: number
  created_at: string
}

export interface Subscription {
  id: string
  plan: MembershipPlan
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  days_remaining: number
  is_expiring_soon: boolean
  created_at: string
}

export interface MemberUser {
  id: string
  email: string
  full_name: string
  phone: string
  is_active: boolean
}

export interface MemberListItem {
  id: string
  user: MemberUser
  gym_name: string
  member_code: string
  profile_pic_url: string
  is_active: boolean
  active_plan_name: string | null
  subscription_status: 'active' | 'expiring_soon' | 'no_plan'
  joined_at: string
}

export interface MemberDetail extends MemberListItem {
  gym: string
  date_of_birth: string | null
  gender: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  notes: string
  subscriptions: Subscription[]
  active_subscription: Subscription | null
  updated_at: string
}

