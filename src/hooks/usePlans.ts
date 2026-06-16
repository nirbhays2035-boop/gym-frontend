import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { plansApi, type PlanPayload } from '@/api/plans'
import type { MembershipPlan } from '@/types'

export const PLAN_KEYS = {
  all: ['plans'] as const,
  list: (params?: object) => ['plans', 'list', params] as const,
  detail: (id: string) => ['plans', 'detail', id] as const,
}

export function usePlans(params?: { gym?: string; search?: string }) {
  return useQuery<MembershipPlan[]>({
    queryKey: PLAN_KEYS.list(params),
    queryFn: async () => {
      const { data } = (await plansApi.list(params)) as any
      if (data && 'data' in data && Array.isArray(data.data)) return data.data
      if (data && 'results' in data && Array.isArray(data.results)) return data.results
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanPayload) => plansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAN_KEYS.all }),
  })
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PlanPayload>) => plansApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAN_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: PLAN_KEYS.all })
    },
  })
}

export function useDeactivatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plansApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAN_KEYS.all }),
  })
}
