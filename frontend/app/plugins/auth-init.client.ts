import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Only run on client side and only fetch user if not already authenticated
  if (!authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
})
