import { defineNuxtPlugin, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'
import { $fetch, type FetchOptions } from 'ofetch'
import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  const extractErrorMessage = (responseData: any): string => {
    if (!responseData) return 'Une erreur est survenue'
    if (responseData.errors && Array.isArray(responseData.errors)) {
      return responseData.errors.map((err: any) => err.message).join(', ')
    }
    
    if (responseData.message) {
      return responseData.message
    }
    
    if (responseData.detail) {
      return responseData.detail
    }
    
    return 'Une erreur est survenue'
  }

  const customFetch = $fetch.create({
    baseURL: "/api/v1",
    
    onRequest({ options }) {
      const mergedHeaders = new Headers(options.headers || {})
      options.headers = mergedHeaders
    },

    async onResponseError({ response, options }) {
      const authStore = useAuthStore()
      
      // Only show toasts on client side
      if (!import.meta.client) return
      const silentError = (options as any)?.silentError === true
      
      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        console.warn('Unauthorized access - token invalid or expired')
        authStore.clearAuth()
        toast.error('Session expirée, veuillez vous reconnecter')
        if (!window.location.pathname.includes('/login')) {
          await navigateTo('/login')
        }
        return
      }
      
      // Handle 403 Forbidden responses
      if (response.status === 403) {
        console.warn('Access forbidden:', response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Accès refusé: ${message}`)
          throw new Error(message)
        }
        return
      }
      
      // Handle 422 Validation errors
      if (response.status === 422) {
        console.warn('Validation error:', response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Erreur de validation: ${message}`)
          throw new Error(message)
        }
        return
      }
      
      // Handle 404 Not Found
      if (response.status === 404) {
        console.warn('Resource not found:', response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Ressource non trouvée: ${message}`)
          throw new Error(message)
        }
        return
      }
      
      // Handle 400 Bad Request
      if (response.status === 400) {
        console.warn('Bad request:', response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Requête invalide: ${message}`)
          throw new Error(message)
        }
        return
      }
      
      // Handle 500 Server errors
      if (response.status >= 500) {
        console.error('Server error:', response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Erreur serveur: ${message}`)
          throw new Error(message)
        }
        return
      }
      
      if (response.status >= 400) {
        console.error('HTTP error:', response.status, response._data)
        if (!silentError) {
          const message = extractErrorMessage(response._data)
          toast.error(`Erreur (${response.status}): ${message}`)
          throw new Error(message)
        }
      }
    },

    onRequestError({ error }) {
      console.error('Network error:', error.message)
    }
  })

  nuxtApp.provide('customFetch', customFetch)
}) 