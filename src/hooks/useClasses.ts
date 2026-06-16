import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classesApi, type ClassPayload } from '@/api/classes'

const KEYS = {
  all: ['classes'] as const,
  adminList: (params?: object) => ['classes', 'admin', params] as const,
  myClasses: ['classes', 'my'] as const,
  myBookings: ['classes', 'my', 'bookings'] as const,
}

export function useAdminClasses(params?: { gym?: string }) {
  return useQuery({
    queryKey: KEYS.adminList(params),
    queryFn: async () => (await classesApi.list(params)).data.data,
  })
}

export function useMyClasses() {
  return useQuery({
    queryKey: KEYS.myClasses,
    queryFn: async () => (await classesApi.myClasses()).data.data,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: KEYS.myBookings,
    queryFn: async () => (await classesApi.myBookings()).data.data,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClassPayload) => classesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useBookClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (classId: string) => classesApi.book(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.myClasses })
      queryClient.invalidateQueries({ queryKey: KEYS.myBookings })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (classId: string) => classesApi.cancelBooking(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.myClasses })
      queryClient.invalidateQueries({ queryKey: KEYS.myBookings })
    },
  })
}

export function useCancelClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classesApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  })
}
