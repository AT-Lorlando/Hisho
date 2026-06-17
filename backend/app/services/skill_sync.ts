import Domain from '#models/domain'
import Skill from '#models/skill'
import { generateSlug } from '../utils/slug.js'

export interface SyncSkillEntry {
  name: string
  level?: number | null
  domain?: string | null
}

/**
 * Upserts the given skills into the user's global Skill table, find-or-creating
 * each referenced Domain. Existing skills keep the highest level and get their
 * domainId filled only when it was null. Never deletes anything.
 */
export async function syncSkillsAndDomains(
  userId: number,
  skills: SyncSkillEntry[]
): Promise<{ created: string[]; errors: string[] }> {
  const created: string[] = []
  const errors: string[] = []

  for (const s of skills) {
    const name = (s.name ?? '').trim()
    if (!name) continue
    try {
      const slug = generateSlug(name)
      let domainId: number | null = null
      if (s.domain) {
        const domainSlug = generateSlug(s.domain)
        const domain = await Domain.updateOrCreate({ slug: domainSlug, userId }, { title: s.domain, userId })
        domainId = domain.id
        if (!created.includes(`domain:${domainSlug}`)) created.push(`domain:${domainSlug}`)
      }

      const existing = await Skill.query().where('userId', userId).where('slug', slug).first()
      if (!existing) {
        await Skill.create({ slug, userId, title: name, domainId, level: s.level ?? null })
        created.push(`skill:${slug}`)
      } else {
        let changed = false
        if (existing.domainId === null && domainId !== null) {
          existing.domainId = domainId
          changed = true
        }
        if (s.level != null && (existing.level === null || s.level > existing.level)) {
          existing.level = s.level
          changed = true
        }
        if (changed) await existing.save()
      }
    } catch (e: any) {
      errors.push(`Skill "${s.name}": ${e.message}`)
    }
  }

  return { created, errors }
}
