import type { ContentCounts } from '~/types/content'

export function useContentCounts() {
  const { data: counts } = useAsyncData<ContentCounts>(
    'content-counts',
    async () => {
      const [exp, skills, projects, certs] = await Promise.all([
        queryCollection('experiences').count(),
        queryCollection('skills').count(),
        queryCollection('projects').count(),
        queryCollection('certifications').count(),
      ])
      return { experiences: exp, skills, projects, certifications: certs }
    },
    { default: () => ({ experiences: 0, skills: 0, projects: 0, certifications: 0 }) }
  )

  return counts
}
