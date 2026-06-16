import api from './axios'
import type { ApiResponse } from '@/types'

export interface RazorpayOrder {
  order_id: string
  amount: number
  currency: string
  key_id: string
  payment_id: string
  plan_name: string
  member_name: string
  member_email: string
  member_phone: string
}

export interface Payment {
  id: string
  member: string
  member_name: string
  subscription: string | null
  plan_name: string | null
  amount: string
  currency: string
  razorpay_order_id: string
  razorpay_payment_id: string
  status: 'created' | 'captured' | 'failed' | 'refunded'
  invoice_number: string
  invoice_url: string
  created_at: string
}

export interface MembershipCard {
  id: string
  member_name: string
  member_code: string
  gym_name: string
  plan_name: string | null
  qr_code_url: string
  card_url: string
  generated_at: string
}

export interface AttendanceLog {
  id: string
  gym_name: string
  check_in: string
  check_out: string | null
  logged_by: 'qr' | 'manual'
  duration_minutes: number | null
}

export const paymentsApi = {
  createOrder: (planId: string) =>
    api.post<ApiResponse<RazorpayOrder>>('/payments/create-order/', { plan_id: planId }),
  verifyPayment: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => api.post<ApiResponse<Payment>>('/payments/verify/', data),
  myPayments: () => api.get<ApiResponse<Payment[]>>('/payments/my/'),
  myCard: () => api.get<ApiResponse<MembershipCard>>('/payments/my/card/'),
  allPayments: () => api.get<ApiResponse<Payment[]>>('/payments/all/'),
  myAttendance: () => api.get<ApiResponse<AttendanceLog[]>>('/payments/my/attendance/'),
  qrCheckin: (memberId: string, gymId: string) =>
    api.post<ApiResponse<{ member_name: string; member_code: string; check_in: string; gym: string }>>(
      '/payments/qr-checkin/',
      { member_id: memberId, gym_id: gymId },
    ),
}
