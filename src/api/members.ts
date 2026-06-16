import api from './axios'
import type { ApiResponse, MemberListItem, MemberDetail, Subscription } from '@/types'

export interface CreateMemberPayload {
  full_name: string
  email: string
  phone?: string
  password?: string
  gym: string
  date_of_birth?: string
  gender?: string
  address?: string
  notes?: string
}

export const membersApi = {
  list: (params?: { search?: string; gym?: string; subscription_status?: string }) =>
    api.get<ApiResponse<MemberListItem[]>>('/members/', { params }),

  get: (id: string) =>
    api.get<ApiResponse<MemberDetail>>(`/members/${id}/`),

  create: (data: CreateMemberPayload) =>
    api.post<ApiResponse<MemberDetail>>('/members/', data),

  update: (id: string, data: Partial<CreateMemberPayload>) =>
    api.patch<ApiResponse<MemberDetail>>(`/members/${id}/`, data),

  deactivate: (id: string) =>
    api.delete<ApiResponse<null>>(`/members/${id}/`),

  assignPlan: (memberId: string, planId: string) =>
    api.post<ApiResponse<Subscription>>(`/members/${memberId}/assign-plan/`, { plan_id: planId }),

  getSubscriptions: (memberId: string) =>
    api.get<ApiResponse<Subscription[]>>(`/members/${memberId}/subscriptions/`),

  myProfile: () =>
    api.get<ApiResponse<MemberDetail>>('/members/me/'),
}
