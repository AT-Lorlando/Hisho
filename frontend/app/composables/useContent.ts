import type { ContentType, Domain, Experience, Mission, Skill, Certification } from '~/types/content'

type CollectionItem = Domain | Experience | Mission | Skill | Certification

export function useContent<T extends CollectionItem>(type: ContentType) {
  const { data: rawItems, refresh } = useAsyncData<T[]>(
    `content-${type}`,
    () => queryCollection(type as any).all() as Promise<T[]>,
    { default: () => [] }
  )

  // Derive slug from path if not present in frontmatter
  const items = computed(() =>
    (rawItems.value ?? []).map((item: any) => ({
      ...item,
      slug: item.slug ?? item.path?.split('/').pop() ?? '',
    })) as T[]
  )

  const count = computed(() => items.value.length)

  return { items, count, refresh }
}
