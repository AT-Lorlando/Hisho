import type { HttpContext } from '@adonisjs/core/http'
import Mission, { type SkillEntry } from '#models/mission'
import Experience from '#models/experience'
import { createMissionValidator, updateMissionValidator } from '#validators/missions'
import { generateSlug } from '../utils/slug.js'
import { syncSkillsAndDomains } from '#services/skill_sync'

function serializeMission(mission: Mission) {
  const data = mission.serialize() as Record<string, any>
  delete data.experienceId
  if (mission.experienceId !== null && mission.experience) {
    data.experience = mission.experience.slug
  }
  return data
}

export default class MissionsController {
  async index({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const type = request.input('type') as string | undefined
    const experienceSlug = request.input('experience') as string | undefined

    const query = Mission.query()
      .where('userId', userId)
      .preload('experience')
      .orderBy('start_date', 'desc')

    if (type) query.where('type', type)

    if (experienceSlug) {
      const exp = await Experience.query()
        .where('userId', userId)
        .where('slug', experienceSlug)
        .first()
      if (!exp) return response.ok([])
      query.where('experience_id', exp.id)
    }

    const missions = await query
    return response.ok(missions.map(serializeMission))
  }

  async show({ auth, params, response }: HttpContext) {
    const mission = await Mission.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .preload('experience')
      .first()
    if (!mission) return response.notFound({ message: 'Mission not found' })
    return response.ok(serializeMission(mission))
  }

  async store({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const { experience: experienceSlug, domains, skills, ...rest } =
      await createMissionValidator.validate(request.body())

    let experienceId: number | null = null
    if (experienceSlug) {
      const exp = await Experience.query()
        .where('userId', userId)
        .where('slug', experienceSlug)
        .first()
      if (!exp)
        return response.unprocessableEntity({ message: `Experience '${experienceSlug}' not found` })
      experienceId = exp.id
    }

    const slug = generateSlug(rest.title)
    const exists = await Mission.query()
      .where('userId', userId)
      .where('slug', slug)
      .first()
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })

    const derivedType = experienceId ? 'pro' : 'perso'

    const skillsInput = (skills ?? []) as SkillEntry[]
    const derivedDomains = [...new Set(skillsInput.map((s) => s.domain).filter((d): d is string => !!d))].map(
      (name) => ({ name, level: 1 as const })
    )
    const finalDomains = derivedDomains.length > 0 ? derivedDomains : ((domains ?? []) as SkillEntry[])

    await Mission.create({
      ...rest,
      slug,
      userId,
      type: derivedType,
      experienceId,
      domains: finalDomains,
      skills: skillsInput,
    })

    await syncSkillsAndDomains(
      userId,
      skillsInput.map((s) => ({ name: s.name, level: s.level, domain: s.domain }))
    )

    return response.created({ slug })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const userId = auth.user!.id
    const mission = await Mission.query()
      .where('userId', userId)
      .where('slug', params.slug)
      .first()
    if (!mission) return response.notFound({ message: 'Mission not found' })

    const { experience: experienceSlug, domains, skills, ...rest } =
      await updateMissionValidator.validate(request.body())

    let experienceId: number | null = null
    if (experienceSlug) {
      const exp = await Experience.query()
        .where('userId', userId)
        .where('slug', experienceSlug)
        .first()
      if (!exp)
        return response.unprocessableEntity({ message: `Experience '${experienceSlug}' not found` })
      experienceId = exp.id
    }

    const skillsInput = (skills ?? []) as SkillEntry[]
    const derivedDomains = [...new Set(skillsInput.map((s) => s.domain).filter((d): d is string => !!d))].map(
      (name) => ({ name, level: 1 as const })
    )
    const finalDomains = derivedDomains.length > 0 ? derivedDomains : ((domains ?? []) as SkillEntry[])

    mission.merge({
      ...rest,
      type: experienceId ? 'pro' : 'perso',
      experienceId,
      domains: finalDomains,
      skills: skillsInput,
    })
    await mission.save()

    await syncSkillsAndDomains(
      userId,
      skillsInput.map((s) => ({ name: s.name, level: s.level, domain: s.domain }))
    )

    return response.ok({ slug: mission.slug })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const mission = await Mission.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!mission) return response.notFound({ message: 'Mission not found' })
    await mission.delete()
    return response.noContent()
  }
}
