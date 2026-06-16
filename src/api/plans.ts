import api from './axios'
import type { ApiResponse, MembershipPlan } from '@/types'

export interface PlanPayload {
  gym: string
  name: string
  description?: string
  price: number
  duration_days: number
  features?: string[]
  is_active?: boolean
  is_featured?: boolean
}

export const plansApi = {
  list: (params?: { gym?: string; search?: string }) =>
    api.get<ApiResponse<MembershipPlan[]>>('/plans/', { params }),

  get: (id: string) =>
    api.get<ApiResponse<MembershipPlan>>(`/plans/${id}/`),

  create: (data: PlanPayload) =>
    api.post<ApiResponse<MembershipPlan>>('/plans/', data),

  update: (id: string, data: Partial<PlanPayload>) =>
    api.patch<ApiResponse<MembershipPlan>>(`/plans/${id}/`, data),

  deactivate: (id: string) =>
    api.delete<ApiResponse<null>>(`/plans/${id}/`),
}
