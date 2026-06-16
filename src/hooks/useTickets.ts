import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementsApi, ticketsApi } from '@/api/tickets'

const KEYS = {
  tickets: ['tickets'] as const,
  detail: (id: string) => ['tickets', id] as const,
  announcements: ['announcements'] as const,
  mine: ['announcements', 'mine'] as const,
}

export function useTickets() {
  return useQuery({
    queryKey: KEYS.tickets,
    queryFn: async () => (await ticketsApi.list()).data.data,
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => (await ticketsApi.get(id)).data.data,
    enabled: Boolean(id),
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.tickets }),
  })
}

export function useReplyTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => ticketsApi.reply(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.tickets })
    },
  })
}

export function useUpdateTicketStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: string) => ticketsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.tickets })
    },
  })
}

export function useMyAnnouncements() {
  return useQuery({
    queryKey: KEYS.mine,
    queryFn: async () => (await announcementsApi.mine()).data.data,
  })
}

export function useAnnouncements(gymId?: string) {
  return useQuery({
    queryKey: [...KEYS.announcements, gymId],
    queryFn: async () => (await announcementsApi.list(gymId)).data.data,
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.announcements }),
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.announcements }),
  })
}
