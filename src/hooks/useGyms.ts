import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gymsApi, type GymPayload } from '@/api/gyms'

export const GYM_KEYS = {
  all: ['gyms'] as const,
  list: (params?: object) => ['gyms', 'list', params] as const,
  detail: (id: string) => ['gyms', 'detail', id] as const,
  staff: (id: string) => ['gyms', 'staff', id] as const,
}

function extractList(data: Awaited<ReturnType<typeof gymsApi.list>>['data']) {
  if ('data' in data && Array.isArray(data.data)) return data.data
  if ('results' in data && Array.isArray(data.results)) return data.results
  return []
}

export function useGyms(params?: { search?: string }) {
  return useQuery({
    queryKey: GYM_KEYS.list(params),
    queryFn: async () => {
      const { data } = await gymsApi.list(params)
      return extractList(data)
    },
  })
}

export function useGym(id: string) {
  return useQuery({
    queryKey: GYM_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await gymsApi.get(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateGym() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GymPayload) => gymsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GYM_KEYS.all }),
  })
}

export function useUpdateGym(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GymPayload) => gymsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GYM_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: GYM_KEYS.all })
    },
  })
}

export function useDeactivateGym() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gymsApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GYM_KEYS.all }),
  })
}

export function useGymStaff(gymId: string) {
  return useQuery({
    queryKey: GYM_KEYS.staff(gymId),
    queryFn: async () => {
      const { data } = await gymsApi.getStaff(gymId)
      return data.data
    },
    enabled: !!gymId,
  })
}

export function useAddStaff(gymId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; designation: string }) =>
      gymsApi.addStaff(gymId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GYM_KEYS.staff(gymId) })
      qc.invalidateQueries({ queryKey: GYM_KEYS.detail(gymId) })
    },
  })
}

export function useRemoveStaff(gymId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (staffId: string) => gymsApi.removeStaff(gymId, staffId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GYM_KEYS.staff(gymId) })
      qc.invalidateQueries({ queryKey: GYM_KEYS.detail(gymId) })
    },
  })
}
