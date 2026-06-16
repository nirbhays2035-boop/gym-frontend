import api from './axios'
import type { ApiResponse } from '@/types'

export interface TicketMessage {
  id: string
  sender_name: string
  sender_role: string
  body: string
  created_at: string
}

export interface SupportTicket {
  id: string
  gym: string
  gym_name: string
  created_by_name: string
  title: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  message_count: number
  messages: TicketMessage[]
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  gym: string
  gym_name: string
  created_by_name: string
  title: string
  body: string
  is_pinned: boolean
  created_at: string
}

export const ticketsApi = {
  list: () => api.get<ApiResponse<SupportTicket[]>>('/tickets/'),
  get: (id: string) => api.get<ApiResponse<SupportTicket>>(`/tickets/${id}/`),
  create: (data: { title: string; message: string; priority?: string }) =>
    api.post<ApiResponse<SupportTicket>>('/tickets/', data),
  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<SupportTicket>>(`/tickets/${id}/`, { status }),
  reply: (id: string, body: string) =>
    api.post<ApiResponse<TicketMessage>>(`/tickets/${id}/reply/`, { body }),
}

export const announcementsApi = {
  mine: () => api.get<ApiResponse<Announcement[]>>('/gyms/announcements/mine/'),
  list: (gymId?: string) =>
    api.get<ApiResponse<Announcement[]>>('/gyms/announcements/', {
      params: gymId ? { gym: gymId } : undefined,
    }),
  create: (data: { gym: string; title: string; body: string; is_pinned?: boolean }) =>
    api.post<ApiResponse<Announcement>>('/gyms/announcements/', data),
  update: (id: string, data: Partial<{ title: string; body: string; is_pinned: boolean }>) =>
    api.patch<ApiResponse<Announcement>>(`/gyms/announcements/${id}/`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/gyms/announcements/${id}/`),
}
