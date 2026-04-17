import type { HttpContext } from '@adonisjs/core/http'
import Mission from '#models/mission'
import Experience from '#models/experience'
import { createMissionValidator, updateMissionValidator } from '#validators/missions'
import { generateSlug } from '../utils/slug.js'

function serializeMission(mission: Mission) {
  const data = mission.serialize() as Record<string, any>
  delete data.experienceId
  if (mission.experienceId !== null && mission.experience) {
    data.experience = mission.experience.slug
  }
  return data
}

export default class MissionsController {
  async index({ request, response }: HttpContext) {
    const type = request.input('type') as string | undefined
    const experienceSlug = request.input('experience') as string | undefined

    const query = Mission.query().preload('experience').orderBy('start_date', 'desc')

    if (type) query.where('type', type)

    if (experienceSlug) {
      const exp = await Experience.findBy('slug', experienceSlug)
      if (!exp) return response.ok([])
      query.where('experience_id', exp.id)
    }

    const missions = await query
    return response.ok(missions.map(serializeMission))
  }

  async show({ params, response }: HttpContext) {
    const mission = await Mission.query()
      .where('slug', params.slug)
      .preload('experience')
      .first()
    if (!mission) return response.notFound({ message: 'Mission not found' })
    return response.ok(serializeMission(mission))
  }

  async store({ request, response }: HttpContext) {
    const { experience: experienceSlug, domains, skills, ...rest } =
      await createMissionValidator.validate(request.body())

    let experienceId: number | null = null
    if (experienceSlug) {
      const exp = await Experience.findBy('slug', experienceSlug)
      if (!exp)
        return response.unprocessableEntity({ message: `Experience '${experienceSlug}' not found` })
      experienceId = exp.id
    }

    const slug = generateSlug(rest.title)
    const exists = await Mission.findBy('slug', slug)
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })

    await Mission.create({
      ...rest,
      slug,
      experienceId,
      domains: domains ?? [],
      skills: skills ?? [],
    })
    return response.created({ slug })
  }

  async update({ params, request, response }: HttpContext) {
    const mission = await Mission.findBy('slug', params.slug)
    if (!mission) return response.notFound({ message: 'Mission not found' })

    const { experience: experienceSlug, domains, skills, ...rest } =
      await updateMissionValidator.validate(request.body())

    let experienceId: number | null = null
    if (experienceSlug) {
      const exp = await Experience.findBy('slug', experienceSlug)
      if (!exp)
        return response.unprocessableEntity({ message: `Experience '${experienceSlug}' not found` })
      experienceId = exp.id
    }

    mission.merge({
      ...rest,
      experienceId,
      domains: domains ?? [],
      skills: skills ?? [],
    })
    await mission.save()
    return response.ok({ slug: mission.slug })
  }

  async destroy({ params, response }: HttpContext) {
    const mission = await Mission.findBy('slug', params.slug)
    if (!mission) return response.notFound({ message: 'Mission not found' })
    await mission.delete()
    return response.noContent()
  }
}
