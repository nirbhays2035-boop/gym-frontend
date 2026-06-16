import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { membersApi, type CreateMemberPayload } from '@/api/members'
import type { MemberListItem, MemberDetail, Subscription } from '@/types'

export const MEMBER_KEYS = {
  all: ['members'] as const,
  list: (params?: object) => ['members', 'list', params] as const,
  detail: (id: string) => ['members', 'detail', id] as const,
  subscriptions: (id: string) => ['members', 'subscriptions', id] as const,
}

export function useMembers(params?: { search?: string; gym?: string; subscription_status?: string }) {
  return useQuery<MemberListItem[]>({
    queryKey: MEMBER_KEYS.list(params),
    queryFn: async () => {
      const { data } = (await membersApi.list(params)) as any
      if (data && 'data' in data && Array.isArray(data.data)) return data.data
      if (data && 'results' in data && Array.isArray(data.results)) return data.results
      return Array.isArray(data) ? data : []
    },
  })
}

export function useMember(id: string) {
  return useQuery<MemberDetail>({
    queryKey: MEMBER_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await membersApi.get(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMemberPayload) => membersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEMBER_KEYS.all }),
  })
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateMemberPayload>) => membersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEMBER_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: MEMBER_KEYS.all })
    },
  })
}

export function useDeactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => membersApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEMBER_KEYS.all }),
  })
}

export function useAssignPlan(memberId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => membersApi.assignPlan(memberId, planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEMBER_KEYS.detail(memberId) })
      qc.invalidateQueries({ queryKey: MEMBER_KEYS.all })
    },
  })
}

export function useMemberSubscriptions(memberId: string) {
  return useQuery<Subscription[]>({
    queryKey: MEMBER_KEYS.subscriptions(memberId),
    queryFn: async () => {
      const { data } = await membersApi.getSubscriptions(memberId)
      return data.data
    },
    enabled: !!memberId,
  })
}

export function useMyProfile() {
  return useQuery<MemberDetail>({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data } = await membersApi.myProfile()
      return data.data
    },
  })
}

