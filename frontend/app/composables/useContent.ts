import type { ContentType, Domain, Experience, Skill, Project, Certification } from '~/types/content'

type CollectionItem = Domain | Experience | Skill | Project | Certification

export function useContent<T extends CollectionItem>(type: ContentType) {
  const { data: items, refresh } = useAsyncData<T[]>(
    `content-${type}`,
    () => queryCollection(type as any).all() as Promise<T[]>,
    { default: () => [] }
  )

  const count = computed(() => items.value?.length ?? 0)

  return { items, count, refresh }
}
