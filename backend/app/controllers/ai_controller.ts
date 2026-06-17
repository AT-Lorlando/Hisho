import { PassThrough } from 'node:stream'
import type { HttpContext } from '@adonisjs/core/http'
import { extractValidator, importValidator } from '#validators/ai'
import aiService from '#services/ai_service'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Domain from '#models/domain'
import type { SkillEntry } from '#models/mission'
import { generateSlug } from '../utils/slug.js'
import { syncSkillsAndDomains } from '#services/skill_sync'

/** Normalize a skill/domain entry: accepts string, {name}, or {name, level} */
function normalizeEntry(entry: unknown): { name: string; level: number } {
  if (typeof entry === 'string') return { name: entry, level: 3 }
  if (entry && typeof entry === 'object') {
    const e = entry as Record<string, unknown>
    return { name: String(e.name ?? ''), level: Number(e.level ?? 3) }
  }
  return { name: String(entry), level: 3 }
}

/** Normalize a skill entry: accepts string, {name}, {name, level}, or {name, level, domain} */
function normalizeSkillEntry(entry: unknown): { name: string; level: number; domain: string | null } {
  if (typeof entry === 'string') return { name: entry, level: 3, domain: null }
  if (entry && typeof entry === 'object') {
    const e = entry as Record<string, unknown>
    const domain = e.domain == null || e.domain === '' ? null : String(e.domain)
    return { name: String(e.name ?? ''), level: Number(e.level ?? 3), domain }
  }
  return { name: String(entry), level: 3, domain: null }
}

function normalizeMission(m: Record<string, unknown>) {
  if (Array.isArray(m.skills)) m.skills = m.skills.map(normalizeSkillEntry)
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

    const pass = new PassThrough()
    pass.on('error', () => {}) // ignore EPIPE when client disconnects early

    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache')
    response.header('Connection', 'keep-alive')
    response.header('X-Accel-Buffering', 'no')

    const send = (payload: object) => {
      if (!pass.destroyed) pass.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    void (async () => {
      try {
        const result = await aiService.extract(message, (delta, isThinking) => {
          send({ type: 'chunk', content: delta, isThinking })
        })
        send({ type: 'done', result })
      } catch (e: any) {
        if (e instanceof SyntaxError) {
          send({
            type: 'error',
            message: "L'IA n'a pas pu produire un JSON valide. Télécharge le brut pour le corriger manuellement.",
            rawJson: (e as any).rawCandidate ?? null,
          })
        } else {
          send({ type: 'error', message: e.message ?? 'AI service error' })
        }
      } finally {
        pass.end()
      }
    })()

    return response.stream(pass)
  }

  async importProfile({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const body = request.body() as Record<string, unknown>
    normalizeImportBody(body)
    const data = await importValidator.validate(body)

    const created: string[] = []
    const errors: string[] = []

    // Import experiences + their nested missions
    for (const exp of data.experiences ?? []) {
      try {
        const expSlug = generateSlug(exp.title)
        const existing = await Experience.query()
          .where('userId', userId)
          .where('slug', expSlug)
          .first()
        if (existing) {
          errors.push(`Experience "${exp.title}" (slug: ${expSlug}) already exists — skipped`)
          continue
        }
        const newExp = await Experience.create({
          slug: expSlug,
          userId,
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
            const existingM = await Mission.query()
              .where('userId', userId)
              .where('slug', mSlug)
              .first()
            if (existingM) {
              errors.push(`Mission "${mission.title}" (slug: ${mSlug}) already exists — skipped`)
              continue
            }
            await Mission.create({
              slug: mSlug,
              userId,
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
        const existing = await Mission.query().where('userId', userId).where('slug', mSlug).first()
        if (existing) {
          errors.push(`Mission "${mission.title}" (slug: ${mSlug}) already exists — skipped`)
          continue
        }
        await Mission.create({
          slug: mSlug,
          userId,
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
    for (const m of allMissions) {
      for (const d of m.domains ?? []) domainNames.add(d.name)
    }

    // Upsert domains — scoped to userId
    for (const name of domainNames) {
      try {
        const slug = generateSlug(name)
        const domain = await Domain.updateOrCreate({ slug, userId }, { title: name, userId })
        if (!created.includes(`domain:${slug}`)) created.push(`domain:${slug}`)
        void domain
      } catch (e: any) {
        errors.push(`Domain "${name}": ${e.message}`)
      }
    }

    // Upsert skills into the user's global skills (per-skill domain, with single-domain fallback).
    const skillsForSync = allMissions.flatMap((m) => {
      const singleDomainName = (m.domains ?? []).length === 1 ? m.domains![0].name : null
      return (m.skills ?? []).map((s) => ({
        name: s.name,
        level: s.level,
        domain: s.domain ?? singleDomainName,
      }))
    })
    const sync = await syncSkillsAndDomains(userId, skillsForSync)
    created.push(...sync.created.filter((c) => !created.includes(c)))
    errors.push(...sync.errors)

    return response.ok({ created, errors })
  }
}
