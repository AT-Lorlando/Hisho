import type { HttpContext } from '@adonisjs/core/http'
import { extractValidator, importValidator } from '#validators/ai'
import aiService from '#services/ai_service'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Domain from '#models/domain'
import Skill from '#models/skill'
import type { SkillEntry } from '#models/mission'
import { generateSlug } from '../utils/slug.js'

/** Normalize a skill/domain entry: accepts string, {name}, or {name, level} */
function normalizeEntry(entry: unknown): { name: string; level: number } {
  if (typeof entry === 'string') return { name: entry, level: 3 }
  if (entry && typeof entry === 'object') {
    const e = entry as Record<string, unknown>
    return { name: String(e.name ?? ''), level: Number(e.level ?? 3) }
  }
  return { name: String(entry), level: 3 }
}

function normalizeMission(m: Record<string, unknown>) {
  if (Array.isArray(m.skills)) m.skills = m.skills.map(normalizeEntry)
  if (Array.isArray(m.domains)) m.domains = m.domains.map(normalizeEntry)
}

function normalizeImportBody(body: Record<string, unknown>) {
  for (const exp of (body.experiences as Record<string, unknown>[] | undefined) ?? []) {
    for (const mission of (exp.missions as Record<string, unknown>[] | undefined) ?? []) {
      normalizeMission(mission)
    }
  }
  for (const mission of (body.missions as Record<string, unknown>[] | undefined) ?? []) {
    normalizeMission(mission)
  }
}

export default class AiController {
  async extract({ request, response }: HttpContext) {
    const { message } = await request.validateUsing(extractValidator)
    try {
      const extracted = await aiService.extract(message)
      return response.ok(extracted)
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        return response.unprocessableEntity({
          message: 'L\'IA n\'a pas pu produire un JSON valide. Télécharge le brut pour le corriger manuellement.',
          rawJson: (e as any).rawCandidate ?? null,
        })
      }
      return response.serviceUnavailable({ message: e.message ?? 'AI service error' })
    }
  }

  async importProfile({ request, response }: HttpContext) {
    const body = request.body() as Record<string, unknown>
    normalizeImportBody(body)
    const data = await importValidator.validate(body)

    const created: string[] = []
    const errors: string[] = []

    // Import experiences + their nested missions
    for (const exp of data.experiences ?? []) {
      try {
        const expSlug = generateSlug(exp.title)
        const existing = await Experience.findBy('slug', expSlug)
        if (existing) {
          errors.push(`Experience "${exp.title}" (slug: ${expSlug}) already exists — skipped`)
          continue
        }
        const newExp = await Experience.create({
          slug: expSlug,
          title: exp.title,
          role: exp.role ?? null,
          client: exp.client ?? null,
          type: exp.type ?? 'freelance',
          startDate: exp.startDate ?? null,
          endDate: exp.endDate ?? null,
          body: exp.body ?? null,
        })
        created.push(`experience:${expSlug}`)

        for (const mission of exp.missions ?? []) {
          try {
            const mSlug = generateSlug(mission.title)
            const existingM = await Mission.findBy('slug', mSlug)
            if (existingM) {
              errors.push(`Mission "${mission.title}" (slug: ${mSlug}) already exists — skipped`)
              continue
            }
            await Mission.create({
              slug: mSlug,
              title: mission.title,
              type: 'pro',
              experienceId: newExp.id,
              client: mission.client ?? null,
              startDate: mission.startDate ?? null,
              endDate: mission.endDate ?? null,
              domains: (mission.domains ?? []) as SkillEntry[],
              skills: (mission.skills ?? []) as SkillEntry[],
              body: mission.body ?? null,
            })
            created.push(`mission:${mSlug}`)
          } catch (e: any) {
            errors.push(`Mission "${mission.title}": ${e.message}`)
          }
        }
      } catch (e: any) {
        errors.push(`Experience "${exp.title}": ${e.message}`)
      }
    }

    // Import personal missions (type=perso)
    for (const mission of data.missions ?? []) {
      try {
        const mSlug = generateSlug(mission.title)
        const existing = await Mission.findBy('slug', mSlug)
        if (existing) {
          errors.push(`Mission "${mission.title}" (slug: ${mSlug}) already exists — skipped`)
          continue
        }
        await Mission.create({
          slug: mSlug,
          title: mission.title,
          type: 'perso',
          experienceId: null,
          client: null,
          startDate: mission.startDate ?? null,
          endDate: mission.endDate ?? null,
          domains: (mission.domains ?? []) as SkillEntry[],
          skills: (mission.skills ?? []) as SkillEntry[],
          body: mission.body ?? null,
        })
        created.push(`mission:${mSlug}`)
      } catch (e: any) {
        errors.push(`Mission "${mission.title}": ${e.message}`)
      }
    }

    // Collect all domains and skills across every imported mission
    const allMissions = [
      ...(data.experiences ?? []).flatMap((e) => e.missions ?? []),
      ...(data.missions ?? []),
    ]

    const domainNames = new Set<string>()
    const skillNames = new Set<string>()
    for (const m of allMissions) {
      for (const d of m.domains ?? []) domainNames.add(d.name)
      for (const s of m.skills ?? []) skillNames.add(s.name)
    }

    // Upsert domains
    for (const name of domainNames) {
      try {
        const slug = generateSlug(name)
        const domain = await Domain.updateOrCreate({ slug }, { title: name })
        if (!created.includes(`domain:${slug}`)) created.push(`domain:${slug}`)
        // Link skills that were just queued to this domain by matching name -> domainId
        // (best-effort: only if a skill was created in this same import)
        void domain // used below in skill upsert
      } catch (e: any) {
        errors.push(`Domain "${name}": ${e.message}`)
      }
    }

    // Upsert skills — try to assign domainId when there's only one domain on the parent mission
    for (const m of allMissions) {
      const singleDomainId =
        (m.domains ?? []).length === 1
          ? (await Domain.findBy('slug', generateSlug(m.domains![0].name)))?.id ?? null
          : null

      for (const s of m.skills ?? []) {
        try {
          const slug = generateSlug(s.name)
          const existing = await Skill.findBy('slug', slug)
          if (!existing) {
            await Skill.create({ slug, title: s.name, domainId: singleDomainId, level: s.level ?? null })
            if (!created.includes(`skill:${slug}`)) created.push(`skill:${slug}`)
          } else {
            let changed = false
            if (existing.domainId === null && singleDomainId !== null) {
              existing.domainId = singleDomainId
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
    }

    return response.ok({ created, errors })
  }
}
