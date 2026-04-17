import type { Mission, Domain, Skill } from '~/types/content'

export interface AggregatedEntry {
  name: string
  slug: string
  documented: boolean
  missionCount: number
  metadata?: Domain | Skill
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useAggregatedDomains() {
  const { data: missions } = useAsyncData<Mission[]>(
    'agg-missions-domains',
    () => $fetch<Mission[]>('/api/v1/missions'),
    { default: () => [] }
  )

  const { data: domainDocs, refresh: refreshDomainDocs } = useAsyncData<Domain[]>(
    'agg-domain-docs',
    () => $fetch<Domain[]>('/api/v1/domains'),
    { default: () => [] }
  )

  const aggregated = computed<AggregatedEntry[]>(() => {
    const missionList = missions.value ?? []
    const docs = domainDocs.value ?? []

    const countMap = new Map<string, number>()
    for (const mission of missionList) {
      for (const d of mission.domains ?? []) {
        countMap.set(d, (countMap.get(d) ?? 0) + 1)
      }
    }

    const allNames = new Set<string>()
    for (const name of countMap.keys()) allNames.add(name)
    for (const doc of docs) allNames.add(doc.title)

    const result: AggregatedEntry[] = []
    for (const name of allNames) {
      const doc = docs.find((d) => d.title.toLowerCase() === name.toLowerCase())
      result.push({
        name,
        slug: doc?.slug ?? toSlug(name),
        documented: !!doc,
        missionCount: countMap.get(name) ?? 0,
        metadata: doc,
      })
    }

    return result.sort((a, b) => {
      if (a.documented !== b.documented) return a.documented ? -1 : 1
      if (b.missionCount !== a.missionCount) return b.missionCount - a.missionCount
      return a.name.localeCompare(b.name)
    })
  })

  return { aggregated, refreshDomainDocs }
}

export function useAggregatedSkills() {
  const { data: missions } = useAsyncData<Mission[]>(
    'agg-missions-skills',
    () => $fetch<Mission[]>('/api/v1/missions'),
    { default: () => [] }
  )

  const { data: skillDocs, refresh: refreshSkillDocs } = useAsyncData<Skill[]>(
    'agg-skill-docs',
    () => $fetch<Skill[]>('/api/v1/skills'),
    { default: () => [] }
  )

  const aggregated = computed<AggregatedEntry[]>(() => {
    const missionList = missions.value ?? []
    const docs = skillDocs.value ?? []

    const countMap = new Map<string, number>()
    for (const mission of missionList) {
      for (const s of mission.skills ?? []) {
        countMap.set(s, (countMap.get(s) ?? 0) + 1)
      }
    }

    const allNames = new Set<string>()
    for (const name of countMap.keys()) allNames.add(name)
    for (const doc of docs) allNames.add(doc.title)

    const result: AggregatedEntry[] = []
    for (const name of allNames) {
      const doc = docs.find((d) => d.title.toLowerCase() === name.toLowerCase())
      result.push({
        name,
        slug: doc?.slug ?? toSlug(name),
        documented: !!doc,
        missionCount: countMap.get(name) ?? 0,
        metadata: doc,
      })
    }

    return result.sort((a, b) => {
      if (a.documented !== b.documented) return a.documented ? -1 : 1
      if (b.missionCount !== a.missionCount) return b.missionCount - a.missionCount
      return a.name.localeCompare(b.name)
    })
  })

  return { aggregated, refreshSkillDocs }
}
