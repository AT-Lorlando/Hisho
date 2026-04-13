import type { UserProfile } from '~/types/content'

export function useProfile() {
  const profile = useState<UserProfile | null>('profile', () => null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadProfile() {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<UserProfile>('/api/v1/profile')
      profile.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function update(data: Partial<UserProfile>) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await $fetch<UserProfile>('/api/v1/profile', {
        method: 'PUT',
        body: data,
      })
      profile.value = updated
      return updated
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function compile() {
    isLoading.value = true
    error.value = null
    try {
      return await $fetch('/api/v1/profile/compile', { method: 'POST' })
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { profile, isLoading, error, loadProfile, update, compile }
}
