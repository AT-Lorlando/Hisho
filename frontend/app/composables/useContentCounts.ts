import type { ContentCounts } from '~/types/content'

export function useContentCounts() {
  const { data: counts } = useAsyncData<ContentCounts>(
    'content-counts',
    () => $fetch<ContentCounts>('/api/v1/counts'),
    {
      default: () => ({
        experiences: 0,
        skills: 0,
        missions: 0,
        certifications: 0,
        domains: 0,
      }),
    }
  )

  return counts
}
