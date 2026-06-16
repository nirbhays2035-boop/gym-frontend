import api from './axios'
import type { ApiResponse } from '@/types'

export interface GymClass {
  id: string
  gym: string
  title: string
  description: string
  trainer: string
  starts_at: string
  ends_at: string
  capacity: number
  bookings_count: number
  spots_remaining: number
  is_full: boolean
  is_past: boolean
  member_booked: boolean
  is_active: boolean
  created_at: string
}

export interface ClassBooking {
  id: string
  gym_class: string
  class_title: string
  class_starts: string
  class_ends: string
  trainer: string
  gym_name: string
  member: string
  member_name: string
  status: 'confirmed' | 'cancelled' | 'waitlisted'
  booked_at: string
}

export interface ClassPayload {
  gym: string
  title: string
  description?: string
  trainer?: string
  starts_at: string
  ends_at: string
  capacity: number
}

export const classesApi = {
  list: (params?: { gym?: string; upcoming?: boolean }) =>
    api.get<ApiResponse<GymClass[]>>('/classes/', { params }),
  create: (data: ClassPayload) => api.post<ApiResponse<GymClass>>('/classes/', data),
  update: (id: string, data: Partial<ClassPayload>) =>
    api.patch<ApiResponse<GymClass>>(`/classes/${id}/`, data),
  cancel: (id: string) => api.delete<ApiResponse<null>>(`/classes/${id}/`),
  roster: (classId: string) =>
    api.get<ApiResponse<ClassBooking[]>>(`/classes/${classId}/roster/`),
  myClasses: () => api.get<ApiResponse<GymClass[]>>('/classes/my/'),
  myBookings: () => api.get<ApiResponse<ClassBooking[]>>('/classes/my/bookings/'),
  book: (classId: string) =>
    api.post<ApiResponse<ClassBooking>>(`/classes/${classId}/book/`),
  cancelBooking: (classId: string) =>
    api.patch<ApiResponse<null>>(`/classes/${classId}/cancel/`),
}
