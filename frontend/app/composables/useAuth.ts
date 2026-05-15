import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

export const useAuth = () => {
  const authStore = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      const response = await authStore.login(email, password)
      toast.success('Connexion réussie!')
      return response
    } catch (error) {
      // Error toast is already handled by custom fetch
      throw error
    }
  }

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await authStore.register(email, password, fullName)
      toast.success('Compte créé avec succès!')
      return response
    } catch (error) {
      // Error toast is already handled by custom fetch
      throw error
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      toast.success('Déconnexion réussie')
      await navigateTo('/')
    } catch (error) {
      // Error toast is already handled by custom fetch
      throw error
    }
  }

  const fetchUser = async () => {
    return await authStore.fetchUser()
  }

  const requireAuth = async () => {
    if (!authStore.isAuthenticated) {
      const user = await fetchUser()
      if (!user) {
        await navigateTo('/')
        return false
      }
    }
    return true
  }

  const requireGuest = async () => {
    if (authStore.isAuthenticated || (await fetchUser())) {
      await navigateTo('/')
      return false
    }
    return true
  }

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    login,
    register,
    logout,
    fetchUser,
    requireAuth,
    requireGuest,
  }
}
