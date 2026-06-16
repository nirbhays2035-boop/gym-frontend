import api from './axios'
import type { ApiResponse } from '@/types'

export interface Amenity {
  id: string
  icon_slug: string
  label: string
}

export interface GymImage {
  id: string
  url: string
  caption: string
  order: number
}

export interface StaffMember {
  id: string
  user: { id: string; email: string; full_name: string; phone: string }
  designation: string
  joined_at: string
  is_active: boolean
}

export interface GymListItem {
  id: string
  name: string
  slug: string
  city: string
  state: string
  phone: string
  email: string
  logo_url: string
  cover_image: string | null
  is_active: boolean
  amenity_count: number
  image_count: number
  staff_count: number
  created_at: string
}

export interface GymDetail extends GymListItem {
  address: string
  pincode: string
  description: string
  website: string
  operating_hours: Record<string, string>
  amenities: Amenity[]
  images: GymImage[]
}

export type GymPayload = Partial<Omit<GymDetail, 'id' | 'slug' | 'amenities' | 'images' | 'cover_image' | 'amenity_count' | 'image_count' | 'staff_count' | 'created_at'>>

export const gymsApi = {
  list: (params?: { search?: string; ordering?: string }) =>
    api.get<ApiResponse<GymListItem[]> | { count: number; next: string | null; previous: string | null; results: GymListItem[] }>('/gyms/', { params }),

  get: (id: string) =>
    api.get<ApiResponse<GymDetail>>(`/gyms/${id}/`),

  create: (data: GymPayload) =>
    api.post<ApiResponse<GymDetail>>('/gyms/', data),

  update: (id: string, data: GymPayload) =>
    api.patch<ApiResponse<GymDetail>>(`/gyms/${id}/`, data),

  deactivate: (id: string) =>
    api.delete<ApiResponse<null>>(`/gyms/${id}/`),

  getStaff: (gymId: string) =>
    api.get<ApiResponse<StaffMember[]>>(`/gyms/${gymId}/staff/`),

  addStaff: (gymId: string, data: { email: string; designation: string }) =>
    api.post<ApiResponse<StaffMember>>(`/gyms/${gymId}/staff/add/`, data),

  removeStaff: (gymId: string, staffId: string) =>
    api.patch<ApiResponse<null>>(`/gyms/${gymId}/staff/${staffId}/remove/`),

  updateAmenities: (gymId: string, amenities: Omit<Amenity, 'id'>[]) =>
    api.put<ApiResponse<Amenity[]>>(`/gyms/${gymId}/amenities/`, { amenities }),

  addImage: (gymId: string, data: Omit<GymImage, 'id'>) =>
    api.post<ApiResponse<GymImage>>(`/gyms/${gymId}/images/`, data),

  deleteImage: (gymId: string, imageId: string) =>
    api.delete<ApiResponse<null>>(`/gyms/${gymId}/images/${imageId}/`),
}
