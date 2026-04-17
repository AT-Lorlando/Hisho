import type { ContentCounts } from '~/types/content'

export function useContentCounts() {
  const { data: counts } = useAsyncData<ContentCounts>(
    'content-counts',
    async () => {
      const [exp, skills, missions, certs, domains] = await Promise.all([
        queryCollection('experiences').count(),
        queryCollection('skills').count(),
        queryCollection('missions').count(),
        queryCollection('certifications').count(),
        queryCollection('domains').count(),
      ])
      return { experiences: exp, skills, missions, certifications: certs, domains }
    },
    { default: () => ({ experiences: 0, skills: 0, missions: 0, certifications: 0, domains: 0 }) }
  )

  return counts
}
