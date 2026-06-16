import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/api/payments'

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  myPayments: ['payments', 'my'] as const,
  myCard: ['payments', 'my', 'card'] as const,
  myAttendance: ['payments', 'my', 'attendance'] as const,
  adminAll: ['payments', 'admin', 'all'] as const,
}

export function useMyPayments() {
  return useQuery({
    queryKey: PAYMENT_KEYS.myPayments,
    queryFn: async () => (await paymentsApi.myPayments()).data.data,
  })
}

export function useMyCard() {
  return useQuery({
    queryKey: PAYMENT_KEYS.myCard,
    queryFn: async () => (await paymentsApi.myCard()).data.data,
    retry: false,
  })
}

export function useMyAttendance() {
  return useQuery({
    queryKey: PAYMENT_KEYS.myAttendance,
    queryFn: async () => (await paymentsApi.myAttendance()).data.data,
  })
}

export function useAllPayments() {
  return useQuery({
    queryKey: PAYMENT_KEYS.adminAll,
    queryFn: async () => (await paymentsApi.allPayments()).data.data,
  })
}

export function useCreateOrder() {
  return useMutation({ mutationFn: (planId: string) => paymentsApi.createOrder(planId) })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: paymentsApi.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.myPayments })
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.myCard })
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
    },
  })
}
