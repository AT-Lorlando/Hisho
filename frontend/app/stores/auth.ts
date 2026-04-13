import { defineStore } from 'pinia'

export interface User {
  id: number
  email: string
  fullName: string | null
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.isAuthenticated = !!user
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    clearAuth() {
      this.user = null
      this.isAuthenticated = false
    },

    async login(email: string, password: string) {
      this.setLoading(true)
      try {
        const { $customFetch } = useNuxtApp()
        const response = await $customFetch<{ user: User }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.setUser(response.user)
        return response
      } finally {
        this.setLoading(false)
      }
    },

    async register(email: string, password: string, fullName?: string) {
      this.setLoading(true)
      try {
        const { $customFetch } = useNuxtApp()
        const response = await $customFetch<{ user: User }>('/auth/register', {
          method: 'POST',
          body: { email, password, fullName },
        })
        this.setUser(response.user)
        return response
      } finally {
        this.setLoading(false)
      }
    },

    async logout() {
      this.setLoading(true)
      try {
        const { $customFetch } = useNuxtApp()
        await $customFetch('/auth/logout', {
          method: 'POST',
        })
        this.clearAuth()
      } finally {
        this.setLoading(false)
      }
    },

    async fetchUser() {
      this.setLoading(true)
      try {
        const { $customFetch } = useNuxtApp()
        const response = await $customFetch<{ user: User }>('/auth/me', {
          silentError: true,
        } as any)
        this.setUser(response.user)
        return response.user
      } catch (error) {
        this.clearAuth()
        return null
      } finally {
        this.setLoading(false)
      }
    },
  },
})
