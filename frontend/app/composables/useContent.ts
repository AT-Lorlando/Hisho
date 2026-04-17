import type { ContentType } from '~/types/content'

export function useContent<T>(type: ContentType) {
  const { data: items, refresh } = useAsyncData<T[]>(
    `content-${type}`,
    () => $fetch<T[]>(`/api/v1/${type}`),
    { default: () => [] }
  )

  const count = computed(() => items.value?.length ?? 0)

  return { items, count, refresh }
}
