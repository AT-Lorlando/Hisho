import type { ContentType } from '~/types/content'

export function useContentFile(type: ContentType) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function create(data: Record<string, unknown>): Promise<{ slug: string }> {
    isLoading.value = true
    error.value = null
    try {
      return await $fetch<{ slug: string }>(`/api/v1/content/${type}`, {
        method: 'POST',
        body: data,
      })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function update(slug: string, data: Record<string, unknown>): Promise<{ slug: string }> {
    isLoading.value = true
    error.value = null
    try {
      return await $fetch<{ slug: string }>(`/api/v1/content/${type}/${slug}`, {
        method: 'PUT',
        body: data,
      })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function remove(slug: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/v1/content/${type}/${slug}`, { method: 'DELETE' })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, create, update, remove }
}
