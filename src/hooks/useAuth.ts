import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      const { user, access, refresh } = data.data
      setAuth(user, access, refresh)
      // Role-based redirect
      if (user.role === 'super_admin') navigate('/super-admin')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/member')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      const { user, access, refresh } = data.data
      setAuth(user, access, refresh)
      navigate('/member')
    },
  })
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken!),
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authApi.me()
      setUser(data.data)
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useUpdateMe() {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: ({ data }) => {
      setUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}

