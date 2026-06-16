import api from './axios'
import type { ApiResponse, AuthTokens, User } from '@/types'

export const authApi = {
  register: (data: {
    email: string
    full_name: string
    phone?: string
    password: string
  }) => api.post<ApiResponse<AuthTokens>>('/auth/register/', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login/', data),

  logout: (refresh: string) =>
    api.post<ApiResponse<null>>('/auth/logout/', { refresh }),

  me: () => api.get<ApiResponse<User>>('/auth/me/'),

  updateMe: (data: Partial<Pick<User, 'full_name' | 'phone'>>) =>
    api.patch<ApiResponse<User>>('/auth/me/', data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post<ApiResponse<null>>('/auth/change-password/', data),
}
