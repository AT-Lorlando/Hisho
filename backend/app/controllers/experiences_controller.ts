import type { HttpContext } from '@adonisjs/core/http'
import Experience from '#models/experience'
import { createExperienceValidator, updateExperienceValidator } from '#validators/experiences'
import { generateSlug } from '../utils/slug.js'

export default class ExperiencesController {
  async index({ response }: HttpContext) {
    const experiences = await Experience.query()
      .withCount('missions')
      .orderBy('start_date', 'desc')
    return response.ok(
      experiences.map((exp) => ({
        ...exp.serialize(),
        missionCount: Number(exp.$extras.missions_count),
      }))
    )
  }

  async show({ params, response }: HttpContext) {
    const experience = await Experience.findBy('slug', params.slug)
    if (!experience) return response.notFound({ message: 'Experience not found' })
    return response.ok(experience.serialize())
  }

  async store({ request, response }: HttpContext) {
    const data = await createExperienceValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Experience.findBy('slug', slug)
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const experience = await Experience.create({ ...data, slug })
    return response.created({ slug: experience.slug })
  }

  async update({ params, request, response }: HttpContext) {
    const experience = await Experience.findBy('slug', params.slug)
    if (!experience) return response.notFound({ message: 'Experience not found' })
    const data = await updateExperienceValidator.validate(request.body())
    experience.merge(data)
    await experience.save()
    return response.ok({ slug: experience.slug })
  }

  async destroy({ params, response }: HttpContext) {
    const experience = await Experience.findBy('slug', params.slug)
    if (!experience) return response.notFound({ message: 'Experience not found' })
    await experience.delete()
    return response.noContent()
  }
}
